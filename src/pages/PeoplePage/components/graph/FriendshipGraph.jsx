import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getFriendshipGraph } from "../../../../services/profileService";
import { defaultViewBox, fallbackEdges, graphWorld, makeGraph } from "./graphData";

export default function FriendshipGraph() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const dragStartRef = useRef(null);
  const pointerMovedRef = useRef(false);
  const { data = [] } = useQuery({
    queryKey: ["friendship-graph"],
    queryFn: getFriendshipGraph,
    placeholderData: [],
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
      context.strokeStyle = "#0066FF";
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
        context.fillStyle = "#0066FF";
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

    setSelectedNodeId((current) => {
      if (!closestNode?.id) return null;
      if (closestNode.id === current && closestNode.profileId) {
        navigate(`/u/${closestNode.profileId}`);
        return current;
      }
      return closestNode.id;
    });
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
