// src/pages/Musica.jsx
import { useEffect, useState } from "react";
import "./Musica.css";

function Musica() {
  const [albums, setAlbums] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarAlbums() {
      try {
        setCargando(true);
        setError(null);

        const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
        const respuesta = await fetch(`${baseUrl}/albums`);


        if (!respuesta.ok) {
          throw new Error("Error al cargar albums");
        }

        const data = await respuesta.json();
        console.log(data);
        const lista = Array.isArray(data) ? data : data.data;

        setAlbums(lista || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los albums.");
      } finally {
        setCargando(false);
      }
    }

    cargarAlbums();
  }, []);

  return (
      <section id="musica" className="section">
        
        {/* Bloque de albums */}
        <div className="cardsConcerts">
          {cargando && <p>Cargando albums...</p>}

          {error && !cargando && (
            <p className="cardsConcerts__error">{error}</p>
          )}

          {!cargando && !error && albums.length === 0 && (
            <p>No hay albums disponibles por ahora.</p>
          )}

          <div className="release-list">
          {!cargando &&
            !error &&
            albums.length > 0 &&
            albums.map((album) => (
              <div className="release-card">

              </div>
            ))}
          </div>

        </div>
      </section>
  );
}

export default Musica;
