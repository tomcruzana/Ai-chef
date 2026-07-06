import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCarrot, faRotateRight, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { createPantryItem, deletePantryItem, fetchPantryItems } from "./pantrySlice";
import { APP_LIMITS } from "../../app/limits";
import { smoothScrollToAfterRender } from "../../app/smoothScroll";

export default function PantryPage() {
  const dispatch = useDispatch();
  const { items, status, saveStatus, deleteStatus, deletingId, error } = useSelector((state) => state.pantry);
  const [form, setForm] = React.useState({ name: "", quantity: "" });
  const formRef = React.useRef(null);
  const isLoading = status === "loading";
  const isSaving = saveStatus === "loading";
  const isDeleting = deleteStatus === "loading";
  const isAtLimit = items.length >= APP_LIMITS.maxPantryItems;

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || isAtLimit) return;

    try {
      await dispatch(createPantryItem(form)).unwrap();
      setForm({ name: "", quantity: "" });
      smoothScrollToAfterRender(() => formRef.current);
    } catch {
      // The slice stores the user-facing error message.
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Pantry manager</p>
        <h2>Ingredients on hand</h2>
        <p>Add up to {APP_LIMITS.maxPantryItems} ingredients the AI chef can use when creating recipe suggestions.</p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button className="secondary-button" type="button" onClick={() => dispatch(fetchPantryItems())}>
            <FontAwesomeIcon icon={faRotateRight} /> Retry
          </button>
        </div>
      )}

      <div className="card list-card">
        <div className="limit-caption">
          {items.length} of {APP_LIMITS.maxPantryItems} pantry ingredients used
        </div>
        {isAtLimit && <p className="empty-state">Pantry limit reached. Remove an ingredient before adding another.</p>}
        {isLoading && <p className="empty-state">Loading pantry items...</p>}
        {!isLoading && items.length === 0 && <p className="empty-state">No pantry items yet.</p>}
        {items.map((item) => (
          <div className="list-row" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.category} {item.quantity && `- ${item.quantity}${item.unit ? ` ${item.unit}` : ""}`}</span>
            </div>
            <button className="icon-button danger" type="button" onClick={() => dispatch(deletePantryItem(item.id))} aria-label={`Remove ${item.name}`} disabled={isDeleting}>
              <FontAwesomeIcon icon={deletingId === item.id ? faSpinner : faTrash} spin={deletingId === item.id} />
            </button>
          </div>
        ))}
      </div>

      <form className="card form-grid pantry-form-grid" onSubmit={handleSubmit} ref={formRef}>
        <label>
          Ingredient
          <input name="name" value={form.name} onChange={updateField} placeholder="e.g. lettuce" maxLength="40" disabled={isSaving} />
        </label>
        <label>
          Quantity
          <input name="quantity" value={form.quantity} onChange={updateField} placeholder="2" disabled={isSaving} />
        </label>
        <button className="primary-button" type="submit" disabled={isSaving || !form.name.trim() || isAtLimit}>
          <FontAwesomeIcon icon={isSaving ? faSpinner : faCarrot} spin={isSaving} />
          {isSaving ? "Adding..." : "Add item"}
        </button>
      </form>
    </div>
  );
}
