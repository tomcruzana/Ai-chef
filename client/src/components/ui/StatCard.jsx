import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function StatCard({ icon, label, value, helper }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {helper && <span>{helper}</span>}
      </div>
    </article>
  );
}
