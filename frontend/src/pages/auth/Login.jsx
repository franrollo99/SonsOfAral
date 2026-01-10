import { useState } from "react";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();

    console.log({ email, password });
  };

  return (
    <section>
      <div className="container userSessionContainer">
        <h1 className="userSessionTitle">Inicio de Sesión</h1>

        <form className="userSessionForm" onSubmit={onSubmit} noValidate>
          <div className={`flField ${email ? "hasValue" : ""}`}>
            <input className="flInput" id="email" type="email"value={email}onChange={(e) => setEmail(e.target.value)} autoComplete="email" required/>
            <label className="flLabel" htmlFor="email">Email</label>
          </div>
          <div className={`flField ${password ? "hasValue" : ""}`}>
            <input className="flInput" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required/>
            <label className="flLabel" htmlFor="password">Contraseña</label>
          </div>

          <a className="userSessionLink" href="/reset-password">¿Olvidaste tu contraseña?</a>

          <button className="userSessionBtn" type="submit">Iniciar Sesión</button>

          <a className="userSessionLink userSessionLinkCenter" href="/register">Crear cuenta</a>
        </form>
      </div>
    </section>
  );
}

export default Login;