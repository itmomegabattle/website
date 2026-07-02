import { useMemo, useRef, useState } from "react";
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

  const addEdge = (sourceIndex, targetIndex) => {
    if (sourceIndex === targetIndex) return;
    const source = people[sourceIndex % people.length];
    const target = people[targetIndex % people.length];
    const key = [source.nickname, target.nickname].sort().join("::");
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ requester: source, receiver: target });
  };

  people.forEach((_, index) => {
    addEdge(index, index + 1);
    addEdge(index, index + 7);

    if (index % 3 === 0) addEdge(index, index + 37);
    if (index % 4 === 0) addEdge(index, index + 113);
    if (index % 9 === 0) addEdge(index, index + 271);
    if (index % 17 === 0) addEdge(index, 999 - index);
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
  const center = isLargeGraph ? { x: 1000, y: 620 } : { x: 500, y: 360 };
  const clusterCenters = {
    КТУ: { x: 500, y: 350 },
    ТИНТ: { x: 1040, y: 260 },
    НОЖ: { x: 1510, y: 520 },
    ФТМФ: { x: 1190, y: 930 },
    ФТМИ: { x: 570, y: 860 },
  };
  const facultyCounters = new Map();

  const positionedNodes = nodes.map((node, index) => {
    if (isLargeGraph) {
      const facultyIndex = facultyCounters.get(node.faculty) || 0;
      facultyCounters.set(node.faculty, facultyIndex + 1);
      const clusterCenter = clusterCenters[node.faculty] || center;
      const ring = Math.floor(Math.sqrt(facultyIndex));
      const angle = facultyIndex * 2.399963229728653;
      const radius = 12 + ring * 13.8;

      return {
        ...node,
        x: clusterCenter.x + Math.cos(angle) * radius,
        y: clusterCenter.y + Math.sin(angle) * radius * 0.78,
        color: facultyColors[node.faculty] || "#8BA5FF",
      };
    }

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
  const svgRef = useRef(null);
  const dragStartRef = useRef(null);
  const { data = [] } = useQuery({
    queryKey: ["friendship-graph"],
    queryFn: getFriendshipGraph,
    initialData: [],
  });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 2000, height: 1240 });

  const graph = useMemo(() => makeGraph(data.length ? data : fallbackEdges), [data]);
  const isDenseGraph = graph.nodes.length > 160;
  const showLabels = !isDenseGraph || viewBox.width < 980;

  const zoom = (factor) => {
    setViewBox((current) => {
      const nextWidth = Math.min(2600, Math.max(260, current.width * factor));
      const nextHeight = Math.min(1612, Math.max(180, current.height * factor));
      return {
        x: current.x + (current.width - nextWidth) / 2,
        y: current.y + (current.height - nextHeight) / 2,
        width: nextWidth,
        height: nextHeight,
      };
    });
  };

  const resetView = () => {
    setViewBox({ x: 0, y: 0, width: 2000, height: 1240 });
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
    if (!dragStartRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
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

      <svg
        ref={svgRef}
        className="friendship-graph-svg"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        role="img"
        aria-label="Интерактивный граф знакомств"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <radialGradient id="friendship-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.22" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="-2000" y="-2000" width="5000" height="5000" className="friendship-graph-bg" />

        <g className="friendship-links">
          {graph.links.map((link, index) => (
            <line
              key={`${link.source.id}-${link.target.id}-${index}`}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
            />
          ))}
        </g>

        <g className="friendship-nodes">
          {graph.nodes.map((node) => (
            <g
              className={`friendship-node-svg${isDenseGraph ? " friendship-node-svg--dense" : ""}`}
              transform={`translate(${node.x} ${node.y})`}
              key={node.id}
            >
              <circle className="friendship-node-halo" r={isDenseGraph ? 13 : 54} fill={node.color} opacity="0.2" />
              <circle className="friendship-node-dot" r={isDenseGraph ? 4.8 : 38} fill={node.color} />
              <title>{`${node.label} · ${node.faculty}`}</title>
              {showLabels && (
                <>
                  <rect x="-82" y="-31" width="164" height="62" rx="31" />
                  <text className="friendship-node-label" x="0" y="-3" textAnchor="middle">
                    {node.label}
                  </text>
                  <text className="friendship-node-faculty" x="0" y="19" textAnchor="middle">
                    {node.faculty}
                  </text>
                </>
              )}
            </g>
          ))}
        </g>
      </svg>
    </article>
  );
}
