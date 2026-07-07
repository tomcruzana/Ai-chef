import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBasketShopping,
  faCartShopping,
  faHouse,
  faMugHot,
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
  { id: "pantry", label: "Pantry", icon: faBasketShopping },
  { id: "favorites", label: "Favorites", icon: faStar },
  { id: "recipes", label: "Generate", icon: faUtensils },
  { id: "shopping", label: "Shopping", icon: faCartShopping },
];

export default function App() {
  const dispatch = useDispatch();
  const [activeView, setActiveView] = React.useState("dashboard");
  const [theme, setTheme] = React.useState(() => localStorage.getItem("ai-chef-theme") || "blue");
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
    smoothScrollToAfterRender(() => contentRef.current);
  }

  const currentYear = new Date().getFullYear();
  const generateItem = navItems.find((item) => item.id === "recipes");
  const secondaryNavItems = navItems.filter((item) => item.id !== "recipes");
  const leftNavItems = secondaryNavItems.slice(0, 2);
  const rightNavItems = secondaryNavItems.slice(2);
  const viewMap = {
    dashboard: <Dashboard onNavigate={selectView} />,
    recipes: <RecipeGeneratorPage onNavigate={selectView} />,
    favorites: <FavoritesPage onNavigate={selectView} />,
    pantry: <PantryPage onNavigate={selectView} />,
    shopping: <ShoppingListPage onNavigate={selectView} />,
    preferences: <PreferencesPanel theme={theme} onToggleTheme={toggleTheme} />,
  };

  function renderNavButton(item, className = "") {
    const isActive = activeView === item.id;

    return (
      <button
        key={item.id}
        className={`bottom-nav-button ${className} ${isActive ? "active" : ""}`.trim()}
        onClick={() => selectView(item.id)}
        type="button"
        aria-label={item.ariaLabel || item.label}
      >
        <FontAwesomeIcon icon={item.icon} />
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <Header onOpenPreferences={() => selectView("preferences")} isPreferencesActive={activeView === "preferences"} />
      <main className="app-main">
        <section className="content-panel" ref={contentRef}>{viewMap[activeView]}</section>
      </main>
      <nav className="bottom-nav" aria-label="Main navigation">
        <div className="bottom-nav-group">{leftNavItems.map((item) => renderNavButton(item))}</div>
        {generateItem && renderNavButton(generateItem, "primary-action")}
        <div className="bottom-nav-group">{rightNavItems.map((item) => renderNavButton(item))}</div>
      </nav>
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
