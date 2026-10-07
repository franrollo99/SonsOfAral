import { imageSrcSet } from "../../lib/images";
import defaultImages from "../../assets/site-images.json";
import { useContent } from "../../hooks/useContent";
import { useMemo, useState } from "react";
import "./Home.css";
import { useModal } from "../../hooks/useModal";

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
  const { data: content } = useContent("/contenido-web");
  const homeImage = content?.home || defaultImages.home;
  const concerts = useContent("/conciertos");
  const releases = useContent("/lanzamientos");
  const conciertosRaw = concerts.data;
  const lanzamientosRaw = releases.data;
  const loading = concerts.loading || releases.loading;

  const [isPosterOpen, setIsPosterOpen] = useState(false);

  const nextConcert = useMemo(
    () => pickNextConcert(conciertosRaw),
    [conciertosRaw],
  );
  const latestAlbum = useMemo(
    () => pickLatestAlbum(lanzamientosRaw),
    [lanzamientosRaw],
  );

  const poster = nextConcert?.cartel || null;

  const posterUrl = poster?.url || null;
  const posterThumbUrl = poster?.urlSm || poster?.url || null;
  const posterLightboxUrl = poster?.url || null;

  const posterAlt = "Cartel del próximo concierto";

  const latestAlbumCover = latestAlbum?.portada || null;

  const dialogRef = useModal(isPosterOpen, () => setIsPosterOpen(false));

  return (
    <section>
      {(concerts.error || releases.error) && (
        <p className="errorMessage" role="alert">
          No se pudo actualizar parte del contenido. Vuelve a intentarlo más
          tarde.
        </p>
      )}
      <div>
        <div className="homePanel homeHero d-flex flex-column flex-md-row align-items-center gap-4">
          <div className="homeHeroMedia">
            <img
              className="homeHeroImg"
              src={homeImage.url}
              srcSet={imageSrcSet(homeImage)}
              sizes="(max-width: 760px) calc(100vw - 32px), 55vw"
              fetchPriority="high"
              alt={homeImage.alt}
            />
          </div>

          <div className="homeHeroCopy">
            <h1 className="homeHeroTitle">WELCOME TO SONS OF ARAL</h1>
            <p className="homeHeroSubtitle">
              A NU-METAL/HARDCORE BAND FROM CANTABRIA, SPAIN
            </p>
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
                      {latestAlbum?.tipo ? (
                        <span className="homeReleaseDot">•</span>
                      ) : null}
                      <span>{latestAlbum?.tipo ?? ""}</span>
                    </div>

                    {latestAlbum?.descripcion ? (
                      <p className="homeReleaseDesc">
                        {latestAlbum.descripcion}
                      </p>
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
                    src={latestAlbumCover?.url}
                    srcSet={imageSrcSet(latestAlbumCover)}
                    sizes="(max-width: 768px) 100vw, 420px"
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
                  <img
                    className="homePosterImg"
                    src={posterThumbUrl}
                    srcSet={imageSrcSet(poster)}
                    sizes="(max-width: 768px) 100vw, 320px"
                    alt={posterAlt}
                    loading="lazy"
                  />
                </button>
                <div className="d-flex flex-column gap-2 flex-grow-1 homeConcertInfo">
                  <h3 className="homeConcertTitle m-0">
                    {nextConcert?.lugar ?? nextConcert?.titulo ?? "Concierto"}
                  </h3>

                  {nextConcert?.municipio || nextConcert?.provincia ? (
                    <div className="homeConcertPlace">
                      {nextConcert?.municipio ? nextConcert.municipio : ""}
                      {nextConcert?.municipio && nextConcert?.provincia
                        ? ", "
                        : ""}
                      {nextConcert?.provincia ? nextConcert.provincia : ""}
                    </div>
                  ) : null}

                  {nextConcert?.fecha_formateada ||
                  nextConcert?.fechaFormateada ? (
                    <div className="homeConcertDate">
                      {nextConcert?.fecha_formateada ??
                        nextConcert?.fechaFormateada}
                    </div>
                  ) : null}

                  {nextConcert?.descripcion ? (
                    <p className="homeConcertDesc m-0">
                      {nextConcert.descripcion}
                    </p>
                  ) : null}

                  <div className="d-flex align-items-center justify-content-between gap-3 homeConcertBottom">
                    {nextConcert?.precioEntrada !== null &&
                    nextConcert?.precioEntrada !== undefined ? (
                      <span className="homeConcertPrice">
                        Entrada
                        {Number(nextConcert.precioEntrada) === 0
                          ? " gratis"
                          : `: ${nextConcert.precioEntrada} €`}
                      </span>
                    ) : (
                      <span />
                    )}

                    {nextConcert?.entradaAnticipada &&
                    nextConcert?.enlaceEntradaAnticipada ? (
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
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={posterAlt}
              tabIndex={-1}
              onClick={(event) => event.stopPropagation()}
              className="homeLightboxInner d-flex align-items-center justify-content-center"
            >
              <img
                className="homeLightboxImg"
                src={posterLightboxUrl}
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
