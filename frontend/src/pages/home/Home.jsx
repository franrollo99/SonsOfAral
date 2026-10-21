import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { imageSrcSet } from "../../lib/images";
import {
  formatConcertDate,
  pickNextConcert,
  pickLatestRelease,
} from "../../lib/home-content.mjs";
import defaultImages from "../../assets/site-images.json";
import { useContent } from "../../hooks/useContent";
import { useReveal } from "../../hooks/useReveal";
import ReleaseModal from "../../components/ReleaseModal";
import ImageViewer from "../../components/ImageViewer";
import "./Home.css";

export default function Home() {
  const { data: content } = useContent("/contenido-web");
  const concerts = useContent("/conciertos");
  const releases = useContent("/lanzamientos");
  const homeImage = content?.home || defaultImages.home;
  const [lightboxImage, setLightboxImage] = useState(null);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const pageRef = useReveal();
  const nextConcert = useMemo(
    () => pickNextConcert(concerts.data),
    [concerts.data],
  );
  const latestRelease = useMemo(
    () => pickLatestRelease(releases.data),
    [releases.data],
  );
  const poster = nextConcert?.cartel;
  const posterAlt = `Cartel de ${nextConcert?.lugar || "el próximo concierto"}`;

  return (
    <div className="homePage" ref={pageRef}>
      <section className="homeHero" aria-labelledby="home-title">
        <img
          className="homeHeroImg"
          src={homeImage.url}
          srcSet={imageSrcSet(homeImage)}
          sizes="100vw"
          fetchPriority="high"
          alt={homeImage.alt || "Sons of Aral"}
        />
        <div className="homeHeroCopy">
          <h1 id="home-title" className="homeHeroTitle">
            SONS
            <br />
            OF ARAL
          </h1>
          <p className="homeHeroSubtitle">
            Nu-metal y hardcore desde Cantabria, España.
            <br />
            Hecho para sonar en directo.
          </p>
          <div className="homeActions">
            <Link to="/musica" className="btn btn-primary">
              Escuchar música ↗
            </Link>
            <Link to="/conciertos" className="btn btn-primary">
              Ver conciertos ↗
            </Link>
          </div>
        </div>
      </section>

      <section
        className="homeSection"
        aria-labelledby="home-release-title"
        data-reveal
      >
        <header className="homeSectionHeading">
          <h2 id="home-release-title">Último lanzamiento</h2>
        </header>
        {releases.loading && <p role="status">Cargando lanzamiento...</p>}
        {!releases.loading && releases.error && (
          <p className="errorMessage" role="alert">
            No se pudo cargar el último lanzamiento. Vuelve a intentarlo más
            tarde.
          </p>
        )}
        {!releases.loading && !releases.error && !latestRelease && (
          <p className="homeEmpty">Próximamente, nueva música.</p>
        )}
        {!releases.loading && !releases.error && latestRelease && (
          <article className="homeFeature">
            <button
              type="button"
              className="homeReleaseCover"
              aria-label={`Ampliar portada de ${latestRelease.titulo}`}
              aria-haspopup="dialog"
              disabled={!latestRelease.portada?.url}
              onClick={() =>
                setLightboxImage({
                  url: latestRelease.portada?.url,
                  alt: `Portada ${latestRelease.titulo}`,
                })
              }
            >
              {latestRelease.portada?.url ? (
                <img
                  src={latestRelease.portada.url}
                  srcSet={imageSrcSet(latestRelease.portada)}
                  sizes="(max-width: 700px) calc(100vw - 32px), 440px"
                  alt={`Portada ${latestRelease.titulo}`}
                  loading="lazy"
                />
              ) : (
                <span className="homeCoverFallback">
                  {latestRelease.titulo}
                </span>
              )}
            </button>
            <div className="homeFeatureBody">
              <p className="homeFeatureMeta">
                {[latestRelease.fechaFormateada, latestRelease.tipo]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <h3>{latestRelease.titulo}</h3>
              {latestRelease.descripcion && (
                <p className="homeFeatureDescription">
                  {latestRelease.descripcion}
                </p>
              )}
              <div className="homeActions">
                <button
                  type="button"
                  className="homeSongsBtn btn btn-primary"
                  aria-haspopup="dialog"
                  onClick={() => setSelectedRelease(latestRelease)}
                >
                  Ver canciones
                </button>
                {latestRelease.audioUrl && (
                  <a
                    href={latestRelease.audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                  >
                    Escuchar ↗
                  </a>
                )}
                {latestRelease.videoUrl && (
                  <a
                    href={latestRelease.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                  >
                    Ver vídeo ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        )}
      </section>

      <section
        className="homeSection"
        aria-labelledby="home-concert-title"
        data-reveal
      >
        <header className="homeSectionHeading">
          <h2 id="home-concert-title">Próximo concierto</h2>
        </header>
        {concerts.loading && <p role="status">Cargando concierto...</p>}
        {!concerts.loading && concerts.error && (
          <p className="errorMessage" role="alert">
            No se pudo cargar el próximo concierto. Vuelve a intentarlo más
            tarde.
          </p>
        )}
        {!concerts.loading && !concerts.error && !nextConcert && (
          <p className="homeEmpty">Nuevas fechas próximamente.</p>
        )}
        {!concerts.loading && !concerts.error && nextConcert && (
          <article
            className={`homeFeature homeConcert ${poster?.url ? "" : "homeFeatureWithoutImage"}`}
          >
            {poster?.url && (
              <button
                type="button"
                className="homePosterBtn"
                onClick={() =>
                  setLightboxImage({ url: poster.url, alt: posterAlt })
                }
                aria-label="Ver cartel en grande"
                aria-haspopup="dialog"
              >
                <img
                  className="homePosterImg"
                  src={poster.urlSm || poster.url}
                  srcSet={imageSrcSet(poster)}
                  sizes="(max-width: 700px) calc(100vw - 32px), 440px"
                  alt={posterAlt}
                  loading="lazy"
                />
              </button>
            )}
            <div className="homeFeatureBody">
              <time className="homeConcertDate" dateTime={nextConcert.fecha}>
                {nextConcert.fecha_formateada ||
                  nextConcert.fechaFormateada ||
                  formatConcertDate(nextConcert.fecha)}
              </time>
              <h3>{nextConcert.lugar || nextConcert.titulo || "Concierto"}</h3>
              {(nextConcert.municipio || nextConcert.provincia) && (
                <p className="homeConcertPlace">
                  {nextConcert.municipio && (
                    <span className="homeConcertCity">
                      {nextConcert.municipio}
                    </span>
                  )}
                  {nextConcert.provincia && (
                    <span className="homeConcertProvince">
                      {nextConcert.provincia}
                    </span>
                  )}
                </p>
              )}
              {nextConcert.precioEntrada != null && (
                <p className="homeConcertPrice">
                  {Number(nextConcert.precioEntrada) === 0
                    ? "Entrada gratuita"
                    : `Entrada: ${nextConcert.precioEntrada} €`}
                </p>
              )}
              {nextConcert.entradaAnticipada &&
                nextConcert.enlaceEntradaAnticipada && (
                  <a
                    href={nextConcert.enlaceEntradaAnticipada}
                    className="btn btn-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Entradas ↗
                  </a>
                )}
            </div>
          </article>
        )}
      </section>

      {selectedRelease && (
        <ReleaseModal
          lanzamiento={selectedRelease}
          onClose={() => setSelectedRelease(null)}
        />
      )}
      {lightboxImage && (
        <ImageViewer
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
