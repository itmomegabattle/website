import "./tag.css";

// Строка тегов: обертка с переносом и общим отступом.
export function TagRow({ className = "", children, ...props }) {
  return (
    <div className={className ? `tag-row ${className}` : "tag-row"} {...props}>
      {children}
    </div>
  );
}

// Тег-пилюля: базовый вид задают глобальные токены, контекст может уточнять его своим классом.
export default function Tag({ className = "", children, ...props }) {
  return (
    <span className={className ? `tag ${className}` : "tag"} {...props}>
      {children}
    </span>
  );
}
