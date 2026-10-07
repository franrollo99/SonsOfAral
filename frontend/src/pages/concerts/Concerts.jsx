import { useContent } from "../../hooks/useContent";
import { useMemo } from "react";
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
  const conciertosRaw = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  const conciertos = useMemo(
    () => normalizeUpcoming(conciertosRaw),
    [conciertosRaw],
  );

  return (
    <section>
      <header className="listingHeader">
        <p className="eyebrow">Agenda / próxima señal</p>
        <h1>Directo</h1>
        <p>Próximas fechas, ruido y puntos de encuentro.</p>
      </header>
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
          {conciertos.map((concierto, index) => (
            <article key={concierto.id} className="concierto">
              <span className="concertIndex">0{index + 1}</span>
              <div className="concertTop">
                <div>
                  <h1 className="m-0">
                    {concierto.lugar}{" "}
                    <span>
                      {concierto.municipio}, {concierto.provincia}
                    </span>
                  </h1>
                </div>
                <div className="concertDate">
                  <h2 className="m-0">{concierto.fecha_formateada}</h2>
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

                  {concierto.entradaAnticipada &&
                    concierto.enlaceEntradaAnticipada && (
                      <a
                        href={concierto.enlaceEntradaAnticipada}
                        className="btn btn-secondary entradaBtn"
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
    </section>
  );
}

export default Conciertos;
