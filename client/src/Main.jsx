import React from "react";
import IngredientsList from "./components/IngredientsList";
import ClaudeRecipe from "./components/ClaudeRecipe";
import { getRecipeFromMistral } from "./ai";

export default function Main() {
  // error handling state
  const [error, setError] = React.useState("");

  // ingredient items go here
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const recipeRef = React.useRef(null); // Create a ref for the recipe section

  async function getRecipe() {
    setLoading(true);
    setError(""); // Clear previous error
    try {
      const recipeMarkdown = await getRecipeFromMistral(ingredients);
      setRecipe(recipeMarkdown);

      // Scroll only if recipe loaded successfully
      if (recipeRef.current) {
        window.scrollTo({
          top: recipeRef.current.offsetTop,
          behavior: "smooth",
        });
      }
    } catch (error) {
      console.error("Failed to fetch recipe:", error.message);

      // Check for 402 error or generic error
      if (error.message.includes("402")) {
        setError(
          "Error 402: You've hit the usage limit. Please try again later."
        );
      } else if (error.message.includes("exceeded")) {
        setError(
          "You have exceeded your API usage limit. Please try again later."
        );
      } else {
        setError(
          "Recipe service is temporarily unavailable. Please try again later."
        );
      }
    } finally {
      setLoading(false);
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

        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
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
