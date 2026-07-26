const facultyNames = ["КТУ", "ТИНТ", "НОЖ", "ФТМФ", "ФТМИ"];

const facultyColors = {
  КТУ: "#0069E0",
  ТИНТ: "#FFFFFF",
  НОЖ: "#FFFFFF",
  ФТМФ: "#0069E0",
  ФТМИ: "#FFFFFF",
};

export const graphWorld = { width: 5200, height: 3600, padding: 220 };
export const defaultViewBox = { x: 0, y: 0, width: graphWorld.width, height: graphWorld.height };

function createSeededRandom(seed = 42) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makePerson(index) {
  const faculty = facultyNames[index % facultyNames.length];
  return { nickname: `${faculty.toLowerCase()}_${String(index + 1).padStart(4, "0")}`, faculty };
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
    addEdge(Math.floor(parentPoolStart + random() * (childIndex - parentPoolStart)), childIndex);
  });
  people.forEach((_, index) => {
    if (index % 2 === 0) addEdge(index, Math.floor(random() * people.length));
    if (index % 7 === 0) addEdge(index, index + Math.floor(random() * 140) - 70);
    if (index % 19 === 0) addEdge(index, Math.floor(random() * people.length));
  });
  return edges;
}

export const fallbackEdges = makeStressEdges();

export function makeGraph(edges) {
  const nodeMap = new Map();
  edges.forEach((edge) => {
    [edge.requester, edge.receiver].forEach((person) => {
      if (!person?.nickname || nodeMap.has(person.nickname)) return;
      nodeMap.set(person.nickname, {
        id: person.nickname,
        profileId: person.id,
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
  const childrenById = new Map(nodes.map((node) => [node.id, []]));
  const rootId = nodes[0]?.id;

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
  childrenById.forEach((children) => children.sort((first, second) => (nodeIndexMap.get(first) || 0) - (nodeIndexMap.get(second) || 0)));

  const branchPositions = new Map();
  const stack = rootId ? [{
    id: rootId,
    x: graphWorld.width * 0.5,
    y: graphWorld.height - graphWorld.padding,
    angle: -Math.PI / 2,
    depth: 0,
  }] : [];

  while (stack.length) {
    const current = stack.pop();
    branchPositions.set(current.id, current);
    const children = childrenById.get(current.id) || [];
    const spread = Math.min(2.15, Math.max(0.52, 0.28 + children.length * 0.055)) / Math.max(current.depth * 0.18 + 1, 1);
    const branchLength = Math.max(88, 310 - current.depth * 18);
    children.forEach((childId, childIndex) => {
      const ratio = children.length <= 1 ? 0 : childIndex / (children.length - 1) - 0.5;
      const childRandom = createSeededRandom((nodeIndexMap.get(childId) || 1) * 9173 + current.depth * 31);
      const nextAngle = Math.max(-2.82, Math.min(-0.32, current.angle + ratio * spread + (childRandom() - 0.5) * 0.34));
      const lengthNoise = 0.82 + childRandom() * 0.36;
      stack.push({
        id: childId,
        x: Math.max(graphWorld.padding, Math.min(graphWorld.width - graphWorld.padding, current.x + Math.cos(nextAngle) * branchLength * lengthNoise)),
        y: Math.max(graphWorld.padding, Math.min(graphWorld.height - graphWorld.padding, current.y + Math.sin(nextAngle) * branchLength * lengthNoise)),
        angle: nextAngle,
        depth: current.depth + 1,
      });
    });
  }

  const positionedNodes = nodes.map((node, index) => {
    if (isLargeGraph) {
      const branchPosition = branchPositions.get(node.id) || { x: graphWorld.width * 0.5, y: graphWorld.height * 0.5 };
      return {
        ...node,
        x: branchPosition.x + (random() - 0.5) * 74,
        y: branchPosition.y + (random() - 0.5) * 38,
        color: facultyColors[node.faculty] || "#0066FF",
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
      color: facultyColors[node.faculty] || "#0066FF",
    };
  });

  const positionedNodeMap = new Map(positionedNodes.map((node) => [node.id, node]));
  const links = edges
    .map((edge) => ({ source: positionedNodeMap.get(edge.requester?.nickname), target: positionedNodeMap.get(edge.receiver?.nickname) }))
    .filter((edge) => edge.source && edge.target);
  const neighboursById = new Map(positionedNodes.map((node) => [node.id, new Set()]));
  links.forEach((link) => {
    neighboursById.get(link.source.id)?.add(link.target.id);
    neighboursById.get(link.target.id)?.add(link.source.id);
  });
  return { nodes: positionedNodes, links, neighboursById };
}
