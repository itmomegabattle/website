import { PROJECT_AVATAR } from "./contactData";

export function ProjectAvatar({ className = "" }) {
  return (
    <span className={`contact-project-avatar ${className}`.trim()}>
      <img src={PROJECT_AVATAR} alt="" width="109" height="67" />
    </span>
  );
}

export function SocialScreen({ className, href, children }) {
  const openProfile = () => window.open(href, "_blank", "noopener,noreferrer");

  return (
    <div
      className={`network-screen ${className}`}
      role="link"
      tabIndex="0"
      onClick={(event) => {
        if (event.target.closest("a")) return;
        openProfile();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProfile();
        }
      }}
    >
      {children}
    </div>
  );
}
