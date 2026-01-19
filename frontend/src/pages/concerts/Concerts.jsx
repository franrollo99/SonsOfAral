import { useEffect, useState } from "react";
import "./Concerts.css";

function Conciertos() {
  const [conciertos, setConciertos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarConciertos() {
      try {
        setCargando(true);
        setError(null);

        const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
        const respuesta = await fetch(`${baseUrl}/conciertos`);

        if (!respuesta.ok) {
          throw new Error("Error al cargar conciertos");
        }

        const data = await respuesta.json();
        const lista = Array.isArray(data) ? data : data.data;

        setConciertos(lista || []);
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
    <section className="container">
      {cargando && <p>Cargando conciertos...</p>}
      {error && !cargando && <p className="errorMessage">{error}</p>}
      {!cargando && !error && conciertos.length === 0 && (<p>No hay conciertos disponibles por ahora.</p>)}

      {!cargando && !error && conciertos.length > 0 && (
        <div className="d-flex flex-column gap-4 py-3">
          {conciertos.map((concierto) => (
            <article key={concierto.id} className="concierto card gap-3">
              <div className="d-flex align-items-baseline justify-content-between gap-5">
                <div>
                  <h1>{concierto.lugar} <span>{concierto.municipio}, {concierto.provincia}</span></h1>
                </div>
                <h2>{concierto.fecha_formateada}</h2>
              </div>
              <div className="d-flex justify-content-between align-items-end">

                {concierto.descripcion && (
                  <p className="descripcion w-50">{concierto.descripcion}</p>
                )}
                <div className="entrada d-flex align-items-center gap-3">
                  {concierto.precioEntrada && (
                    <h4 className="m-0">Entrada{concierto.precioEntrada == 0 ? ' gratis' : `: ${concierto.precioEntrada} €`}</h4>
                  )}
                  {concierto.entradaAnticipada &&
                    concierto.enlaceEntradaAnticipada && (
                      <a href={concierto.enlaceEntradaAnticipada} className="btn btn-secondary">Entrada anticipada</a>
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
