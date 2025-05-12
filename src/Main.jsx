import React from "react";
import IngredientsList from "./components/IngredientsList";
import ClaudeRecipe from "./components/ClaudeRecipe";
import { getRecipeFromMistral } from "./ai";

export default function Main() {
  // ingredient items go here
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const recipeRef = React.useRef(null); // Create a ref for the recipe section

  async function getRecipe() {
    setLoading(true); // Show loader
    const recipeMarkdown = await getRecipeFromMistral(ingredients);
    setRecipe(recipeMarkdown); // Update with actual recipe after response
    setLoading(false); // Hide loader

    // Smooth scroll to the recipe section when it's ready
    if (recipeRef.current) {
      window.scrollTo({
        top: recipeRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient");
    setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
  }

  function removeIngredient(ingredientToRemove) {
    setIngredients((prevIngredients) =>
      prevIngredients.filter((ing) => ing !== ingredientToRemove)
    );
  }

  return (
    <main>
      <div className="container">
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
          <IngredientsList
            ingredients={ingredients}
            getRecipe={getRecipe}
            removeIngredient={removeIngredient}
          />
        )}

        {loading ? (
          <div className="loader"></div>
        ) : (
          recipe && (
            <div ref={recipeRef}>
              <ClaudeRecipe recipe={recipe} />
            </div>
          )
        )}
      </div>
    </main>
  );
}
