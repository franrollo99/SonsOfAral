// src/pages/Conciertos.jsx
import { useEffect, useState } from "react";
import "./Conciertos.css";

function Conciertos() {
  const [conciertos, setConciertos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarConciertos() {
      try {
        setCargando(true);
        setError(null);

        const baseUrl =
          import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
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
    <section id="conciertos" className="section">
      {/* <div className="imageContainer">
        <div className="imgWrapper">
          <img src="/images/portadaConciertos.png" alt="Portada conciertos" />
          <h1>SONS OF ARAL</h1>
        </div>
      </div> */}

      {/* Bloque de conciertos */}
      <div className="cardsConcerts">
        {cargando && <p>Cargando conciertos...</p>}

        {error && !cargando && (
          <p className="cardsConcerts__error">{error}</p>
        )}

        {!cargando && !error && conciertos.length === 0 && (
          <p>No hay conciertos disponibles por ahora.</p>
        )}

        {!cargando &&
          !error &&
          conciertos.length > 0 &&
          conciertos.map((concierto) => (
            <article key={concierto.id} className="card card--concierto">
              <div className="tituloFechaConcierto">
                <h2 className="concierto__sala">{concierto.ubicacion}</h2>
                <span className="concierto__fecha">
                  {concierto.fecha_formateada}
                </span>
              </div>

              {concierto.descripcion && (
                <p className="concierto__descripcion">
                  {concierto.descripcion}
                </p>
              )}

              <div className="concierto__meta">
                {concierto.precioEntrada && (
                  <span className="concierto__precio">
                    Entrada: {concierto.precioEntrada} €
                  </span>
                )}

                {concierto.entradaAnticipada &&
                  concierto.enlaceEntradaAnticipada && (
                    <a
                      href={concierto.enlaceEntradaAnticipada}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn concierto__cta"
                    >
                      Entradas
                    </a>
                  )}
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}

export default Conciertos;
