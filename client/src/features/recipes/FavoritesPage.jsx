import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faSpinner, faTrash, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { deleteSavedRecipe, loadSavedRecipe } from "./recipesSlice";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { APP_LIMITS } from "../../app/limits";

export default function FavoritesPage({ onNavigate }) {
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.preferences);
  const { savedRecipes, savedStatus, openStatus, openingId, deleteStatus, deletingId, error } = useSelector((state) => state.recipes);
  const isOpening = openStatus === "loading";
  const isDeleting = deleteStatus === "loading";
  const [deleteTarget, setDeleteTarget] = React.useState(null);

  async function openSavedRecipe(id) {
    try {
      await dispatch(loadSavedRecipe(id)).unwrap();
      onNavigate("recipes");
    } catch {
      // The slice stores the user-facing error message.
    }
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
        <p className="eyebrow">Saved recipes</p>
        <h2>Favorites</h2>
        <p>{savedRecipes.length} of {APP_LIMITS.maxSavedRecipes} favorite recipes saved.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card list-card">
        {savedStatus === "loading" && <p className="empty-state">Loading saved recipes...</p>}
        {savedStatus !== "loading" && savedRecipes.length === 0 && (
          <div className="guide-card compact">
            <div>
              <p className="eyebrow">Next step</p>
              <strong>No favorites yet.</strong>
              <p>Generate and save a recipe to build your list.</p>
            </div>
            <button className="primary-button" type="button" onClick={() => onNavigate("recipes")}>
              <FontAwesomeIcon icon={faUtensils} />
              Generate
            </button>
          </div>
        )}
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
