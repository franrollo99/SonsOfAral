import { useEffect, useEffectEvent, useRef } from "react";

const selector = "button, a[href], input, select, textarea, [tabindex]";

// Shared keyboard behavior for dialogs; effects also clean up on route changes.
export function useModal(open, onClose, dismissible = true) {
  const dialogRef = useRef(null);
  const dismiss = useEffectEvent(() => {
    if (dismissible) onClose();
  });

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      [...dialog.querySelectorAll(selector)].filter(
        (node) =>
          !node.disabled &&
          node.tabIndex >= 0 &&
          !node.closest("[inert]") &&
          node.getClientRects().length > 0,
      );
    const focusInside = () => {
      const items = focusable();
      const initial = items.find((node) =>
        node.hasAttribute("data-modal-initial-focus"),
      );
      (initial || items[0] || dialog).focus();
    };

    // Hide only branches outside the dialog, never an ancestor containing it.
    const siblings = [];
    for (
      let branch = dialog;
      branch.parentElement && branch !== document.body;
      branch = branch.parentElement
    ) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch) {
          siblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
    }
    focusInside();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      } else if (event.key === "Tab") {
        const items = focusable();
        const first = items[0];
        const last = items.at(-1);
        if (!first) {
          event.preventDefault();
          dialog.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            !items.includes(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !items.includes(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const onFocus = (event) => {
      if (!dialog.contains(event.target)) focusInside();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocus);
      document.body.style.overflow = overflow;
      siblings.forEach(([node, inert]) => {
        node.inert = inert;
      });
      if (trigger?.isConnected && !trigger.closest("[inert]")) trigger.focus();
      else document.querySelector("[data-modal-return-focus]")?.focus();
    };
  }, [open]);

  return dialogRef;
}
