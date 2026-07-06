import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faEnvelope, faRotateRight, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { fetchEmailSettings, fetchShoppingItems, removeShoppingItem, sendShoppingList, toggleShoppingItem } from "./shoppingListSlice";
import { APP_LIMITS } from "../../app/limits";

export default function ShoppingListPage() {
  const dispatch = useDispatch();
  const { items, status, toggleStatus, deleteStatus, sendStatus, emailSettings, togglingId, deletingId, error, message } = useSelector((state) => state.shoppingList);
  const [copyStatus, setCopyStatus] = React.useState("");
  const [recipient, setRecipient] = React.useState("");
  const isLoading = status === "loading";
  const isToggling = toggleStatus === "loading";
  const isDeleting = deleteStatus === "loading";
  const isSending = sendStatus === "loading";
  const listText = items.map((item) => `- ${item.name}`).join("\n");

  React.useEffect(() => {
    dispatch(fetchEmailSettings());
  }, [dispatch]);

  React.useEffect(() => {
    setRecipient(emailSettings.recipient || "");
  }, [emailSettings.recipient]);

  async function copyShoppingList() {
    if (!listText) return;

    try {
      await navigator.clipboard.writeText(listText);
      setCopyStatus("Shopping list copied.");
      window.setTimeout(() => setCopyStatus(""), 2500);
    } catch {
      setCopyStatus("Copy failed. Select and copy the list manually.");
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Shopping list</p>
        <h2>Missing ingredients</h2>
        <p>Generated recipes can add up to {APP_LIMITS.maxShoppingItems} missing ingredients here.</p>
      </div>

      <div className="card action-card">
        <div>
          <strong>{items.length} shopping items</strong>
          <p>{items.length === 0 ? "Your shopping list is empty." : "Copy or send the full list when you are ready."}</p>
          <p className="limit-caption">{items.length} of {APP_LIMITS.maxShoppingItems} shopping items used.</p>
        </div>
        <label className="email-field">
          Recipient
          <input
            type="email"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="name@example.com"
          />
        </label>
        <div className="button-row">
          <button className="secondary-button" type="button" onClick={copyShoppingList} disabled={items.length === 0}>
            <FontAwesomeIcon icon={faCopy} /> Copy All
          </button>
          <button className="primary-button" type="button" onClick={() => dispatch(sendShoppingList(recipient))} disabled={items.length === 0 || isSending}>
            <FontAwesomeIcon icon={isSending ? faSpinner : faEnvelope} spin={isSending} />
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      {(copyStatus || message) && <div className="success-banner">{copyStatus || message}</div>}

      {error && (
        <div className="error-banner">
          {error}
          <button className="secondary-button" type="button" onClick={() => dispatch(fetchShoppingItems())}>
            <FontAwesomeIcon icon={faRotateRight} /> Retry
          </button>
        </div>
      )}

      <div className="card list-card">
        {isLoading && <p className="empty-state">Loading shopping list...</p>}
        {!isLoading && items.length === 0 && <p className="empty-state">No shopping items yet. Generate a recipe and add missing ingredients.</p>}
        {items.map((item) => (
          <div className={`list-row shopping-row ${item.checked ? "checked" : ""}`} key={item.id}>
            <button className="check-button" type="button" onClick={() => dispatch(toggleShoppingItem(item.id))} aria-label={`Toggle ${item.name}`} disabled={isToggling}>
              {togglingId === item.id ? <FontAwesomeIcon icon={faSpinner} spin /> : item.checked && <FontAwesomeIcon icon={faCheck} />}
            </button>
            <strong>{item.name}</strong>
            <button className="icon-button danger" type="button" onClick={() => dispatch(removeShoppingItem(item.id))} aria-label={`Remove ${item.name}`} disabled={isDeleting}>
              <FontAwesomeIcon icon={deletingId === item.id ? faSpinner : faTrash} spin={deletingId === item.id} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
