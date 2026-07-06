import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function StatCard({ icon, label, value, helper, onClick }) {
  const Component = onClick ? "button" : "article";

  return (
    <Component className={`stat-card ${onClick ? "stat-card-link" : ""}`} type={onClick ? "button" : undefined} onClick={onClick}>
      <div className="stat-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {helper && <span>{helper}</span>}
      </div>
    </Component>
  );
}
