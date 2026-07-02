import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFriendshipGraph } from "../services/profileService";

const facultyNames = ["КТУ", "ТИНТ", "НОЖ", "ФТМФ", "ФТМИ"];

const facultyColors = {
  КТУ: "#4B6BFB",
  ТИНТ: "#8BA5FF",
  НОЖ: "#00A878",
  ФТМФ: "#FFB000",
  ФТМИ: "#FF4D8D",
};

const graphWorld = {
  width: 3800,
  height: 2400,
  padding: 180,
};

const defaultViewBox = { x: 0, y: 0, width: graphWorld.width, height: graphWorld.height };

function createSeededRandom(seed = 42) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makePerson(index) {
  const faculty = facultyNames[index % facultyNames.length];
  return {
    nickname: `${faculty.toLowerCase()}_${String(index + 1).padStart(4, "0")}`,
    faculty,
  };
}

function makeStressEdges() {
  const people = Array.from({ length: 1000 }, (_, index) => makePerson(index));
  const edgeKeys = new Set();
  const edges = [];
  const random = createSeededRandom(20260702);

  const addEdge = (sourceIndex, targetIndex) => {
    if (sourceIndex === targetIndex) return;
    const source = people[((sourceIndex % people.length) + people.length) % people.length];
    const target = people[((targetIndex % people.length) + people.length) % people.length];
    const key = [source.nickname, target.nickname].sort().join("::");
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ requester: source, receiver: target });
  };

  people.forEach((_, index) => {
    const randomTarget = Math.floor(random() * people.length);
    const secondRandomTarget = Math.floor(random() * people.length);
    const socialBubbleTarget = index + Math.floor(random() * 36) - 18;

    addEdge(index, randomTarget);
    addEdge(index, secondRandomTarget);
    addEdge(index, socialBubbleTarget);

    if (index % 5 === 0) addEdge(index, Math.floor(random() * people.length));
    if (index % 11 === 0) addEdge(index, 999 - Math.floor(random() * people.length));
    if (index % 23 === 0) addEdge(index, Math.floor(random() * people.length));
  });

  return edges;
}

const fallbackEdges = makeStressEdges();

function makeGraph(edges) {
  const nodeMap = new Map();

  edges.forEach((edge) => {
    [edge.requester, edge.receiver].forEach((person) => {
      if (!person?.nickname || nodeMap.has(person.nickname)) return;
      nodeMap.set(person.nickname, {
        id: person.nickname,
        label: person.nickname,
        faculty: person.faculty || "Megabattle",
      });
    });
  });

  const nodes = Array.from(nodeMap.values());
  const isLargeGraph = nodes.length > 160;
  const random = createSeededRandom(7341 + nodes.length);
  const gridColumns = Math.ceil(Math.sqrt(nodes.length * (graphWorld.width / graphWorld.height)));
  const gridRows = Math.ceil(nodes.length / gridColumns);
  const cellWidth = (graphWorld.width - graphWorld.padding * 2) / gridColumns;
  const cellHeight = (graphWorld.height - graphWorld.padding * 2) / gridRows;
  const shuffledCells = Array.from({ length: gridColumns * gridRows }, (_, index) => index);

  for (let index = shuffledCells.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(random() * (index + 1));
    [shuffledCells[index], shuffledCells[targetIndex]] = [shuffledCells[targetIndex], shuffledCells[index]];
  }

  const positionedNodes = nodes.map((node, index) => {
    if (isLargeGraph) {
      const cell = shuffledCells[index];
      const column = cell % gridColumns;
      const row = Math.floor(cell / gridColumns);
      const jitterX = (random() - 0.5) * cellWidth * 0.58;
      const jitterY = (random() - 0.5) * cellHeight * 0.58;

      return {
        ...node,
        x: graphWorld.padding + column * cellWidth + cellWidth / 2 + jitterX,
        y: graphWorld.padding + row * cellHeight + cellHeight / 2 + jitterY,
        color: facultyColors[node.faculty] || "#8BA5FF",
      };
    }

    const center = { x: 500, y: 360 };
    const radius = Math.max(190, nodes.length * 34);
    const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1) - Math.PI / 2;
    const wobble = index % 2 === 0 ? 32 : -18;
    return {
      ...node,
      x: center.x + Math.cos(angle) * (radius + wobble),
      y: center.y + Math.sin(angle) * (radius * 0.72 - wobble),
      color: facultyColors[node.faculty] || "#8BA5FF",
    };
  });

  const positionedNodeMap = new Map(positionedNodes.map((node) => [node.id, node]));
  const links = edges
    .map((edge) => ({
      source: positionedNodeMap.get(edge.requester?.nickname),
      target: positionedNodeMap.get(edge.receiver?.nickname),
    }))
    .filter((edge) => edge.source && edge.target);

  return { nodes: positionedNodes, links };
}

export default function FriendshipGraph() {
  const canvasRef = useRef(null);
  const dragStartRef = useRef(null);
  const { data = [] } = useQuery({
    queryKey: ["friendship-graph"],
    queryFn: getFriendshipGraph,
    initialData: [],
  });
  const [viewBox, setViewBox] = useState(defaultViewBox);

  const graph = useMemo(() => makeGraph(data.length ? data : fallbackEdges), [data]);
  const isDenseGraph = graph.nodes.length > 160;
  const showLabels = !isDenseGraph || viewBox.width < 980;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let animationFrame = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width * deviceRatio));
      const height = Math.max(1, Math.floor(rect.height * deviceRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const context = canvas.getContext("2d");
      if (!context) return;
      const bodyFont = getComputedStyle(document.documentElement).getPropertyValue("--body-font") || "Arial, sans-serif";

      context.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const scaleX = rect.width / viewBox.width;
      const scaleY = rect.height / viewBox.height;
      const worldToScreen = (point) => ({
        x: (point.x - viewBox.x) * scaleX,
        y: (point.y - viewBox.y) * scaleY,
      });
      const visibleBounds = {
        left: viewBox.x - 80,
        right: viewBox.x + viewBox.width + 80,
        top: viewBox.y - 80,
        bottom: viewBox.y + viewBox.height + 80,
      };
      const isVisibleNode = (node) =>
        node.x >= visibleBounds.left &&
        node.x <= visibleBounds.right &&
        node.y >= visibleBounds.top &&
        node.y <= visibleBounds.bottom;
      const isVisibleLink = (link) =>
        Math.max(link.source.x, link.target.x) >= visibleBounds.left &&
        Math.min(link.source.x, link.target.x) <= visibleBounds.right &&
        Math.max(link.source.y, link.target.y) >= visibleBounds.top &&
        Math.min(link.source.y, link.target.y) <= visibleBounds.bottom;
      const visibleLinks = graph.links.filter(isVisibleLink);
      const visibleNodes = graph.nodes.filter(isVisibleNode);

      context.save();
      context.globalAlpha = isDenseGraph ? 0.12 : 0.58;
      context.lineWidth = isDenseGraph ? 0.58 : 1.8;
      context.strokeStyle = "#8BA5FF";
      context.beginPath();
      visibleLinks.forEach((link) => {
        const source = worldToScreen(link.source);
        const target = worldToScreen(link.target);
        context.moveTo(source.x, source.y);
        context.lineTo(target.x, target.y);
      });
      context.stroke();
      context.restore();

      visibleNodes.forEach((node) => {
        const point = worldToScreen(node);
        const nodeRadius = isDenseGraph ? Math.max(2.6, 5.4 * scaleX) : 15;
        const haloRadius = isDenseGraph ? nodeRadius * 2.45 : 38;

        context.save();
        context.globalAlpha = 0.2;
        context.fillStyle = node.color;
        context.beginPath();
        context.arc(point.x, point.y, haloRadius, 0, Math.PI * 2);
        context.fill();
        context.restore();

        context.save();
        context.fillStyle = node.color;
        context.strokeStyle = "rgba(255,255,255,0.74)";
        context.lineWidth = isDenseGraph ? 0.9 : 1.4;
        context.beginPath();
        context.arc(point.x, point.y, nodeRadius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.restore();

        if (!showLabels) return;

        const labelWidth = 164;
        const labelHeight = 62;
        const labelX = point.x - labelWidth / 2;
        const labelY = point.y - labelHeight / 2;

        context.save();
        context.fillStyle = "rgba(25,25,25,0.92)";
        context.strokeStyle = "rgba(255,255,255,0.14)";
        context.lineWidth = 1;
        context.beginPath();
        context.roundRect(labelX, labelY, labelWidth, labelHeight, 31);
        context.fill();
        context.stroke();

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = `900 18px ${bodyFont}`;
        context.fillStyle = "#8BA5FF";
        context.fillText(node.label, point.x, point.y - 4);
        context.font = `800 13px ${bodyFont}`;
        context.fillStyle = "rgba(255,255,255,0.74)";
        context.fillText(node.faculty, point.x, point.y + 19);
        context.restore();
      });
    };

    const scheduleDraw = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(scheduleDraw);
    resizeObserver.observe(canvas);
    scheduleDraw();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [graph, isDenseGraph, showLabels, viewBox]);

  const zoom = (factor) => {
    setViewBox((current) => {
      const nextWidth = Math.min(graphWorld.width, Math.max(240, current.width * factor));
      const nextHeight = Math.min(graphWorld.height, Math.max(150, current.height * factor));
      return {
        x: current.x + (current.width - nextWidth) / 2,
        y: current.y + (current.height - nextHeight) / 2,
        width: nextWidth,
        height: nextHeight,
      };
    });
  };

  const resetView = () => {
    setViewBox(defaultViewBox);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    zoom(event.deltaY > 0 ? 1.1 : 0.9);
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      viewBox,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragStartRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = dragStartRef.current.viewBox.width / rect.width;
    const scaleY = dragStartRef.current.viewBox.height / rect.height;
    const dx = (event.clientX - dragStartRef.current.pointerX) * scaleX;
    const dy = (event.clientY - dragStartRef.current.pointerY) * scaleY;

    setViewBox({
      ...dragStartRef.current.viewBox,
      x: dragStartRef.current.viewBox.x - dx,
      y: dragStartRef.current.viewBox.y - dy,
    });
  };

  const handlePointerUp = (event) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragStartRef.current = null;
  };

  return (
    <article className="info-card friendship-graph-card">
      <div className="friendship-graph-toolbar" aria-label="Управление графом">
        <button type="button" aria-label="Приблизить граф" onClick={() => zoom(0.85)}>
          +
        </button>
        <button type="button" aria-label="Отдалить граф" onClick={() => zoom(1.15)}>
          −
        </button>
        <button type="button" onClick={resetView}>
          Сброс
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="friendship-graph-canvas"
        role="img"
        aria-label="Интерактивный граф знакомств"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </article>
  );
}
