import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import "../styles/external-link.css";

export default function ExternalLink({ href, text }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="external-link"
    >
      {text || "Ссылка"}
      <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
    </a>
  );
}
