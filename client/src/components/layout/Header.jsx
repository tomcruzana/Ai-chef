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
          <p className="eyebrow">Pantry recipes</p>
          <h1>AI Chef</h1>
        </div>
      </div>
      <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label="Toggle theme">
        <FontAwesomeIcon icon={faPalette} />
        {theme === "blue" ? "Blue" : "PinkSalmon"}
      </button>
    </header>
  );
}
