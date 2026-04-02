import { useEffect } from "react";
import "../AdminManagement.css";

function ConfirmModal({
  open,
  title = "Confirmar",
  text = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="adminModalOverlay" role="dialog" aria-modal="true" onMouseDown={onCancel}>
      <div className="adminModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="adminModalHeader">
          <h3 className="adminModalTitle">{title}</h3>
          <button className="adminModalClose" type="button" onClick={onCancel} disabled={loading}>
            ✕
          </button>
        </div>

        <div className="adminModalBody">
          <p className="adminMuted" style={{ margin: 0 }}>
            {text}
          </p>
        </div>

        <div className="adminModalFooter">
          <button className="adminBtn" type="button" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button className="adminBtn" type="button" onClick={onConfirm} disabled={loading}>
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;