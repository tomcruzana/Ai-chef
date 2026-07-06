import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBowlFood, faPalette } from "@fortawesome/free-solid-svg-icons";

export default function Header({ theme, onToggleTheme }) {
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
      <div className="header-actions">
        <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label="Toggle color theme" title="Toggle color theme">
          <FontAwesomeIcon icon={faPalette} />
        </button>
      </div>
    </header>
  );
}
