import { useLocation } from "react-router-dom";

export default function PageStage({ children }) {
  const location = useLocation();
  return (
    <div className="page-stage" key={location.pathname}>
      {children}
    </div>
  );
}
