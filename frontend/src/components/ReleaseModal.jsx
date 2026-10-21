import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../lib/api";
import { useModal } from "../hooks/useModal";
import ImageViewerClose from "./ImageViewerClose";
import "./ReleaseModal.css";

export default function ReleaseModal({ lanzamiento, onClose }) {
  const lanzamientoSeleccionado = {
    ...lanzamiento,
    canciones: Array.isArray(lanzamiento.canciones)
      ? lanzamiento.canciones
      : [],
  };
  const audioRef = useRef(null);
  const audioController = useRef(null);
  const audioBlobUrl = useRef(null);
  const [audioError, setAudioError] = useState("");
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const compraUrl = (lanzamientoSeleccionado?.compraUrl || "").trim();
  const audioUrl = (lanzamientoSeleccionado?.audioUrl || "").trim();
  const videoUrl = (lanzamientoSeleccionado?.videoUrl || "").trim();

  const formatTime = (secs) => {
    const n = Number(secs) || 0;
    const m = Math.floor(n / 60);
    const s = Math.floor(n % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const stopAudio = () => {
    audioController.current?.abort();
    if (audioBlobUrl.current) {
      URL.revokeObjectURL(audioBlobUrl.current);
      audioBlobUrl.current = null;
    }
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src.startsWith("blob:")) {
      URL.revokeObjectURL(audio.src);
    }

    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    setIsPlaying(false);
    setActiveTrackId(null);
    setCurrentTime(0);
    setDuration(0);
  };

  const cerrarModal = () => {
    stopAudio();
    onClose();
  };

  const dialogRef = useModal(true, cerrarModal);

  const toggleTrack = (track) => {
    const url = `/canciones/${track.id}/audio`;
    const id = track?.id;

    if (!url || !id) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrackId === id) {
      if (audio.paused) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setAudioError("No se pudo reproducir esta canción."));
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }

    const cargarYReproducir = async () => {
      audioController.current?.abort();
      const controller = new AbortController();
      audioController.current = controller;
      setAudioError("");
      try {
        const res = await apiRequest(url, {
          auth: false,
          signal: controller.signal,
        });
        const blob = await res.blob();
        if (controller.signal.aborted) return;
        if (audioBlobUrl.current) URL.revokeObjectURL(audioBlobUrl.current);
        const blobUrl = URL.createObjectURL(blob);
        audioBlobUrl.current = blobUrl;

        audio.src = blobUrl;
        audio.load();

        await audio.play();
        if (controller.signal.aborted) return;

        setActiveTrackId(id);
        setIsPlaying(true);
      } catch {
        if (!controller.signal.aborted)
          setAudioError("No se pudo reproducir esta canción.");
      }
    };

    cargarYReproducir();
  };

  useEffect(
    () => () => {
      audioController.current?.abort();
      if (audioBlobUrl.current) URL.revokeObjectURL(audioBlobUrl.current);
    },
    [],
  );

  const onSeekTrack = (value) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(value) || 0;
    setCurrentTime(audio.currentTime);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveTrackId(null);
      if (audio.duration) setDuration(audio.duration);
    };

    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, []);

  return (
    <div className="releaseModalOverlay" onMouseDown={cerrarModal}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="release-dialog-title"
        tabIndex={-1}
        className="releaseModal d-flex flex-column"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ImageViewerClose onClose={cerrarModal} title="Cerrar lanzamiento" />

        <audio ref={audioRef} preload="auto" style={{ display: "none" }} />

        <div className="modalGrid">
          <aside className="modalLeft d-flex flex-column">
            <div className="cover">
              {lanzamientoSeleccionado.portada?.url ? (
                <img
                  src={lanzamientoSeleccionado.portada.url}
                  alt={`Portada ${lanzamientoSeleccionado.titulo}`}
                />
              ) : (
                <p className="releaseCoverFallback">Sin portada</p>
              )}
            </div>

            <div className="leftMeta d-flex flex-column gap-3">
              <div className="smallMeta">
                PISTAS: {(lanzamientoSeleccionado.canciones ?? []).length}{" "}
                <span>|</span> DURACIÓN:{" "}
                {lanzamientoSeleccionado.duracionTotalMinutos} MIN
              </div>

              {(compraUrl || audioUrl || videoUrl) && (
                <div className="buttons d-flex flex-column gap-3 mt-4">
                  {(compraUrl || audioUrl) && (
                    <div className="d-flex gap-3">
                      {compraUrl && (
                        <a
                          href={compraUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-light btnWide buyListen"
                        >
                          COMPRAR
                        </a>
                      )}

                      {audioUrl && (
                        <a
                          href={audioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-light btnWide buyListen"
                        >
                          ESCUCHAR
                        </a>
                      )}
                    </div>
                  )}

                  {videoUrl && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-danger btnWide"
                    >
                      VER
                    </a>
                  )}
                </div>
              )}
            </div>
          </aside>

          <div className="modalRight d-flex flex-column gap-3">
            <header className="headerModal">
              <h2 id="release-dialog-title" className="title">
                {lanzamientoSeleccionado.titulo}
              </h2>
              <div className="sub">
                {lanzamientoSeleccionado.fechaFormateada} ·{" "}
                {lanzamientoSeleccionado.tipo}
              </div>
            </header>

            <div className="rightContent d-flex flex-column gap-3">
              <p className="releaseDescription">
                {lanzamientoSeleccionado.descripcion}
              </p>
              <hr className="divider" />
              <div className="tracklist">
                {audioError && (
                  <p className="errorMessage" role="alert">
                    {audioError}
                  </p>
                )}
                <ol>
                  {(lanzamientoSeleccionado.canciones ?? []).map((c, idx) => {
                    const hasAudio = !!c?.audio?.url;
                    const isActive = activeTrackId === c?.id;
                    const shownTime = isActive
                      ? `${formatTime(currentTime)} / ${formatTime(duration || c?.duracion || 0)}`
                      : (c?.duracion_formateada ?? c?.duracionFormateada ?? "");

                    return (
                      <li
                        key={c.id ?? idx}
                        className={`trackRow ${isActive ? "isActive" : ""}`}
                      >
                        <div className="trackLead">
                          <span className="trackIndex">{idx + 1}</span>
                        </div>

                        <div className="trackMain">
                          <div className="trackTop">
                            <span className="trackName">{c.titulo}</span>
                            <span className="trackTime">{shownTime}</span>
                          </div>

                          {hasAudio && (
                            <div className="trackPlayerRow">
                              <button
                                type="button"
                                className={`trackPlayBtn ${isActive && isPlaying ? "isPlaying" : ""}`}
                                onClick={() => toggleTrack(c)}
                                aria-label={`${isActive && isPlaying ? "Pausar" : "Reproducir"} ${c.titulo}`}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  width="22"
                                  height="22"
                                  fill="currentColor"
                                  aria-hidden="true"
                                  focusable="false"
                                >
                                  {isActive && isPlaying ? (
                                    <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                                  ) : (
                                    <path d="M7 3v18l15-9z" />
                                  )}
                                </svg>
                              </button>

                              {isActive ? (
                                <input
                                  aria-label={`Posición de ${c.titulo}`}
                                  aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration || c.duracion)}`}
                                  type="range"
                                  min="0"
                                  max={Math.max(
                                    duration || c?.duracion || 0,
                                    1,
                                  )}
                                  step="0.1"
                                  value={Math.min(
                                    currentTime,
                                    duration || c?.duracion || 0,
                                  )}
                                  onChange={(e) => onSeekTrack(e.target.value)}
                                  className="trackProgress"
                                />
                              ) : (
                                <div className="trackProgress trackProgressPlaceholder" />
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {(!lanzamientoSeleccionado.canciones ||
                  lanzamientoSeleccionado.canciones.length === 0) && (
                  <div className="text-secondary">
                    Sin canciones para mostrar.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
