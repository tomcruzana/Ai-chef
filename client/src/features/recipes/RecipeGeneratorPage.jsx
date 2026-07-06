import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faFloppyDisk, faFolderOpen, faSpinner, faTrash, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { deleteSavedRecipe, generateRecipe, loadSavedRecipe, saveGeneratedRecipe } from "./recipesSlice";
import { addShoppingItems } from "../shoppingList/shoppingListSlice";
import InstructionTimer, { getStepDurationSeconds } from "../../components/ui/InstructionTimer";

export default function RecipeGeneratorPage({ onNavigate }) {
  const dispatch = useDispatch();
  const ingredients = useSelector((state) => state.pantry.items);
  const preferences = useSelector((state) => state.preferences);
  const { generatedRecipe, savedRecipes, status, savedStatus, saveStatus, openStatus, openingId, deleteStatus, deletingId, error } = useSelector((state) => state.recipes);
  const shoppingAddStatus = useSelector((state) => state.shoppingList.addStatus);
  const ingredientNames = ingredients.map((item) => item.name);
  const isLoading = status === "loading";
  const isSaving = saveStatus === "loading";
  const isOpening = openStatus === "loading";
  const isDeleting = deleteStatus === "loading";
  const isAddingShoppingItems = shoppingAddStatus === "loading";
  const strictModeBlocked = preferences.strictMode && ingredientNames.length < 3;
  const [completedSteps, setCompletedSteps] = React.useState({});

  React.useEffect(() => {
    setCompletedSteps({});
  }, [generatedRecipe]);

  function handleGenerate() {
    if (strictModeBlocked) return;
    dispatch(generateRecipe({ ingredients: ingredientNames, preferences }));
  }

  function addMissingToShoppingList() {
    dispatch(addShoppingItems(generatedRecipe?.missingIngredients || []));
  }

  function toggleStep(index) {
    setCompletedSteps((current) => ({ ...current, [index]: !current[index] }));
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">AI recipe generator</p>
        <h2>Generate a recipe from your pantry</h2>
        <p>Uses pantry items and preferences, then asks the PHP backend to create a structured recipe.</p>
      </div>

      <div className="card action-card">
        <div>
          <strong>{ingredientNames.length} pantry items ready</strong>
          {ingredientNames.length > 0 ? (
            <p>
              {ingredientNames.join(", ")}
              {strictModeBlocked && " Strict mode needs at least 3 pantry items."}
            </p>
          ) : (
            <p>
              <button className="text-link" type="button" onClick={() => onNavigate("pantry")}>
                Add ingredients to the pantry first.
              </button>
            </p>
          )}
        </div>
        <button className="primary-button" type="button" onClick={handleGenerate} disabled={isLoading || ingredientNames.length === 0 || strictModeBlocked}>
          <FontAwesomeIcon icon={isLoading ? faSpinner : faWandMagicSparkles} spin={isLoading} />
          {isLoading ? "Generating..." : "Generate recipe"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {generatedRecipe && (
        <article className="card recipe-card">
          <div className="recipe-header">
            <div>
              <p className="eyebrow">AI Chef recommends</p>
              <h3>{generatedRecipe.title}</h3>
              <p>{generatedRecipe.description}</p>
            </div>
            <button className="secondary-button" type="button" onClick={() => dispatch(saveGeneratedRecipe())} disabled={isSaving}>
              <FontAwesomeIcon icon={isSaving ? faSpinner : faFloppyDisk} spin={isSaving} />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="recipe-meta">
            <span>{generatedRecipe.prepTime || 10} min prep</span>
            <span>{generatedRecipe.cookTime || 20} min cook</span>
            <span>{generatedRecipe.servings || preferences.servings} servings</span>
            <span>{generatedRecipe.difficulty || "easy"}</span>
          </div>

          <h4>Ingredients</h4>
          <ul>{(generatedRecipe.ingredients || []).map((item) => <li key={item}>{item}</li>)}</ul>

          <h4>Instructions</h4>
          <ol className="instruction-list">
            {(generatedRecipe.instructions || []).map((step, index) => {
              const durationSeconds = getStepDurationSeconds(step);

              return (
                <li className={`instruction-step ${completedSteps[index] ? "completed" : ""}`} key={`${step}-${index}`}>
                  <label className="instruction-check">
                    <input type="checkbox" checked={Boolean(completedSteps[index])} onChange={() => toggleStep(index)} />
                    <span>{step}</span>
                  </label>
                  {durationSeconds > 0 && <InstructionTimer seconds={durationSeconds} onComplete={() => setCompletedSteps((current) => ({ ...current, [index]: true }))} />}
                </li>
              );
            })}
          </ol>

          {(generatedRecipe.missingIngredients || []).length > 0 && (
            <div className="missing-box">
              <strong>Missing ingredients</strong>
              <p>{generatedRecipe.missingIngredients.join(", ")}</p>
              <button className="secondary-button" type="button" onClick={addMissingToShoppingList} disabled={isAddingShoppingItems}>
                <FontAwesomeIcon icon={isAddingShoppingItems ? faSpinner : faCartPlus} spin={isAddingShoppingItems} />
                {isAddingShoppingItems ? "Adding..." : "Add to shopping list"}
              </button>
            </div>
          )}
        </article>
      )}

      <div className="card list-card">
        <div className="recipe-header">
          <div>
            <p className="eyebrow">Saved recipes</p>
            <h3>Favorites</h3>
          </div>
        </div>
        {savedStatus === "loading" && <p className="empty-state">Loading saved recipes...</p>}
        {savedStatus !== "loading" && savedRecipes.length === 0 && <p className="empty-state">No saved recipes yet.</p>}
        {savedRecipes.map((recipe) => (
          <div className="list-row" key={recipe.id}>
            <div>
              <strong>{recipe.title}</strong>
              <span>{recipe.servings || preferences.servings} servings - {recipe.difficulty || "easy"}</span>
            </div>
            <div className="button-row">
              <button className="secondary-button" type="button" onClick={() => dispatch(loadSavedRecipe(recipe.id))} disabled={isOpening || isDeleting}>
                <FontAwesomeIcon icon={openingId === recipe.id ? faSpinner : faFolderOpen} spin={openingId === recipe.id} />
                Open
              </button>
              <button className="icon-button danger" type="button" onClick={() => dispatch(deleteSavedRecipe(recipe.id))} aria-label={`Delete ${recipe.title}`} disabled={isDeleting || isOpening}>
                <FontAwesomeIcon icon={deletingId === recipe.id ? faSpinner : faTrash} spin={deletingId === recipe.id} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
