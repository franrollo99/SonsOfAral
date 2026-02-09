import { useEffect, useMemo, useState } from "react";
import "./Home.css";

const API_URL = import.meta.env.VITE_API_URL;

function pickNextConcert(conciertos) {
  if (!Array.isArray(conciertos)) return null;

  const now = new Date();

  // Intenta coger fecha de campos típicos: fecha, fechaConcierto, fecha_inicio, etc.
  const parsed = conciertos
    .map((c) => {
      const rawDate =
        c.fecha ||
        c.fechaConcierto ||
        c.fecha_concierto ||
        c.fecha_inicio ||
        c.fechaInicio;

      const d = rawDate ? new Date(rawDate) : null;
      return { ...c, __date: d && !isNaN(d.getTime()) ? d : null };
    })
    .filter((c) => c.__date && c.__date >= now)
    .sort((a, b) => a.__date - b.__date);

  return parsed[0] || null;
}

export default function Home() {
  const [nextConcert, setNextConcert] = useState(null);
  const [loadingConcert, setLoadingConcert] = useState(true);
  const [concertError, setConcertError] = useState(null);

  const [isPosterOpen, setIsPosterOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadNextConcert() {
      try {
        setLoadingConcert(true);
        setConcertError(null);

        // Opción A (ideal): si tienes endpoint específico
        // const res = await fetch(`${API_URL}/conciertos/proximo`, { signal: controller.signal });

        // Opción B (normal): listamos y escogemos el más cercano por fecha
        const res = await fetch(`${API_URL}/conciertos`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        // Soportar varias formas típicas de respuesta:
        // - array directo
        // - { data: [...] }
        const conciertos = Array.isArray(json) ? json : json?.data;

        const next = pickNextConcert(conciertos);
        setNextConcert(next);
      } catch (e) {
        if (e.name !== "AbortError") {
          setConcertError("No se pudo cargar el próximo concierto.");
          setNextConcert(null);
        }
      } finally {
        setLoadingConcert(false);
      }
    }

    loadNextConcert();

    return () => controller.abort();
  }, []);

  // Cartel: ajusta el campo al que uses en tu API/resource
  // típicos: cartelUrl, cartel_url, imagen, imagen_url, etc.
  const posterUrl =
    nextConcert?.cartelUrl ||
    nextConcert?.cartel_url ||
    nextConcert?.cartel ||
    nextConcert?.imagenUrl ||
    nextConcert?.imagen_url ||
    null;

  const posterAlt =
    nextConcert?.titulo ||
    nextConcert?.nombre ||
    "Cartel del próximo concierto";

  // Cerrar modal con ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setIsPosterOpen(false);
    }
    if (isPosterOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPosterOpen]);

  return (
    <div className="homePage">
      {/* HERO */}
      <section className="homeHero">
        <img className="homeHeroImg" src="/images/bandaSOA.png" alt="Sons of Aral" />

        {/* overlay suave + slogan */}
        <div className="homeHeroOverlay" />

        <div className="homeHeroText">
          <p className="homeHeroSlogan">Nu/Hardcore band from Spain.</p>
        </div>
      </section>

      {/* PRÓXIMO CONCIERTO (solo si existe) */}
      <section className="homeSection">
        {loadingConcert ? null : null}

        {!loadingConcert && !concertError && posterUrl ? (
          <div className="homeNextConcert">
            <h2 className="homeSectionTitle">Próximo concierto</h2>

            <button
              type="button"
              className="homePosterBtn"
              onClick={() => setIsPosterOpen(true)}
              aria-label="Ver cartel en grande"
            >
              <img className="homePosterImg" src={posterUrl} alt={posterAlt} />
            </button>
          </div>
        ) : null}
      </section>

      {/* LIGHTBOX */}
      {isPosterOpen && posterUrl ? (
        <div
          className="homeLightbox"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setIsPosterOpen(false)}
        >
          <div
            className="homeLightboxInner d-flex justify-content-center align-items-center"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="homeLightboxClose"
              onClick={() => setIsPosterOpen(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>

            <img className="homeLightboxImg" src={posterUrl} alt={posterAlt} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
