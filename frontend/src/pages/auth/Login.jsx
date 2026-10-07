import FieldError from "../../components/FieldError";
import { useFormErrors } from "../../hooks/useFormErrors";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { useAuth } from "../../auth/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { formRef, fieldErrors, setFieldErrors, fieldProps } =
    useFormErrors(error);

  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await login(email, password);
      navigate("/gestion", { replace: true });
    } catch (err) {
      setFieldErrors(err.data?.errors || {});
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="container userSessionContainer">
        <h1 className="userSessionTitle">Inicio de Sesión</h1>

        <form ref={formRef} className="userSessionForm" onSubmit={onSubmit}>
          <div className={`flField ${email ? "hasValue" : ""}`}>
            <input
              className="flInput"
              id="email"
              {...fieldProps("email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <label className="flLabel" htmlFor="email">
              Email
            </label>
            <FieldError id="email-error" error={fieldErrors.email} />
          </div>

          <div className={`flField ${password ? "hasValue" : ""}`}>
            <input
              className="flInput"
              id="password"
              {...fieldProps("password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <label className="flLabel" htmlFor="password">
              Contraseña
            </label>
            <FieldError id="password-error" error={fieldErrors.password} />
          </div>

          <Link className="userSessionLink" to="/gestion/recuperar">
            ¿Has olvidado la contraseña?
          </Link>

          {error && (
            <p
              className="userSessionError errorMessage"
              role="alert"
              tabIndex={-1}
            >
              {error}
            </p>
          )}

          <button className="userSessionBtn" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;
