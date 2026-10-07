import FieldError from "../../components/FieldError";
import { useFormErrors } from "../../hooks/useFormErrors";
import { apiJson } from "../../lib/api";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Auth.css";

function ResetPassword() {
  const [params] = useSearchParams();

  // Si vienes del email: /reset-password?token=...&email=...
  const token = params.get("token") || "";
  const emailFromUrl = params.get("email") || "";

  const isResetMode = useMemo(() => !!token, [token]);

  // Paso 1: pedir enlace
  const [email, setEmail] = useState(emailFromUrl);

  // Paso 2: cambiar contraseña
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");
  const { formRef, fieldErrors, setFieldErrors, fieldProps } =
    useFormErrors(error);

  // Si entra con email en URL, lo ponemos en el input
  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setOk("");
    setError("");
    setFieldErrors({});

    // Validación simple front
    if (isResetMode) {
      if (!email) {
        setError("Falta el email.");
        return;
      }
      if (!token) {
        setError("Falta el token de recuperación.");
        return;
      }
      if (password !== password2) {
        setFieldErrors({
          password_confirmation: ["La contraseña no coincide."],
        });
        setError("La contraseña no coincide.");
        return;
      }
    } else {
      if (!email) {
        setError("Introduce tu email.");
        return;
      }
    }

    setLoading(true);

    try {
      if (!isResetMode) {
        // 1) Enviar enlace de recuperación
        await apiJson("/auth/forgot-password", {
          auth: false,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        setOk("Te hemos enviado un enlace para restablecer la contraseña.");
        return;
      }

      // 2) Cambiar contraseña con token
      await apiJson("/auth/reset-password", {
        auth: false,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: password2,
        }),
      });

      setOk("Contraseña restablecida. Ya puedes iniciar sesión.");
      setPassword("");
      setPassword2("");
    } catch (err) {
      setFieldErrors(err.data?.errors || {});
      setError(err?.message || "Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="container userSessionContainer">
        <h1 className="userSessionTitle">
          {isResetMode ? "Nueva contraseña" : "Restablecer la contraseña"}
        </h1>

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
              readOnly={!!emailFromUrl} // si viene del enlace, mejor no dejar cambiarlo
            />
            <label className="flLabel" htmlFor="email">
              Email
            </label>
            <FieldError id="email-error" error={fieldErrors.email} />
          </div>

          {isResetMode && (
            <>
              <div className={`flField ${password ? "hasValue" : ""}`}>
                <input
                  className="flInput"
                  id="password"
                  {...fieldProps("password")}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <label className="flLabel" htmlFor="password">
                  Nueva contraseña
                </label>
                <FieldError id="password-error" error={fieldErrors.password} />
              </div>

              <div className={`flField ${password2 ? "hasValue" : ""}`}>
                <input
                  className="flInput"
                  id="password2"
                  {...fieldProps("password_confirmation")}
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <label className="flLabel" htmlFor="password2">
                  Confirmar contraseña
                </label>
                <FieldError
                  id="password_confirmation-error"
                  error={fieldErrors.password_confirmation}
                />
              </div>
            </>
          )}

          {ok && (
            <p className="userSessionOk" role="status">
              {ok}
            </p>
          )}
          {error && (
            <p className="userSessionError" role="alert" tabIndex={-1}>
              {error}
            </p>
          )}

          <button className="userSessionBtn" type="submit" disabled={loading}>
            {loading
              ? "Procesando..."
              : isResetMode
                ? "Cambiar contraseña"
                : "Enviar"}
          </button>

          <Link
            className="userSessionLink userSessionLinkCenter"
            to="/gestion/acceso"
          >
            {ok ? "Volver al acceso" : "Cancelar"}
          </Link>
        </form>
      </div>
    </section>
  );
}

export default ResetPassword;
