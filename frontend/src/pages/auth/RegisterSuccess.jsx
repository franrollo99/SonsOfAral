import { Link, useLocation, Navigate } from "react-router-dom";
import "./Auth.css";

function RegisterSuccess() {
  const { state } = useLocation();

  if (!state?.fromRegister) {
    return <Navigate to="/register" replace />;
  }

  return (
    <section>
      <div className="container userSessionContainer">
        <h1 className="userSessionTitle">Cuenta creada</h1>

        <div className="userSessionForm">
          <p className="userSessionOk">Tu cuenta se ha creado correctamente. Revisa tu correo para verificarlaantes de iniciar sesión.</p>
          <Link className="userSessionBtn backToLoginBtn" to="/login">Volver al inicio de sesión</Link>
        </div>
      </div>
    </section>
  );
}

export default RegisterSuccess;