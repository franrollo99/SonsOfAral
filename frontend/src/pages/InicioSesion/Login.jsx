
// src/pages/Conciertos.jsx
import { useEffect, useState } from "react";
import "./Login.css";

function Login() {

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
        console.log(data);
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
    <div className="home-page">
      <section id="conciertos" className="section">
        <div className="imageContainer">
          <div className="imgWrapper">
            <img src="/images/portadaConciertos.png" alt="Portada conciertos"/>
            <h1>SONS OF ARAL</h1>
          </div>
        </div>

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
              <article key={concierto.id} className="card">
                <div className="tituloFechaConcierto">
                    <h1>{concierto.ubicacion}</h1>
                    <h2>{concierto.fecha}</h2>
                </div>
                  <p>{concierto.descripcion}</p>
                  <p className="card__note">Entrada: {concierto.precioEntrada} €</p>
                  {concierto.entradaAnticipada && <a className="btn">Hola!</a>}

              </article>
            ))}
        </div>
      </section>
    </div>
  );
}

export default Login;
