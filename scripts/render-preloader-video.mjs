import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const VITE_PORT = 5178;
const CHROME_PORT = 9228;
const ANIMATION_MS = 3000;

const profiles = [
  {
    name: "desktop",
    width: 2560,
    height: 1440,
    viewportWidth: 2560,
    viewportHeight: 1440,
    deviceScaleFactor: 1,
    fps: 60,
    duration: 3.8,
    videoBitrate: "7800k",
    crf: "18",
  },
  {
    name: "mobile",
    width: 1440,
    height: 2560,
    viewportWidth: 360,
    viewportHeight: 640,
    deviceScaleFactor: 4,
    fps: 60,
    duration: 3.8,
    videoBitrate: "7200k",
    crf: "18",
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, label) {
  const started = Date.now();
  while (Date.now() - started < 30_000) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // keep waiting
    }
    await wait(250);
  }
  throw new Error(`${label} did not become ready: ${url}`);
}

function spawnLogged(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawnLogged(command, args, options);
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function connectToPage(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let id = 0;
  const callbacks = new Map();
  const events = new Map();

  socket.addEventListener("message", (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id && callbacks.has(payload.id)) {
      const { resolve, reject } = callbacks.get(payload.id);
      callbacks.delete(payload.id);
      if (payload.error) reject(new Error(payload.error.message));
      else resolve(payload.result);
      return;
    }
    if (payload.method && events.has(payload.method)) {
      for (const callback of events.get(payload.method)) callback(payload.params);
    }
  });

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const messageId = ++id;
      callbacks.set(messageId, { resolve, reject });
      socket.send(JSON.stringify({ id: messageId, method, params }));
    });

  const on = (event, callback) => {
    if (!events.has(event)) events.set(event, new Set());
    events.get(event).add(callback);
  };

  const close = () => socket.close();

  return { send, on, close };
}

async function openPage(url) {
  const response = await fetch(`http://127.0.0.1:${CHROME_PORT}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT",
  });
  if (!response.ok) throw new Error(`Cannot create Chrome target: ${response.status}`);
  return response.json();
}

async function waitForLoad(page) {
  await new Promise((resolve) => {
    let resolved = false;
    page.on("Page.loadEventFired", () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    });
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    }, 5000);
  });
}

async function waitFor3D(page) {
  const started = Date.now();
  while (Date.now() - started < 20_000) {
    const result = await page.send("Runtime.evaluate", {
      expression: "Boolean(window.__MB_PRELOADER_3D_READY)",
      returnByValue: true,
    });
    if (result.result.value) return;
    await wait(150);
  }
  throw new Error("3D preloader did not become ready");
}

async function setFrameProgress(page, progress) {
  const animationTime = Math.min(ANIMATION_MS, Math.max(0, progress * ANIMATION_MS));
  await page.send("Runtime.evaluate", {
    awaitPromise: true,
    expression: `
      new Promise((resolve) => {
        window.__MB_PRELOADER_PROGRESS = ${progress};
        document.getAnimations().forEach((animation) => {
          animation.pause();
          animation.currentTime = ${animationTime};
        });
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      })
    `,
  });
}

async function capturePng(page, filePath) {
  const screenshot = await page.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
}

async function renderProfile(profile) {
  const frameCount = Math.round(profile.duration * profile.fps);
  const framesDir = path.join(ROOT, "work", "preloader-render", profile.name);
  const outputBase = path.join(ROOT, "public", "videos", `preloader-${profile.name}`);
  await rm(framesDir, { recursive: true, force: true });
  await mkdir(framesDir, { recursive: true });
  await mkdir(path.dirname(outputBase), { recursive: true });

  const target = await openPage(`http://127.0.0.1:${VITE_PORT}/?capturePreloader=1`);
  const page = await connectToPage(target.webSocketDebuggerUrl);
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Emulation.setDeviceMetricsOverride", {
    width: profile.viewportWidth ?? profile.width,
    height: profile.viewportHeight ?? profile.height,
    deviceScaleFactor: profile.deviceScaleFactor ?? 1,
    mobile: profile.name === "mobile",
  });
  await page.send("Page.navigate", {
    url: `http://127.0.0.1:${VITE_PORT}/?capturePreloader=1`,
  });
  await waitForLoad(page);
  await waitFor3D(page);

  console.log(
    `Rendering ${profile.name}: ${frameCount} frames ${profile.width}x${profile.height} ` +
      `(viewport ${profile.viewportWidth ?? profile.width}x${profile.viewportHeight ?? profile.height} @${profile.deviceScaleFactor ?? 1}x)`,
  );
  for (let frame = 0; frame < frameCount; frame += 1) {
    const seconds = frame / profile.fps;
    const progress = Math.min(1, seconds / (ANIMATION_MS / 1000));
    await setFrameProgress(page, progress);
    const framePath = path.join(framesDir, `frame-${String(frame + 1).padStart(4, "0")}.png`);
    await capturePng(page, framePath);
    if ((frame + 1) % profile.fps === 0 || frame + 1 === frameCount) {
      console.log(`  ${profile.name}: ${frame + 1}/${frameCount}`);
    }
  }
  page.close();

  await run(FFMPEG, [
    "-y",
    "-framerate",
    String(profile.fps),
    "-i",
    path.join(framesDir, "frame-%04d.png"),
    "-an",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-crf",
    profile.crf,
    "-preset",
    "slow",
    `${outputBase}.mp4`,
  ]);

  await run(FFMPEG, [
    "-y",
    "-framerate",
    String(profile.fps),
    "-i",
    path.join(framesDir, "frame-%04d.png"),
    "-an",
    "-c:v",
    "libvpx-vp9",
    "-pix_fmt",
    "yuv420p",
    "-b:v",
    "0",
    "-crf",
    profile.name === "mobile" ? "30" : "28",
    "-row-mt",
    "1",
    `${outputBase}.webm`,
  ]);

  await run(FFMPEG, [
    "-y",
    "-i",
    path.join(framesDir, "frame-0001.png"),
    "-vf",
    "scale=960:-1",
    "-frames:v",
    "1",
    "-update",
    "1",
    `${outputBase}-poster.jpg`,
  ]);
}

async function main() {
  if (!existsSync(CHROME)) throw new Error(`Chrome not found: ${CHROME}`);
  if (!existsSync(FFMPEG)) throw new Error(`ffmpeg not found: ${FFMPEG}`);

  const vite = spawnLogged("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(VITE_PORT)]);
  const chromeProfile = path.join(ROOT, "work", "chrome-preloader-render");
  await rm(chromeProfile, { recursive: true, force: true });
  const chrome = spawnLogged(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${CHROME_PORT}`,
    `--user-data-dir=${chromeProfile}`,
    "--hide-scrollbars",
    "--mute-audio",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "about:blank",
  ]);

  try {
    await waitForHttp(`http://127.0.0.1:${VITE_PORT}/`, "Vite");
    await waitForHttp(`http://127.0.0.1:${CHROME_PORT}/json/version`, "Chrome");
    const selectedProfiles = process.argv.slice(2);
    const profilesToRender = selectedProfiles.length
      ? profiles.filter((profile) => selectedProfiles.includes(profile.name))
      : profiles;
    if (!profilesToRender.length) throw new Error(`No matching profiles: ${selectedProfiles.join(", ")}`);

    for (const profile of profilesToRender) {
      await renderProfile(profile);
    }
    console.log("Preloader videos rendered into public/videos");
  } finally {
    vite.kill();
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
