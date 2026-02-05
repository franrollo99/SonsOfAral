const API_URL = import.meta.env.VITE_API_URL;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        const msg =
          loginData?.errors
            ? Object.values(loginData.errors).flat()[0]
            : loginData?.message || "Credenciales incorrectas";

        throw new Error(msg);
      }


      setUser(loginData.user);

      const meRes = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${loginData.token}`,
        },
      });

      const meData = await meRes.json();

      if (!meRes.ok) {
        throw new Error(meData.message || "Sesión no válida");
      }

      console.log("Usuario autenticado:", meData.user);
      const rol = meData.user.rol;

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("rol", rol);

      if (rol === "admin") {
        navigate("/area-admin", { replace: true });
      } else {
        navigate("/area-cliente", { replace: true });
      }


    } catch (err) {
      setUser(null);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };


  return (
    <section>
      <div className="container userSessionContainer">
        <h1 className="userSessionTitle">Inicio de Sesión</h1>

        <form className="userSessionForm" onSubmit={onSubmit} noValidate>
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
              autoComplete="current-password"
              required
            />
            <label className="flLabel" htmlFor="password">Contraseña</label>
          </div>

          <Link className="userSessionLink" to="/reset-password">
            ¿Has olvidado la contraseña?
          </Link>

          {error && <p className="userSessionError">{error}</p>}

          {user && (
            <p className="userSessionOk">
              Sesión iniciada como <strong>{user.email}</strong>
            </p>
          )}

          <button className="userSessionBtn" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
          <Link className="userSessionLink userSessionLinkCenter" to="/register">
            Crear cuenta
          </Link>
        </form>
      </div>
    </section>
  );
}

export default Login;
