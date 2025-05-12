import React from "react";
import IngredientsList from "./components/IngredientsList";
import ClaudeRecipe from "./components/ClaudeRecipe";
import { getRecipeFromMistral } from "./ai";

export default function Main() {
  // ingredient items go here
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient");
    setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
  }

  return (
    <main>
      <div class="container">
        <form action={addIngredient} className="add-ingredient-form">
          <input
            type="text"
            placeholder="e.g. lettuce"
            aria-label="Add ingredient"
            name="ingredient"
            required="required"
            pattern="^(?! )[A-Za-z0-9 ]{0,18}(?<! )$"
          />
          <button>Add ingredient</button>
        </form>

        {ingredients.length > 0 && (
          <IngredientsList ingredients={ingredients} getRecipe={getRecipe} />
        )}

        {loading ? (
          <div className="loader"></div>
        ) : (
          recipe && <ClaudeRecipe recipe={recipe} />
        )}
      </div>
    </main>
  );
}
