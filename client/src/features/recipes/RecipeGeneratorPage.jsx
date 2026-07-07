import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faFloppyDisk, faFolderOpen, faSpinner, faTrash, faWandMagicSparkles, faXmark } from "@fortawesome/free-solid-svg-icons";
import { clearGeneratedRecipe, deleteSavedRecipe, fetchGenerationLimit, generateRecipe, loadSavedRecipe, saveGeneratedRecipe } from "./recipesSlice";
import { addShoppingItems } from "../shoppingList/shoppingListSlice";
import InstructionTimer, { getStepDurationSeconds } from "../../components/ui/InstructionTimer";
import { APP_LIMITS } from "../../app/limits";
import { smoothScrollToAfterRender } from "../../app/smoothScroll";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function RecipeGeneratorPage({ onNavigate }) {
  const dispatch = useDispatch();
  const ingredients = useSelector((state) => state.pantry.items);
  const preferences = useSelector((state) => state.preferences);
  const { generatedRecipe, savedRecipes, status, savedStatus, saveStatus, openStatus, openingId, deleteStatus, deletingId, error, savedNotice, generationLimit } = useSelector((state) => state.recipes);
  const { addStatus: shoppingAddStatus, items: shoppingItems } = useSelector((state) => state.shoppingList);
  const ingredientNames = ingredients.map((item) => item.name);
  const isLoading = status === "loading";
  const isSaving = saveStatus === "loading";
  const isOpening = openStatus === "loading";
  const isDeleting = deleteStatus === "loading";
  const isAddingShoppingItems = shoppingAddStatus === "loading";
  const strictModeBlocked = preferences.strictMode && ingredientNames.length < 3;
  const isSavedLimitReached = savedRecipes.length >= APP_LIMITS.maxSavedRecipes;
  const isGeneratedRecipeSaved = savedRecipes.some((recipe) => (
    recipe.title || ""
  ).trim().toLowerCase() === (generatedRecipe?.title || "").trim().toLowerCase());
  const isGenerateLimitReached = generationLimit.remaining <= 0;
  const shoppingRemaining = Math.max(0, APP_LIMITS.maxShoppingItems - shoppingItems.length);
  const missingIngredients = generatedRecipe?.missingIngredients || [];
  const canAddMissingIngredients = missingIngredients.length > 0 && shoppingRemaining > 0;
  const [completedSteps, setCompletedSteps] = React.useState({});
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const recipeRef = React.useRef(null);
  const favoritesRef = React.useRef(null);

  React.useEffect(() => {
    setCompletedSteps({});
  }, [generatedRecipe]);

  React.useEffect(() => {
    dispatch(fetchGenerationLimit());
  }, [dispatch]);

  async function handleGenerate() {
    if (strictModeBlocked || ingredientNames.length === 0 || isGenerateLimitReached) return;

    try {
      await dispatch(generateRecipe({ ingredients: ingredientNames, preferences })).unwrap();
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

  async function confirmDeleteFavorite() {
    if (!deleteTarget) return;

    try {
      await dispatch(deleteSavedRecipe(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
    } catch {
      // The slice stores the user-facing error message.
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">AI recipe generator</p>
        <h2>Generate a recipe from your pantry</h2>
        <p>Pick from your pantry and cook.</p>
      </div>

      <div className="card action-card">
        <div>
          <strong>{ingredientNames.length} pantry items ready</strong>
          {ingredientNames.length > 0 ? (
            <p>
              {ingredientNames.join(", ")}
              {strictModeBlocked && " Add at least 3 items."}
            </p>
          ) : (
            <p>
              <button className="text-link" type="button" onClick={() => onNavigate("pantry")}>
                Add ingredients to the pantry first.
              </button>
            </p>
          )}
          <p className="limit-caption">
            {generationLimit.remaining} of {generationLimit.limit || APP_LIMITS.maxRecipeGenerationsPerDay} recipe generations left today.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={handleGenerate} disabled={isLoading || ingredientNames.length === 0 || strictModeBlocked || isGenerateLimitReached}>
          <FontAwesomeIcon icon={isLoading ? faSpinner : faWandMagicSparkles} spin={isLoading} />
          {isLoading ? "Generating..." : "Generate recipe"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {generatedRecipe && (
        <article className="card recipe-card" ref={recipeRef}>
          <div className="recipe-header">
            <div>
              <p className="eyebrow">AI Chef recommends</p>
              <h3>{generatedRecipe.title}</h3>
              <p>{generatedRecipe.description}</p>
            </div>
            <div className="recipe-actions">
              <button className="save-button" type="button" onClick={handleSaveRecipe} disabled={isSaving || isSavedLimitReached || isGeneratedRecipeSaved}>
                <FontAwesomeIcon icon={isSaving ? faSpinner : faFloppyDisk} spin={isSaving} />
                {isSaving ? "Saving..." : isGeneratedRecipeSaved ? "Saved" : "Save"}
              </button>
              <button className="icon-button" type="button" onClick={() => dispatch(clearGeneratedRecipe())} aria-label="Close generated recipe">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          </div>
          {isGeneratedRecipeSaved && <p className="limit-caption">This recipe is already saved.</p>}
          {savedNotice && <div className="success-banner">{savedNotice}</div>}
          {!isGeneratedRecipeSaved && isSavedLimitReached && <p className="limit-caption">You can save up to {APP_LIMITS.maxSavedRecipes} favorite recipes. Delete one to save another.</p>}

          <div className="recipe-meta">
            <span>{generatedRecipe.prepTime || 10} min prep</span>
            <span>{generatedRecipe.cookTime || 20} min cook</span>
            <span>{generatedRecipe.servings || preferences.servings} servings</span>
            <span>{generatedRecipe.difficulty || "easy"}</span>
          </div>

          <h4>Ingredients</h4>
          <ul className="ingredient-list">
            {(generatedRecipe.ingredients || []).map((item) => {
              const isMissing = missingIngredients.some((missingItem) => missingItem.toLowerCase() === item.toLowerCase());

              return (
                <li className={isMissing ? "missing-ingredient-text" : ""} key={item}>
                  {item}
                  {isMissing && <span className="missing-label">missing</span>}
                </li>
              );
            })}
          </ul>

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
              <div className="missing-pill-row">
                {missingIngredients.map((item) => (
                  <span className="missing-pill" key={item}>{item} <em>missing</em></span>
                ))}
              </div>
              <p className="limit-caption">
              Shopping list: {shoppingItems.length} of {APP_LIMITS.maxShoppingItems} used.
              </p>
              <button className="secondary-button" type="button" onClick={addMissingToShoppingList} disabled={isAddingShoppingItems || !canAddMissingIngredients}>
                <FontAwesomeIcon icon={isAddingShoppingItems ? faSpinner : faCartPlus} spin={isAddingShoppingItems} />
                {isAddingShoppingItems ? "Adding..." : "Add to shopping list"}
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
            <p className="limit-caption">{savedRecipes.length} of {APP_LIMITS.maxSavedRecipes} saved.</p>
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
              <button className="icon-button danger" type="button" onClick={() => setDeleteTarget(recipe)} aria-label={`Delete ${recipe.title}`} disabled={isDeleting || isOpening}>
                <FontAwesomeIcon icon={deletingId === recipe.id ? faSpinner : faTrash} spin={deletingId === recipe.id} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete favorite?"
        message={deleteTarget ? `${deleteTarget.title} will be removed from Favorites.` : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteFavorite}
        isLoading={isDeleting}
      />
    </div>
  );
}
