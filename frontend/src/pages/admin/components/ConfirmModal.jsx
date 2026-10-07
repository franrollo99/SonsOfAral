import { useId } from "react";
import { useModal } from "../../../hooks/useModal";
import "../AdminManagement.css";

function ConfirmModal({
  open,
  title = "Confirmar",
  text = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  error = "",
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const textId = useId();
  const dialogRef = useModal(open, onCancel, !loading);

  if (!open) return null;

  return (
    <div
      className="adminModalOverlay"
      onMouseDown={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        className="adminModal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="adminModalHeader">
          <h3 id={titleId} className="adminModalTitle">
            {title}
          </h3>
          <button
            className="adminModalClose"
            aria-label="Cerrar confirmación"
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="adminModalBody">
          <p id={textId} className="adminMuted" style={{ margin: 0 }}>
            {text}
          </p>
        </div>

        {error && (
          <p className="adminError" role="alert">
            {error}
          </p>
        )}
        <div className="d-flex gap-3">
          <button
            className="adminBtn"
            data-modal-initial-focus
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="adminBtn adminActionBtn--danger"
            type="button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
