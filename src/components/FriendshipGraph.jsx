import { useQuery } from "@tanstack/react-query";
import { getFriendshipGraph } from "../services/profileService";

const fallbackEdges = [
  { requester: { nickname: "anya_mb", faculty: "ФТМИ" }, receiver: { nickname: "robot_ktushka", faculty: "КТУ" } },
  { requester: { nickname: "robot_ktushka", faculty: "КТУ" }, receiver: { nickname: "bio_vibe", faculty: "НОЖ" } },
  { requester: { nickname: "laser_cat", faculty: "ФТМФ" }, receiver: { nickname: "data_dancer", faculty: "ТИНТ" } },
  { requester: { nickname: "anya_mb", faculty: "ФТМИ" }, receiver: { nickname: "laser_cat", faculty: "ФТМФ" } },
];

function uniqueNodes(edges) {
  const map = new Map();
  edges.forEach((edge) => {
    [edge.requester, edge.receiver].forEach((person) => {
      if (!person?.nickname) return;
      map.set(person.nickname, person);
    });
  });
  return Array.from(map.values()).slice(0, 8);
}

export default function FriendshipGraph() {
  const { data = [] } = useQuery({
    queryKey: ["friendship-graph"],
    queryFn: getFriendshipGraph,
    initialData: [],
  });

  const edges = data.length ? data : fallbackEdges;
  const nodes = uniqueNodes(edges);

  return (
    <article className="info-card friendship-graph-card">
      <div className="friendship-graph-copy">
        <p className="card-kicker">Тиндер-граф</p>
        <h2>Граф знакомств</h2>
        <p>
          Когда участник сканирует чужую NFC-визитку и добавляет знакомство,
          связь появляется здесь. Пока реальных связей мало, показываем пример
          будущей карты.
        </p>
      </div>

      <div className="friendship-graph-visual" aria-label="Граф знакомств">
        {edges.slice(0, 6).map((edge, index) => (
          <span
            className="friendship-edge"
            style={{ "--edge-index": index }}
            key={`${edge.requester?.nickname}-${edge.receiver?.nickname}-${index}`}
          />
        ))}
        {nodes.map((node, index) => (
          <div
            className="friendship-node"
            style={{
              "--node-index": index,
              "--node-x": `${18 + ((index * 31) % 66)}%`,
              "--node-y": `${20 + ((index * 47) % 58)}%`,
            }}
            key={node.nickname}
          >
            <strong>{node.nickname}</strong>
            <span>{node.faculty}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
