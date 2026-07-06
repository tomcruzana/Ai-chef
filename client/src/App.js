import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBasketShopping,
  faBars,
  faCartShopping,
  faChevronUp,
  faHouse,
  faMugHot,
  faSliders,
  faStar,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import Header from "./components/layout/Header";
import Dashboard from "./features/dashboard/Dashboard";
import PantryPage from "./features/pantry/PantryPage";
import RecipeGeneratorPage from "./features/recipes/RecipeGeneratorPage";
import FavoritesPage from "./features/recipes/FavoritesPage";
import ShoppingListPage from "./features/shoppingList/ShoppingListPage";
import PreferencesPanel from "./features/preferences/PreferencesPanel";
import { fetchPantryItems } from "./features/pantry/pantrySlice";
import { useDispatch } from "react-redux";
import { fetchSavedRecipes } from "./features/recipes/recipesSlice";
import { fetchShoppingItems } from "./features/shoppingList/shoppingListSlice";
import { smoothScrollToAfterRender } from "./app/smoothScroll";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: faHouse },
  { id: "recipes", label: "Generate", icon: faUtensils },
  { id: "favorites", label: "Favorites", icon: faStar },
  { id: "pantry", label: "Pantry", icon: faBasketShopping },
  { id: "shopping", label: "Shopping", icon: faCartShopping },
  { id: "preferences", label: "Preferences", icon: faSliders },
];

export default function App() {
  const dispatch = useDispatch();
  const [activeView, setActiveView] = React.useState("dashboard");
  const [theme, setTheme] = React.useState(() => localStorage.getItem("ai-chef-theme") || "blue");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    dispatch(fetchPantryItems());
    dispatch(fetchSavedRecipes());
    dispatch(fetchShoppingItems());
  }, [dispatch]);

  function toggleTheme() {
    setTheme((current) => {
      const nextTheme = current === "blue" ? "pink-salmon" : "blue";
      localStorage.setItem("ai-chef-theme", nextTheme);
      return nextTheme;
    });
  }

  function selectView(view) {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    smoothScrollToAfterRender(() => contentRef.current);
  }

  const currentYear = new Date().getFullYear();
  const activeNavItem = navItems.find((item) => item.id === activeView);
  const viewMap = {
    dashboard: <Dashboard onNavigate={selectView} />,
    recipes: <RecipeGeneratorPage onNavigate={selectView} />,
    favorites: <FavoritesPage onNavigate={selectView} />,
    pantry: <PantryPage onNavigate={selectView} />,
    shopping: <ShoppingListPage onNavigate={selectView} />,
    preferences: <PreferencesPanel />,
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="app-main">
        <aside className="sidebar" aria-label="Main navigation">
          <button
            className="mobile-menu-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-expanded={isMobileMenuOpen}
          >
            <span>{activeNavItem?.label || "Menu"}</span>
            <FontAwesomeIcon icon={isMobileMenuOpen ? faChevronUp : faBars} aria-hidden="true" />
          </button>
          <div className={`nav-scroll ${isMobileMenuOpen ? "open" : ""}`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-button ${activeView === item.id ? "active" : ""}`}
                onClick={() => selectView(item.id)}
                type="button"
              >
                <FontAwesomeIcon icon={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </aside>
        <section className="content-panel" ref={contentRef}>{viewMap[activeView]}</section>
      </main>
      <footer className="site-footer">
        <span>AI Chef</span>
        <span>&copy; {currentYear}</span>
        <span>Made by Thomas Cruzana</span>
        <a className="site-footer-link" href="https://buymeacoffee.com/tomcruzana" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faMugHot} aria-hidden="true" />
          Buy me a coffee
        </a>
      </footer>
    </div>
  );
}
