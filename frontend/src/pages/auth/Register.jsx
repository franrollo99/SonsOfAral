const API_URL = import.meta.env.VITE_API_URL;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (password !== password2) {
      setError("La contraseña no coincide.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombre: firstName,
          apellidos: lastName,
          email,
          password,
          password_confirmation: password2,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 422 && data?.errors) {
          const first = Object.values(data.errors).flat()[0];
          throw new Error(first || "Datos inválidos.");
        }
        throw new Error(data?.message || "No se pudo registrar.");
      }

      setOk("Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.");

    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="container userSessionContainer">
        <h1 className="userSessionTitle">Registro</h1>

        <form className="userSessionForm" onSubmit={onSubmit} noValidate>
          <div className={`flField ${firstName ? "hasValue" : ""}`}>
            <input
              className="flInput"
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
            <label className="flLabel" htmlFor="firstName">Nombre</label>
          </div>

          <div className={`flField ${lastName ? "hasValue" : ""}`}>
            <input
              className="flInput"
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
            <label className="flLabel" htmlFor="lastName">Apellidos</label>
          </div>

          <div className={`flField ${email ? "hasValue" : ""}`}>
            <input
              className="flInput"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <label className="flLabel" htmlFor="email">Email</label>
          </div>

          <div className={`flField ${password ? "hasValue" : ""}`}>
            <input
              className="flInput"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <label className="flLabel" htmlFor="password">Contraseña</label>
          </div>

          <div className={`flField ${password2 ? "hasValue" : ""}`}>
            <input
              className="flInput"
              id="password2"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
              required
            />
            <label className="flLabel" htmlFor="password2">Confirmar contraseña</label>
          </div>

          {ok && <p className="userSessionOk">{ok}</p>}
          {error && <p className="userSessionError">{error}</p>}

          <button className="userSessionBtn" type="submit" disabled={loading}>
            {loading ? "Creando..." : "Registrarte"}
          </button>

          <Link className="userSessionLink userSessionLinkCenter" to="/login">
            Cancelar
          </Link>
        </form>
      </div>
    </section>
  );
}

export default Register;
