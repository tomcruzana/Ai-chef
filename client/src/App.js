import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBasketShopping,
  faCartShopping,
  faHouse,
  faSliders,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import Header from "./components/layout/Header";
import Dashboard from "./features/dashboard/Dashboard";
import PantryPage from "./features/pantry/PantryPage";
import RecipeGeneratorPage from "./features/recipes/RecipeGeneratorPage";
import ShoppingListPage from "./features/shoppingList/ShoppingListPage";
import PreferencesPanel from "./features/preferences/PreferencesPanel";
import { fetchPantryItems } from "./features/pantry/pantrySlice";
import { useDispatch } from "react-redux";
import { fetchSavedRecipes } from "./features/recipes/recipesSlice";
import { fetchShoppingItems } from "./features/shoppingList/shoppingListSlice";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: faHouse },
  { id: "recipes", label: "Generate", icon: faUtensils },
  { id: "pantry", label: "Pantry", icon: faBasketShopping },
  { id: "shopping", label: "Shopping", icon: faCartShopping },
  { id: "preferences", label: "Preferences", icon: faSliders },
];

export default function App() {
  const dispatch = useDispatch();
  const [activeView, setActiveView] = React.useState("dashboard");
  const [theme, setTheme] = React.useState(() => localStorage.getItem("ai-chef-theme") || "blue");

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

  const viewMap = {
    dashboard: <Dashboard onNavigate={setActiveView} />,
    recipes: <RecipeGeneratorPage onNavigate={setActiveView} />,
    pantry: <PantryPage />,
    shopping: <ShoppingListPage />,
    preferences: <PreferencesPanel />,
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="app-main">
        <aside className="sidebar" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${activeView === item.id ? "active" : ""}`}
              onClick={() => setActiveView(item.id)}
              type="button"
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>
        <section className="content-panel">{viewMap[activeView]}</section>
      </main>
    </div>
  );
}
