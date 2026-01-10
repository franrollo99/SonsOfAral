import { useState } from "react";
import "./Auth.css";

function ResetPassword() {
  const [email, setEmail] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();

    console.log({ password });
  };

  return (
    <section>
      <div className="container userSessionContainer">
        <h1 className="userSessionTitle">Restablecer la contraseña</h1>

        <form className="userSessionForm" onSubmit={onSubmit} noValidate>
          <div className={`flField ${email ? "hasValue" : ""}`}>
            <input className="flInput" id="email" type="email"value={email}onChange={(e) => setEmail(e.target.value)} autoComplete="email" required/>
            <label className="flLabel" htmlFor="email">Email</label>
          </div>

          <button className="userSessionBtn" type="submit">Enviar</button>
          <a className="userSessionLink userSessionLinkCenter" href="/login">Cancelar</a>
        </form>
      </div>
    </section>
  );
}

export default ResetPassword;