
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
      
    </div>
  );
}

export default Login;
