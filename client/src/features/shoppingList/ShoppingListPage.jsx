import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faEnvelope, faRotateRight, faSpinner, faTrash, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { fetchEmailSettings, fetchShoppingItems, removeShoppingItem, sendShoppingList, toggleShoppingItem } from "./shoppingListSlice";
import { APP_LIMITS } from "../../app/limits";
import { smoothScrollToAfterRender } from "../../app/smoothScroll";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function ShoppingListPage({ onNavigate }) {
  const dispatch = useDispatch();
  const { items, status, toggleStatus, deleteStatus, sendStatus, emailSettings, togglingId, deletingId, error, message } = useSelector((state) => state.shoppingList);
  const [copyStatus, setCopyStatus] = React.useState("");
  const [recipient, setRecipient] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const statusRef = React.useRef(null);
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
      smoothScrollToAfterRender(() => statusRef.current);
      window.setTimeout(() => setCopyStatus(""), 2500);
    } catch {
      setCopyStatus("Copy failed. Select and copy the list manually.");
      smoothScrollToAfterRender(() => statusRef.current);
    }
  }

  async function handleSendShoppingList() {
    try {
      await dispatch(sendShoppingList(recipient)).unwrap();
      smoothScrollToAfterRender(() => statusRef.current);
    } catch {
      smoothScrollToAfterRender(() => statusRef.current);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await dispatch(removeShoppingItem(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
    } catch {
      // The slice stores the user-facing error message.
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Shopping list</p>
        <h2>Missing ingredients</h2>
        <p>Items to buy.</p>
      </div>

      <div className="card action-card">
        <div>
          <strong>{items.length} shopping items</strong>
          <p>{items.length === 0 ? "Nothing here yet." : "Copy or send the list."}</p>
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
          <button className="primary-button" type="button" onClick={handleSendShoppingList} disabled={items.length === 0 || isSending}>
            <FontAwesomeIcon icon={isSending ? faSpinner : faEnvelope} spin={isSending} />
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      <div ref={statusRef}>
        {(copyStatus || message) && <div className="success-banner">{copyStatus || message}</div>}
      </div>

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
        {!isLoading && items.length === 0 && (
          <div className="guide-card compact">
            <div>
              <p className="eyebrow">Next step</p>
              <strong>No shopping items yet.</strong>
              <p>Add missing ingredients from a recipe.</p>
            </div>
            <button className="primary-button" type="button" onClick={() => onNavigate("recipes")}>
              <FontAwesomeIcon icon={faUtensils} />
              Generate
            </button>
          </div>
        )}
        {items.map((item) => (
          <div className={`list-row shopping-row ${item.checked ? "checked" : ""}`} key={item.id}>
            <button className="check-button" type="button" onClick={() => dispatch(toggleShoppingItem(item.id))} aria-label={`Toggle ${item.name}`} disabled={isToggling}>
              {togglingId === item.id ? <FontAwesomeIcon icon={faSpinner} spin /> : item.checked && <FontAwesomeIcon icon={faCheck} />}
            </button>
            <strong>{item.name}</strong>
            <button className="icon-button danger" type="button" onClick={() => setDeleteTarget(item)} aria-label={`Remove ${item.name}`} disabled={isDeleting}>
              <FontAwesomeIcon icon={deletingId === item.id ? faSpinner : faTrash} spin={deletingId === item.id} />
            </button>
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Remove shopping item?"
        message={deleteTarget ? `${deleteTarget.name} will be removed from your shopping list.` : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
