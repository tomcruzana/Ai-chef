import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBasketShopping, faCartPlus, faFloppyDisk, faFolderOpen, faSpinner, faTrash, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { deleteSavedRecipe, generateRecipe, loadSavedRecipe, saveGeneratedRecipe } from "./recipesSlice";
import { addShoppingItems } from "../shoppingList/shoppingListSlice";
import InstructionTimer, { getStepDurationSeconds } from "../../components/ui/InstructionTimer";
import { APP_LIMITS } from "../../app/limits";
import { smoothScrollToAfterRender } from "../../app/smoothScroll";

const generateLimitKey = "ai-chef-recipe-generations";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readGenerateUsage() {
  try {
    const usage = JSON.parse(localStorage.getItem(generateLimitKey) || "{}");
    return usage.date === getTodayKey() ? Number(usage.count || 0) : 0;
  } catch {
    return 0;
  }
}

function saveGenerateUsage(count) {
  localStorage.setItem(generateLimitKey, JSON.stringify({ date: getTodayKey(), count }));
}

export default function RecipeGeneratorPage({ onNavigate }) {
  const dispatch = useDispatch();
  const ingredients = useSelector((state) => state.pantry.items);
  const preferences = useSelector((state) => state.preferences);
  const { generatedRecipe, savedRecipes, status, savedStatus, saveStatus, openStatus, openingId, deleteStatus, deletingId, error } = useSelector((state) => state.recipes);
  const { addStatus: shoppingAddStatus, items: shoppingItems } = useSelector((state) => state.shoppingList);
  const ingredientNames = ingredients.map((item) => item.name);
  const isLoading = status === "loading";
  const isSaving = saveStatus === "loading";
  const isOpening = openStatus === "loading";
  const isDeleting = deleteStatus === "loading";
  const isAddingShoppingItems = shoppingAddStatus === "loading";
  const strictModeBlocked = preferences.strictMode && ingredientNames.length < 3;
  const isSavedLimitReached = savedRecipes.length >= APP_LIMITS.maxSavedRecipes;
  const [generateCount, setGenerateCount] = React.useState(readGenerateUsage);
  const generateRemaining = Math.max(0, APP_LIMITS.maxRecipeGenerationsPerDay - generateCount);
  const isGenerateLimitReached = generateRemaining === 0;
  const shoppingRemaining = Math.max(0, APP_LIMITS.maxShoppingItems - shoppingItems.length);
  const missingIngredients = generatedRecipe?.missingIngredients || [];
  const canAddMissingIngredients = missingIngredients.length > 0 && shoppingRemaining > 0;
  const [completedSteps, setCompletedSteps] = React.useState({});
  const recipeRef = React.useRef(null);
  const favoritesRef = React.useRef(null);

  React.useEffect(() => {
    setCompletedSteps({});
  }, [generatedRecipe]);

  async function handleGenerate() {
    if (strictModeBlocked || isGenerateLimitReached) return;

    try {
      await dispatch(generateRecipe({ ingredients: ingredientNames, preferences })).unwrap();
      const nextCount = Math.min(APP_LIMITS.maxRecipeGenerationsPerDay, generateCount + 1);
      setGenerateCount(nextCount);
      saveGenerateUsage(nextCount);
      smoothScrollToAfterRender(() => recipeRef.current);
    } catch {
      // The slice stores the user-facing error message.
    }
  }

  async function addMissingToShoppingList() {
    if (!canAddMissingIngredients) return;

    try {
      await dispatch(addShoppingItems(missingIngredients.slice(0, shoppingRemaining))).unwrap();
      onNavigate("shopping");
    } catch {
      // The slice stores the user-facing error message.
    }
  }

  async function handleSaveRecipe() {
    try {
      await dispatch(saveGeneratedRecipe()).unwrap();
      smoothScrollToAfterRender(() => favoritesRef.current);
    } catch {
      // The slice stores the user-facing error message.
    }
  }

  async function openSavedRecipe(id) {
    try {
      await dispatch(loadSavedRecipe(id)).unwrap();
      smoothScrollToAfterRender(() => recipeRef.current);
    } catch {
      // The slice stores the user-facing error message.
    }
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
          <p className="limit-caption">
            {generateRemaining} of {APP_LIMITS.maxRecipeGenerationsPerDay} recipe generations left today.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={handleGenerate} disabled={isLoading || ingredientNames.length === 0 || strictModeBlocked || isGenerateLimitReached}>
          <FontAwesomeIcon icon={isLoading ? faSpinner : faWandMagicSparkles} spin={isLoading} />
          {isLoading ? "Generating..." : "Generate recipe"}
        </button>
      </div>

      {!generatedRecipe && ingredientNames.length > 0 && (
        <div className="guide-card">
          <div>
            <p className="eyebrow">Suggested next step</p>
            <strong>Generate a recipe from your pantry.</strong>
            <p>After the recipe appears, you can save it or send missing ingredients to Shopping.</p>
          </div>
          <button className="secondary-button" type="button" onClick={handleGenerate} disabled={isLoading || strictModeBlocked || isGenerateLimitReached}>
            <FontAwesomeIcon icon={faWandMagicSparkles} />
            Generate
          </button>
        </div>
      )}

      {!generatedRecipe && ingredientNames.length === 0 && (
        <div className="guide-card">
          <div>
            <p className="eyebrow">Start here</p>
            <strong>Add pantry ingredients first.</strong>
            <p>AI Chef needs ingredients before it can suggest a recipe.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => onNavigate("pantry")}>
            <FontAwesomeIcon icon={faBasketShopping} />
            Pantry
          </button>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {generatedRecipe && (
        <article className="card recipe-card" ref={recipeRef}>
          <div className="recipe-header">
            <div>
              <p className="eyebrow">AI Chef recommends</p>
              <h3>{generatedRecipe.title}</h3>
              <p>{generatedRecipe.description}</p>
            </div>
            <button className="secondary-button" type="button" onClick={handleSaveRecipe} disabled={isSaving || isSavedLimitReached}>
              <FontAwesomeIcon icon={isSaving ? faSpinner : faFloppyDisk} spin={isSaving} />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
          {isSavedLimitReached && <p className="limit-caption">You can save up to {APP_LIMITS.maxSavedRecipes} favorite recipes. Delete one to save another.</p>}

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

          {missingIngredients.length > 0 && (
            <div className="missing-box">
              <strong>Missing ingredients</strong>
              <p>{missingIngredients.join(", ")}</p>
              <p className="limit-caption">
                Shopping list space: {shoppingItems.length} of {APP_LIMITS.maxShoppingItems} items used.
              </p>
              <button className="secondary-button" type="button" onClick={addMissingToShoppingList} disabled={isAddingShoppingItems || !canAddMissingIngredients}>
                <FontAwesomeIcon icon={isAddingShoppingItems ? faSpinner : faCartPlus} spin={isAddingShoppingItems} />
                {isAddingShoppingItems ? "Adding..." : "Add to shopping list"}
              </button>
            </div>
          )}

          {missingIngredients.length === 0 && (
            <div className="guide-card compact">
              <div>
                <p className="eyebrow">Next step</p>
                <strong>Save this recipe if it is a keeper.</strong>
                <p>You can reopen saved favorites from this page any time.</p>
              </div>
              <button className="secondary-button" type="button" onClick={handleSaveRecipe} disabled={isSaving || isSavedLimitReached}>
                <FontAwesomeIcon icon={faArrowRight} />
                Save
              </button>
            </div>
          )}
        </article>
      )}

      <div className="card list-card" ref={favoritesRef}>
        <div className="recipe-header">
          <div>
            <p className="eyebrow">Saved recipes</p>
            <h3>Favorites</h3>
            <p className="limit-caption">{savedRecipes.length} of {APP_LIMITS.maxSavedRecipes} favorite recipes saved.</p>
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
              <button className="secondary-button" type="button" onClick={() => openSavedRecipe(recipe.id)} disabled={isOpening || isDeleting}>
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
