import { useContent } from "../../hooks/useContent";
import { useMemo, useState } from "react";
import { formatConcertDate } from "../../lib/home-content.mjs";
import ImageViewer from "../../components/ImageViewer";
import "./Concerts.css";

function normalizeUpcoming(raw) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return raw
    .filter((c) => {
      const rawDate = c?.fecha;
      if (!rawDate) return false;

      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return false;

      d.setHours(0, 0, 0, 0);
      return d >= today;
    })
    .sort((a, b) => {
      const da = new Date(a?.fecha).getTime();
      const db = new Date(b?.fecha).getTime();
      return da - db;
    });
}

function Conciertos() {
  const { data, loading: cargando, error } = useContent("/conciertos");
  const [posterImage, setPosterImage] = useState(null);
  const conciertosRaw = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  const conciertos = useMemo(
    () => normalizeUpcoming(conciertosRaw),
    [conciertosRaw],
  );

  return (
    <section className="concertPage">
      <h1 className="visually-hidden">Próximos conciertos</h1>
      {cargando && <p role="status">Cargando conciertos...</p>}
      {error && !cargando && (
        <p className="errorMessage" role="alert">
          {error}
        </p>
      )}
      {!cargando && !error && conciertos.length === 0 && (
        <p>No hay conciertos disponibles por ahora.</p>
      )}

      {!cargando && !error && conciertos.length > 0 && (
        <div className="concertList">
          {conciertos.map((concierto) => (
            <article key={concierto.id} className="concierto">
              <div className="concertTop">
                <time className="concertDate" dateTime={concierto.fecha}>
                  {concierto.fecha_formateada ||
                    concierto.fechaFormateada ||
                    formatConcertDate(concierto.fecha)}
                </time>
                <div className="concertVenue">
                  <h2>{concierto.lugar}</h2>
                  {(concierto.municipio || concierto.provincia) && (
                    <p className="concertLocation">
                      {concierto.municipio && (
                        <span className="concertMunicipality">
                          {concierto.municipio}
                        </span>
                      )}
                      {concierto.provincia && (
                        <span className="concertProvince">
                          {concierto.municipio ? ", " : ""}
                          {concierto.provincia}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="concertBottom">
                <div>
                  {concierto.descripcion && (
                    <p className="descripcion m-0">{concierto.descripcion}</p>
                  )}
                </div>

                <div className="entrada">
                  {concierto.precioEntrada !== null &&
                    concierto.precioEntrada !== undefined && (
                      <h4 className="m-0">
                        Entrada
                        {Number(concierto.precioEntrada) === 0
                          ? " gratis"
                          : `: ${concierto.precioEntrada} €`}
                      </h4>
                    )}

                  {concierto.cartel?.url && (
                    <button
                      type="button"
                      className="btn btn-outline-light concertPosterBtn"
                      aria-label={`Ver cartel de ${concierto.lugar}`}
                      aria-haspopup="dialog"
                      onClick={() =>
                        setPosterImage({
                          url: concierto.cartel.url,
                          alt: `Cartel de ${concierto.lugar}`,
                        })
                      }
                    >
                      Ver cartel ↗
                    </button>
                  )}

                  {concierto.entradaAnticipada &&
                    concierto.enlaceEntradaAnticipada && (
                      <a
                        href={concierto.enlaceEntradaAnticipada}
                        className="btn btn-primary entradaBtn"
                      >
                        Entrada anticipada
                      </a>
                    )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {posterImage && (
        <ImageViewer image={posterImage} onClose={() => setPosterImage(null)} />
      )}
    </section>
  );
}

export default Conciertos;
