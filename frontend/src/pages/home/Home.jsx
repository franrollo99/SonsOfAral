import { useEffect, useMemo, useState } from "react";
import "./Home.css";

const API_URL = import.meta.env.VITE_API_URL;

const LS_KEYS = {
  productos: "productos",
  tipos: "tipos-productos",
};

const LS_KEY_LANZAMIENTOS = "lanzamientos";
const LS_KEY_CONCIERTOS = "conciertos";

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch { }
}

function extractData(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

function runIdle(fn) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(fn, { timeout: 1500 });
  } else {
    setTimeout(fn, 300);
  }
}

function pickNextConcert(conciertos) {
  if (!Array.isArray(conciertos)) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const parsed = conciertos
    .map((c) => {
      const rawDate = c?.fecha;

      const d = rawDate ? new Date(rawDate) : null;
      if (!d || Number.isNaN(d.getTime())) return { ...c, __date: null };

      d.setHours(0, 0, 0, 0);
      return { ...c, __date: d };
    })
    .filter((c) => c.__date && c.__date >= now)
    .sort((a, b) => a.__date - b.__date);

  return parsed[0] || null;
}

function pickLatestAlbum(lanzamientos) {
  if (!Array.isArray(lanzamientos)) return null;

  const albums = lanzamientos
    .map((l) => {
      const rawDate = l?.fechaLanzamiento;
      const d = rawDate ? new Date(rawDate) : null;
      const t = d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
      return { ...l, __t: t };
    })
    .sort((a, b) => b.__t - a.__t);

  return albums[0];
}

export default function Home() {
  const [conciertosRaw, setConciertosRaw] = useState([]);
  const [lanzamientosRaw, setLanzamientosRaw] = useState([]);

  const [loading, setLoading] = useState(true);

  const [isPosterOpen, setIsPosterOpen] = useState(false);

  useEffect(() => {
    const cachedConciertos = readCache(LS_KEY_CONCIERTOS);
    const cachedLanzamientos = readCache(LS_KEY_LANZAMIENTOS);

    if (Array.isArray(cachedConciertos?.data)) setConciertosRaw(cachedConciertos.data);
    if (Array.isArray(cachedLanzamientos?.data)) setLanzamientosRaw(cachedLanzamientos.data);

    if (Array.isArray(cachedConciertos?.data) || Array.isArray(cachedLanzamientos?.data)) {
      setLoading(false);
    }

    const controller = new AbortController();

    const fetchConciertos = async () => {
      const res = await fetch(`${API_URL}/conciertos`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} (conciertos)`);
      const json = await res.json().catch(() => ({}));
      const data = extractData(json);
      setConciertosRaw(data);
      writeCache(LS_KEY_CONCIERTOS, data);
    };

    const fetchLanzamientos = async () => {
      const res = await fetch(`${API_URL}/lanzamientos`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} (lanzamientos)`);
      const json = await res.json().catch(() => ({}));
      const data = extractData(json);
      setLanzamientosRaw(data);
      writeCache(LS_KEY_LANZAMIENTOS, data);
    };

    const fetchShop = async () => {
      const prodRes = await fetch(`${API_URL}/productos`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (prodRes.ok) {
        const json = await prodRes.json().catch(() => ({}));
        writeCache(LS_KEYS.productos, extractData(json));
      }
    };

    (async () => {
      try {
        await Promise.all([fetchConciertos(), fetchLanzamientos()]);
      } catch (e) {
        if (e?.name !== "AbortError") console.error("Home prefetch:", e);
      } finally {
        setLoading(false);
      }
    })();

    runIdle(() => {
      fetchShop().catch((e) => {
        if (e?.name !== "AbortError") console.error("Home prefetch shop:", e);
      });
    });

    return () => controller.abort();
  }, []);

  const nextConcert = useMemo(() => pickNextConcert(conciertosRaw), [conciertosRaw]);
  const latestAlbum = useMemo(() => pickLatestAlbum(lanzamientosRaw), [lanzamientosRaw]);

  const posterUrl =
    nextConcert?.cartel?.url ||
    null;

  const posterAlt = "Cartel del próximo concierto";

  const latestAlbumCover = latestAlbum?.imagen;

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setIsPosterOpen(false);
    }
    if (isPosterOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPosterOpen]);

  return (
    <section>
      <div>
        <div className="homePanel homeHero d-flex flex-column flex-md-row align-items-center gap-4">
          <div className="homeHeroMedia">
            <img className="homeHeroImg" src="/images/bandaSOA2.png" alt="Sons of Aral" />
          </div>

          <div className="homeHeroCopy">
            <h1 className="homeHeroTitle">WELCOME TO SONS OF ARAL</h1>
            <p className="homeHeroSubtitle">A NU-METAL/HARDCORE BAND FROM CANTABRIA, SPAIN</p>
          </div>
        </div>
      </div>

      <div>
        {!loading && latestAlbum ? (
          <div className="homeFeaturedReleaseWrap">
            <h2 className="homeSectionTitle">Último lanzamiento</h2>

            <div className="homeFeaturedRelease homePanel">
              <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start justify-content-between gap-4">
                <div className="d-flex flex-column justify-content-between gap-3 homeReleaseBody">
                  <div className="d-flex flex-column gap-2">
                    <h3 className="homeReleaseTitle">{latestAlbum?.titulo}</h3>

                    <div className="homeReleaseMeta">
                      <span>{latestAlbum?.fechaFormateada ?? ""}</span>
                      {latestAlbum?.tipo ? <span className="homeReleaseDot">•</span> : null}
                      <span>{latestAlbum?.tipo ?? ""}</span>
                    </div>

                    {latestAlbum?.descripcion ? (
                      <p className="homeReleaseDesc">{latestAlbum.descripcion}</p>
                    ) : null}
                  </div>

                  <div className="homeReleaseActions">
                    {latestAlbum?.compraUrl ? (
                      <a
                        href={latestAlbum.compraUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-light"
                      >
                        Comprar
                      </a>
                    ) : null}

                    {latestAlbum?.audioUrl ? (
                      <a
                        href={latestAlbum.audioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-light"
                      >
                        Escuchar
                      </a>
                    ) : null}

                    {latestAlbum?.videoUrl ? (
                      <a
                        href={latestAlbum.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-danger"
                      >
                        Ver
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="homeReleaseCover">
                  <img
                    src={latestAlbumCover}
                    alt={`Portada ${latestAlbum?.titulo}`}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="homeSection">
        {!loading && !nextConcert ? null : null}

        {!loading && nextConcert && posterUrl ? (
          <div>
            <div className="d-flex align-items-end justify-content-between gap-3">
              <h2 className="homeSectionTitle m-0">Próximo concierto</h2>
            </div>
            <div className="homeNextConcert homePanel">
              <div className="d-flex flex-column flex-md-row gap-4 mt-3">
                <button
                  type="button"
                  className="homePosterBtn"
                  onClick={() => setIsPosterOpen(true)}
                  aria-label="Ver cartel en grande"
                >
                  <img className="homePosterImg" src={posterUrl} alt={posterAlt} loading="lazy" />
                </button>

                <div className="d-flex flex-column gap-2 flex-grow-1 homeConcertInfo">
                  <h3 className="homeConcertTitle m-0">
                    {nextConcert?.lugar ?? nextConcert?.titulo ?? "Concierto"}
                  </h3>

                  {(nextConcert?.municipio || nextConcert?.provincia) ? (
                    <div className="homeConcertPlace">
                      {nextConcert?.municipio ? nextConcert.municipio : ""}
                      {nextConcert?.municipio && nextConcert?.provincia ? ", " : ""}
                      {nextConcert?.provincia ? nextConcert.provincia : ""}
                    </div>
                  ) : null}

                  {nextConcert?.fecha_formateada || nextConcert?.fechaFormateada ? (
                    <div className="homeConcertDate">
                      {nextConcert?.fecha_formateada ?? nextConcert?.fechaFormateada}
                    </div>
                  ) : null}

                  {nextConcert?.descripcion ? (
                    <p className="homeConcertDesc m-0">{nextConcert.descripcion}</p>
                  ) : null}

                  <div className="d-flex align-items-center justify-content-between gap-3 homeConcertBottom">
                    {nextConcert?.precioEntrada !== null && nextConcert?.precioEntrada !== undefined ? (
                      <span className="homeConcertPrice">
                        Entrada{Number(nextConcert.precioEntrada) === 0 ? " gratis" : `: ${nextConcert.precioEntrada} €`}
                      </span>
                    ) : <span />}

                    {nextConcert?.entradaAnticipada && nextConcert?.enlaceEntradaAnticipada ? (
                      <a
                        href={nextConcert.enlaceEntradaAnticipada}
                        className="btn btn-secondary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Entrada anticipada
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isPosterOpen ? (
          <div className="homeLightbox" onClick={() => setIsPosterOpen(false)}>
            <div className="homeLightboxInner d-flex align-items-center justify-content-center">
              <img
                className="homeLightboxImg"
                src={posterUrl}
                alt={posterAlt}
                onClick={(e) => e.stopPropagation()}
              />

              <button
                type="button"
                className="homeLightboxClose"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPosterOpen(false);
                }}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}