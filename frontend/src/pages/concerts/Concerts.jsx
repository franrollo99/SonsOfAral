import { useEffect, useState } from "react";
import "./Concerts.css";

const API_URL = import.meta.env.VITE_API_URL;

function Conciertos() {
  const [conciertos, setConciertos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarConciertos() {
      try {
        setCargando(true);
        setError(null);

        const respuesta = await fetch(`${API_URL}/conciertos`);

        if (!respuesta.ok) {
          throw new Error("Error al cargar conciertos");
        }

        const data = await respuesta.json();

        const raw = Array.isArray(data?.data) ? data.data : [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = raw
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

        setConciertos(upcoming);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los conciertos.");
      } finally {
        setCargando(false);
      }
    }

    cargarConciertos();
  }, []);

  return (
    <section>
      {cargando && <p>Cargando conciertos...</p>}
      {error && !cargando && <p className="errorMessage">{error}</p>}
      {!cargando && !error && conciertos.length === 0 && (
        <p>No hay conciertos disponibles por ahora.</p>
      )}

      {!cargando && !error && conciertos.length > 0 && (
        <div className="d-flex flex-column gap-4 py-3">
          {conciertos.map((concierto) => (
            <article key={concierto.id} className="concierto card gap-3">
              <div className="row g-3 align-items-baseline">
                <div className="col-12 col-md-8">
                  <h1 className="m-0">
                    {concierto.lugar}{" "}
                    <span>
                      {concierto.municipio}, {concierto.provincia}
                    </span>
                  </h1>
                </div>
                <div className="col-12 col-md-4 text-md-end">
                  <h2 className="m-0">{concierto.fecha_formateada}</h2>
                </div>
              </div>

              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-7">
                  {concierto.descripcion && (
                    <p className="descripcion m-0">{concierto.descripcion}</p>
                  )}
                </div>

                <div className="col-12 col-md-5">
                  <div className="entrada d-flex flex-wrap align-items-center justify-content-md-end gap-3">
                    {concierto.precioEntrada && (
                      <h4 className="m-0">
                        Entrada
                        {concierto.precioEntrada == 0
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
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Conciertos;