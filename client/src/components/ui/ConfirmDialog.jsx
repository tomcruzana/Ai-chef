import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function ConfirmDialog({ isOpen, title, message, confirmLabel = "Delete", onCancel, onConfirm, isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <button className="icon-button dialog-close" type="button" onClick={onCancel} aria-label="Close dialog" disabled={isLoading}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <div className="dialog-icon">
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </div>
        <div>
          <h3 id="confirm-dialog-title">{title}</h3>
          <p>{message}</p>
        </div>
        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className="danger-button" type="button" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
