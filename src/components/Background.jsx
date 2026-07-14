import "../styles/background.css";

export default function Background() {
  return (
    <div className="brand-background" aria-hidden="true">
      <div className="brand-background__aurora brand-background__aurora--left" />
      <div className="brand-background__aurora brand-background__aurora--right" />
      <div className="brand-background__beam brand-background__beam--one" />
      <div className="brand-background__beam brand-background__beam--two" />
      <div className="brand-background__grid" />
      <div className="brand-background__grain" />
    </div>
  );
}
