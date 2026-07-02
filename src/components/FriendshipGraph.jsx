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
  width: 5200,
  height: 3600,
  padding: 220,
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

  people.slice(1).forEach((_, index) => {
    const childIndex = index + 1;
    const parentPoolStart = Math.max(0, childIndex - 160);
    const parentIndex = Math.floor(parentPoolStart + random() * (childIndex - parentPoolStart));
    addEdge(parentIndex, childIndex);
  });

  people.forEach((_, index) => {
    if (index % 2 === 0) addEdge(index, Math.floor(random() * people.length));
    if (index % 7 === 0) addEdge(index, index + Math.floor(random() * 140) - 70);
    if (index % 19 === 0) addEdge(index, Math.floor(random() * people.length));
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
  const nodeIndexMap = new Map(nodes.map((node, index) => [node.id, index]));
  const parentById = new Map();
  const depthById = new Map();
  const childrenById = new Map(nodes.map((node) => [node.id, []]));
  const rootId = nodes[0]?.id;
  depthById.set(rootId, 0);

  edges.forEach((edge) => {
    const requesterId = edge.requester?.nickname;
    const receiverId = edge.receiver?.nickname;
    if (!rootId || !nodeIndexMap.has(requesterId) || !nodeIndexMap.has(receiverId)) return;

    const requesterIndex = nodeIndexMap.get(requesterId);
    const receiverIndex = nodeIndexMap.get(receiverId);
    const parentId = requesterIndex < receiverIndex ? requesterId : receiverId;
    const childId = requesterIndex < receiverIndex ? receiverId : requesterId;

    if (childId === rootId || parentById.has(childId)) return;
    parentById.set(childId, parentId);
    childrenById.get(parentId)?.push(childId);
  });

  nodes.forEach((node) => {
    if (parentById.has(node.id) || node.id === rootId) return;
    const fallbackParent = nodes[Math.max(0, Math.floor(((nodeIndexMap.get(node.id) || 1) - 1) / 2))]?.id;
    parentById.set(node.id, fallbackParent);
    childrenById.get(fallbackParent)?.push(node.id);
  });

  childrenById.forEach((children) => {
    children.sort((first, second) => (nodeIndexMap.get(first) || 0) - (nodeIndexMap.get(second) || 0));
  });

  const branchPositions = new Map();
  const stack = rootId
    ? [
        {
          id: rootId,
          x: graphWorld.width * 0.5,
          y: graphWorld.height - graphWorld.padding,
          angle: -Math.PI / 2,
          depth: 0,
        },
      ]
    : [];

  while (stack.length) {
    const current = stack.pop();
    branchPositions.set(current.id, current);
    depthById.set(current.id, current.depth);
    const children = childrenById.get(current.id) || [];
    const spread = Math.min(2.15, Math.max(0.52, 0.28 + children.length * 0.055)) / Math.max(current.depth * 0.18 + 1, 1);
    const branchLength = Math.max(88, 310 - current.depth * 18);

    children.forEach((childId, childIndex) => {
      const ratio = children.length <= 1 ? 0 : childIndex / (children.length - 1) - 0.5;
      const childRandom = createSeededRandom((nodeIndexMap.get(childId) || 1) * 9173 + current.depth * 31);
      const angleNoise = (childRandom() - 0.5) * 0.34;
      const nextAngle = Math.max(
        -2.82,
        Math.min(-0.32, current.angle + ratio * spread + angleNoise),
      );
      const lengthNoise = 0.82 + childRandom() * 0.36;
      const nextX = Math.max(
        graphWorld.padding,
        Math.min(graphWorld.width - graphWorld.padding, current.x + Math.cos(nextAngle) * branchLength * lengthNoise),
      );
      const nextY = Math.max(
        graphWorld.padding,
        Math.min(graphWorld.height - graphWorld.padding, current.y + Math.sin(nextAngle) * branchLength * lengthNoise),
      );

      stack.push({
        id: childId,
        x: nextX,
        y: nextY,
        angle: nextAngle,
        depth: current.depth + 1,
      });
    });
  }

  const positionedNodes = nodes.map((node, index) => {
    if (isLargeGraph) {
      const branchPosition = branchPositions.get(node.id) || {
        x: graphWorld.width * 0.5,
        y: graphWorld.height * 0.5,
      };
      const jitterX = (random() - 0.5) * 74;
      const jitterY = (random() - 0.5) * 38;

      return {
        ...node,
        x: branchPosition.x + jitterX,
        y: branchPosition.y + jitterY,
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

  const neighboursById = new Map(positionedNodes.map((node) => [node.id, new Set()]));

  links.forEach((link) => {
    neighboursById.get(link.source.id)?.add(link.target.id);
    neighboursById.get(link.target.id)?.add(link.source.id);
  });

  return { nodes: positionedNodes, links, neighboursById };
}

export default function FriendshipGraph() {
  const canvasRef = useRef(null);
  const dragStartRef = useRef(null);
  const pointerMovedRef = useRef(false);
  const { data = [] } = useQuery({
    queryKey: ["friendship-graph"],
    queryFn: getFriendshipGraph,
    initialData: [],
  });
  const [viewBox, setViewBox] = useState(defaultViewBox);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const graph = useMemo(() => makeGraph(data.length ? data : fallbackEdges), [data]);
  const isDenseGraph = graph.nodes.length > 160;
  const selectedNeighbours = selectedNodeId ? graph.neighboursById.get(selectedNodeId) || new Set() : new Set();
  const focusedNodeIds = selectedNodeId ? new Set([selectedNodeId, ...selectedNeighbours]) : null;
  const showLabels = !isDenseGraph || viewBox.width < 980 || Boolean(selectedNodeId);

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

      const isFocusedLink = (link) =>
        selectedNodeId && (link.source.id === selectedNodeId || link.target.id === selectedNodeId);

      context.save();
      context.globalAlpha = selectedNodeId ? 0.045 : isDenseGraph ? 0.12 : 0.58;
      context.lineWidth = isDenseGraph ? 0.58 : 1.8;
      context.strokeStyle = "#8BA5FF";
      context.beginPath();
      visibleLinks.filter((link) => !isFocusedLink(link)).forEach((link) => {
        const source = worldToScreen(link.source);
        const target = worldToScreen(link.target);
        context.moveTo(source.x, source.y);
        context.lineTo(target.x, target.y);
      });
      context.stroke();
      context.restore();

      if (selectedNodeId) {
        context.save();
        context.globalAlpha = 0.92;
        context.lineWidth = 2.4;
        context.strokeStyle = "#FFFFFF";
        context.beginPath();
        visibleLinks.filter(isFocusedLink).forEach((link) => {
          const source = worldToScreen(link.source);
          const target = worldToScreen(link.target);
          context.moveTo(source.x, source.y);
          context.lineTo(target.x, target.y);
        });
        context.stroke();
        context.restore();
      }

      visibleNodes.forEach((node) => {
        const point = worldToScreen(node);
        const isSelected = node.id === selectedNodeId;
        const isRelated = focusedNodeIds?.has(node.id);
        const isDimmed = focusedNodeIds && !isRelated;
        const nodeRadius = isDenseGraph ? Math.max(2.8, 5.4 * scaleX) : 15;
        const haloRadius = isDenseGraph ? nodeRadius * 2.45 : 38;

        context.save();
        context.globalAlpha = isDimmed ? 0.04 : isSelected ? 0.42 : 0.2;
        context.fillStyle = node.color;
        context.beginPath();
        context.arc(point.x, point.y, isSelected ? haloRadius * 2.1 : haloRadius, 0, Math.PI * 2);
        context.fill();
        context.restore();

        context.save();
        context.globalAlpha = isDimmed ? 0.12 : 1;
        context.fillStyle = node.color;
        context.strokeStyle = isSelected ? "#FFFFFF" : isRelated ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.74)";
        context.lineWidth = isSelected ? 3.2 : isRelated ? 1.7 : isDenseGraph ? 0.9 : 1.4;
        context.beginPath();
        context.arc(point.x, point.y, isSelected ? nodeRadius * 1.9 : isRelated ? nodeRadius * 1.35 : nodeRadius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.restore();

        if (!showLabels || (focusedNodeIds && !isRelated)) return;

        const labelWidth = 164;
        const labelHeight = 62;
        const labelX = point.x - labelWidth / 2;
        const labelY = point.y - labelHeight / 2;

        context.save();
        context.fillStyle = isSelected ? "rgba(28,28,28,0.98)" : "rgba(25,25,25,0.92)";
        context.strokeStyle = isSelected ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.14)";
        context.lineWidth = isSelected ? 1.6 : 1;
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
  }, [focusedNodeIds, graph, isDenseGraph, selectedNodeId, showLabels, viewBox]);

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
    pointerMovedRef.current = false;
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
    if (Math.abs(event.clientX - dragStartRef.current.pointerX) > 4 || Math.abs(event.clientY - dragStartRef.current.pointerY) > 4) {
      pointerMovedRef.current = true;
    }

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

  const handleCanvasClick = (event) => {
    if (pointerMovedRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    const worldPoint = {
      x: viewBox.x + (event.clientX - rect.left) * scaleX,
      y: viewBox.y + (event.clientY - rect.top) * scaleY,
    };
    const hitRadius = Math.max(34, viewBox.width / rect.width * 12);
    let closestNode = null;
    let closestDistance = Infinity;

    graph.nodes.forEach((node) => {
      const distance = Math.hypot(node.x - worldPoint.x, node.y - worldPoint.y);
      if (distance > hitRadius || distance >= closestDistance) return;
      closestNode = node;
      closestDistance = distance;
    });

    setSelectedNodeId((current) => (closestNode?.id && closestNode.id !== current ? closestNode.id : null));
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
        onClick={handleCanvasClick}
      />
    </article>
  );
}
