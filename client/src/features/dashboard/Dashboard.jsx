import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBasketShopping,
  faCartShopping,
  faUtensils,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import StatCard from "../../components/ui/StatCard";

export default function Dashboard({ onNavigate }) {
  const pantryCount = useSelector((state) => state.pantry.items.length);
  const savedRecipesCount = useSelector((state) => state.recipes.savedRecipes.length);
  const shoppingCount = useSelector((state) => state.shoppingList.items.length);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Kitchen dashboard</p>
          <h2>Cook smarter from ingredients you already have.</h2>
          <p>
            Manage pantry items, generate recipe ideas, save favorites, and build a shopping list from missing ingredients.
          </p>
          <button className="primary-button" type="button" onClick={() => onNavigate("recipes")}>
            <FontAwesomeIcon icon={faWandMagicSparkles} /> Generate a recipe
          </button>
        </div>
      </section>

      <section className="stats-grid" aria-label="AI Chef summary">
        <StatCard icon={faBasketShopping} label="Pantry items" value={pantryCount} helper="Ready for recipe matching" />
        <StatCard icon={faUtensils} label="Saved recipes" value={savedRecipesCount} helper="Favorites and history" />
        <StatCard icon={faCartShopping} label="Shopping items" value={shoppingCount} helper="Missing ingredients" />
      </section>
    </div>
  );
}
