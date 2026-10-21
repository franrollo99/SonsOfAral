import { useModal } from "../hooks/useModal";
import ImageViewerClose from "./ImageViewerClose";
import "./ImageViewer.css";

export default function ImageViewer({ image, onClose }) {
  const dialogRef = useModal(true, onClose);

  return (
    <div
      className="imageViewerOverlay"
      onClick={(event) => {
        if (!event.target.closest("img, button")) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={image.alt}
        tabIndex={-1}
        className="imageViewerInner"
      >
        <img className="imageViewerImage" src={image.url} alt={image.alt} />
        <ImageViewerClose onClose={onClose} />
      </div>
    </div>
  );
}
