import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBowlFood, faSliders } from "@fortawesome/free-solid-svg-icons";

export default function Header({ onOpenPreferences, isPreferencesActive }) {
  return (
    <header className="site-header">
      <div className="brand-group">
        <div className="brand-mark">
          <FontAwesomeIcon icon={faBowlFood} />
        </div>
        <div>
          <p className="eyebrow">Tom's</p>
          <h1>AI Chef</h1>
        </div>
      </div>
      <button
        className={`header-nav-button ${isPreferencesActive ? "active" : ""}`}
        type="button"
        onClick={onOpenPreferences}
        aria-label="Open preferences"
      >
        <FontAwesomeIcon icon={faSliders} />
        <span>Prefs</span>
      </button>
    </header>
  );
}
