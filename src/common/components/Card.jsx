import "./card.css";

// Базовая карточка проекта: рамка, тень, скругление и фон берутся из глобальных токенов.
export default function Card({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag className={className ? `card ${className}` : "card"} {...props}>
      {children}
    </Tag>
  );
}
