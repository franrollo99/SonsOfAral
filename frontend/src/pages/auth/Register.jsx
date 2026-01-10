import { useState } from "react";
import "./Auth.css";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();

    console.log({ firstName, lastName, email, password });
  };

  return (
    <section>
      <div className="container userSessionContainer">
        <h1 className="userSessionTitle">Registro</h1>

        <form className="userSessionForm" onSubmit={onSubmit} noValidate>
          <div className={`flField ${firstName ? "hasValue" : ""}`}>
            <input className="flInput" id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="firstName" required/>
            <label className="flLabel" htmlFor="firstName">Nombre</label>
          </div>
          <div className={`flField ${lastName ? "hasValue" : ""}`}>
            <input className="flInput" id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="lastName" required/>
            <label className="flLabel" htmlFor="lastName">Apellidos</label>
          </div>

          <div className={`flField ${email ? "hasValue" : ""}`}>
            <input className="flInput" id="email" type="email"value={email}onChange={(e) => setEmail(e.target.value)} autoComplete="email" required/>
            <label className="flLabel" htmlFor="email">Email</label>
          </div>
          <div className={`flField ${password ? "hasValue" : ""}`}>
            <input className="flInput" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="password" required/>
            <label className="flLabel" htmlFor="password">Contraseña</label>
          </div>

          <button className="userSessionBtn" type="submit">Registrarte</button>

          <a className="userSessionLink userSessionLinkCenter" href="/login">Cancelar</a>
        </form>
      </div>
    </section>
  );
}

export default Register;