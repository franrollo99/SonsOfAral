import { useEffect, useRef } from "react";

export function useReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!container || preference.matches || !window.IntersectionObserver)
      return;

    const elements = [...container.querySelectorAll("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("revealPending");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );

    const showAll = () => {
      if (!preference.matches) return;
      elements.forEach((element) => element.classList.remove("revealPending"));
      observer.disconnect();
    };
    elements.forEach((element) => {
      // Already visible content should never briefly disappear.
      if (element.getBoundingClientRect().top >= window.innerHeight) {
        element.classList.add("revealPending");
      }
      observer.observe(element);
    });
    preference.addEventListener("change", showAll);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", showAll);
      elements.forEach((element) => element.classList.remove("revealPending"));
    };
  }, []);

  return containerRef;
}
