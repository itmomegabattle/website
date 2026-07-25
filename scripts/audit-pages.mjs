import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = "http://127.0.0.1:4173";
const returningVisit = process.argv.includes("--returning");
const outputArgument = process.argv.find((argument) => argument.startsWith("--output="));
const outputPath = outputArgument?.slice("--output=".length);
const routesArgument = process.argv.find((argument) => argument.startsWith("--routes="));
const profilesArgument = process.argv.find((argument) => argument.startsWith("--profiles="));
const preloaderStorageKey = "mb:preloader:version";
const preloaderStorageVersion = "2026-07-25-optimized";
const routes = routesArgument
  ? routesArgument.slice("--routes=".length).split(",").filter(Boolean)
  : ["/", "/people", "/faculties", "/history", "/partners", "/events", "/ratings", "/auth"];
const allProfiles = [
  { name: "desktop", width: 1440, height: 900, mobile: false, scale: 1 },
  { name: "mobile", width: 390, height: 844, mobile: true, scale: 1 },
];
const selectedProfiles = profilesArgument
  ? new Set(profilesArgument.slice("--profiles=".length).split(",").filter(Boolean))
  : null;
const profiles = selectedProfiles
  ? allProfiles.filter((profile) => selectedProfiles.has(profile.name))
  : allProfiles;
function launchChrome(port, runId) {
  return spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/imb-page-audit-${runId}`,
    "--remote-allow-origins=*",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-component-update",
    "--mute-audio",
    "about:blank",
  ], { stdio: "ignore" });
}

async function waitForChrome(port) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) return response.json();
    } catch {}
    await delay(100);
  }
  throw new Error("Chrome DevTools Protocol did not start");
}

function connect(url) {
  const socket = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else {
      listeners.forEach((listener) => listener(message));
    }
  });
  return {
    ready: new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    }),
    send(method, params = {}) {
      id += 1;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    on(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close() {
      socket.close();
    },
  };
}

async function auditPage(cdp, route, profile) {
  await cdp.send("Network.clearBrowserCache");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: profile.width,
    height: profile.height,
    deviceScaleFactor: profile.scale,
    mobile: profile.mobile,
    screenWidth: profile.width,
    screenHeight: profile.height,
  });
  if (returningVisit) {
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `try { localStorage.setItem(${JSON.stringify(preloaderStorageKey)}, ${JSON.stringify(preloaderStorageVersion)}); } catch {}`,
    });
  }

  const resources = new Map();
  const errors = [];
  let loaded;
  const loadedPromise = new Promise((resolve) => { loaded = resolve; });
  const unsubscribe = cdp.on((message) => {
    if (message.method === "Network.responseReceived") {
      const { requestId, response, type } = message.params;
      resources.set(requestId, {
        url: response.url,
        type,
        status: response.status,
        mimeType: response.mimeType,
        encoded: response.encodedDataLength || 0,
      });
    }
    if (message.method === "Network.loadingFinished") {
      const item = resources.get(message.params.requestId);
      if (item) item.encoded = Math.max(item.encoded, message.params.encodedDataLength || 0);
    }
    if (message.method === "Runtime.exceptionThrown") {
      errors.push(message.params.exceptionDetails?.text || "Runtime exception");
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      errors.push(message.params.entry.text);
    }
    if (message.method === "Page.loadEventFired") loaded();
  });

  const startedAt = Date.now();
  await cdp.send("Page.navigate", { url: `${baseUrl}${route}` });
  await Promise.race([loadedPromise, delay(15000)]);
  await delay(4200);
  const elapsedMs = Date.now() - startedAt;
  const expression = `(() => {
    const root = document.documentElement;
    const entries = performance.getEntriesByType("resource");
    const nav = performance.getEntriesByType("navigation")[0];
    return {
      path: location.pathname,
      title: document.title,
      domNodes: document.querySelectorAll("*").length,
      images: document.images.length,
      videos: document.querySelectorAll("video").length,
      videoState: [...document.querySelectorAll("video")].map((video) => ({
        currentSrc: video.currentSrc,
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error?.message || null
      })),
      iframes: document.querySelectorAll("iframe").length,
      scrollWidth: root.scrollWidth,
      scrollHeight: root.scrollHeight,
      viewportWidth: root.clientWidth,
      viewportHeight: root.clientHeight,
      overflowX: root.scrollWidth > root.clientWidth + 1,
      resourceEntries: entries.length,
      resourceDecodedBytes: entries.reduce((sum, item) => sum + (item.decodedBodySize || 0), 0),
      domContentLoadedMs: nav ? nav.domContentLoadedEventEnd : null,
      loadMs: nav ? nav.loadEventEnd : null
    };
  })()`;
  const [{ result }, performanceResult] = await Promise.all([
    cdp.send("Runtime.evaluate", { expression, returnByValue: true }),
    cdp.send("Performance.getMetrics"),
  ]);
  unsubscribe();

  const totals = {};
  for (const resource of resources.values()) {
    const type = resource.type || "Other";
    totals[type] = (totals[type] || 0) + resource.encoded;
  }
  const metricMap = Object.fromEntries(performanceResult.metrics.map((item) => [item.name, item.value]));
  return {
    route,
    profile: profile.name,
    visit: returningVisit ? "returning" : "first",
    ...result.value,
    elapsedMs,
    requests: resources.size,
    transferBytes: [...resources.values()].reduce((sum, item) => sum + item.encoded, 0),
    transferByType: totals,
    preloaderTransferBytes: [...resources.values()]
      .filter((item) => item.url.includes("/videos/preloader-"))
      .reduce((sum, item) => sum + item.encoded, 0),
    heroTransferBytes: [...resources.values()]
      .filter((item) => item.url.includes("/hero-video"))
      .reduce((sum, item) => sum + item.encoded, 0),
    jsHeapUsedBytes: metricMap.JSHeapUsedSize || null,
    jsHeapTotalBytes: metricMap.JSHeapTotalSize || null,
    documents: metricMap.Documents || null,
    layoutObjects: metricMap.LayoutObjects || null,
    httpErrors: [...resources.values()]
      .filter((item) => item.status >= 400)
      .map((item) => ({ status: item.status, type: item.type, url: item.url })),
    errors: [...new Set(errors)].slice(0, 10),
  };
}

try {
  const results = [];
  let runIndex = 0;
  for (const profile of profiles) {
    for (const route of routes) {
      runIndex += 1;
      const port = 9334 + runIndex;
      const chrome = launchChrome(port, `${Date.now()}-${runIndex}`);
      try {
        const targets = await waitForChrome(port);
        const target = targets.find((item) => item.type === "page");
        if (!target) throw new Error("No Chrome page target");
        const cdp = connect(target.webSocketDebuggerUrl);
        await cdp.ready;
        await Promise.all([
          cdp.send("Page.enable"),
          cdp.send("Network.enable"),
          cdp.send("Runtime.enable"),
          cdp.send("Performance.enable"),
          cdp.send("Log.enable"),
        ]);
        results.push(await auditPage(cdp, route, profile));
        cdp.close();
      } finally {
        chrome.kill("SIGTERM");
      }
    }
  }
  const output = `${JSON.stringify(results, null, 2)}\n`;
  if (outputPath) {
    await writeFile(outputPath, output, "utf8");
    process.stdout.write(`Audit written to ${outputPath}\n`);
  } else {
    process.stdout.write(output);
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
