import "./ConfirmDialog.css";

export default function ConfirmDialog({
  open,
  title = "Confirm Action",
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="cd-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="cd-card">
        <h3 className="cd-title">{title}</h3>
        <p className="cd-message">{message}</p>
        <div className="cd-actions">
          <button type="button" className="cd-btn cd-btn-cancel" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className="cd-btn cd-btn-confirm" onClick={onConfirm} disabled={loading}>
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
