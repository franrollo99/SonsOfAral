import "./ImageViewerClose.css";

export default function ImageViewerClose({ onClose, title = "Cerrar imagen" }) {
  return (
    <button
      type="button"
      className="imageViewerClose"
      onClick={onClose}
      aria-label="Cerrar"
      title={title}
    >
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    </button>
  );
}
