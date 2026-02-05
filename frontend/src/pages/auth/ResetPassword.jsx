const API_URL = import.meta.env.VITE_API_URL;
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./Auth.css";

function ResetPassword() {
  const navigate = useNavigate();
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

  // Si entra con email en URL, lo ponemos en el input
  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const getFirstValidationError = (data) => {
    if (!data?.errors) return null;
    return Object.values(data.errors).flat()[0] || null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setOk("");
    setError("");

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
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 422) {
            throw new Error(getFirstValidationError(data) || "Datos inválidos.");
          }
          throw new Error(data?.message || "No se pudo enviar el enlace.");
        }

        setOk("Si el email existe, te hemos enviado un enlace para restablecer la contraseña.");
        return;
      }

      // 2) Cambiar contraseña con token
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: password2,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 422) {
          throw new Error(getFirstValidationError(data) || data?.message || "Datos inválidos.");
        }
        throw new Error(data?.message || "No se pudo cambiar la contraseña.");
      }

      setOk("Contraseña restablecida. Ya puedes iniciar sesión.");
      setPassword("");
      setPassword2("");

      setTimeout(() => navigate("/login", { replace: true }), 1200);

    } catch (err) {
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
              readOnly={!!emailFromUrl} // si viene del enlace, mejor no dejar cambiarlo
            />
            <label className="flLabel" htmlFor="email">Email</label>
          </div>

          {isResetMode && (
            <>
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
                <label className="flLabel" htmlFor="password">Nueva contraseña</label>
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
            </>
          )}

          {ok && <p className="userSessionOk">{ok}</p>}
          {error && <p className="userSessionError">{error}</p>}

          <button className="userSessionBtn" type="submit" disabled={loading}>
            {loading
              ? "Procesando..."
              : isResetMode
              ? "Cambiar contraseña"
              : "Enviar"}
          </button>

          <Link className="userSessionLink userSessionLinkCenter" to="/login">
            Cancelar
          </Link>
        </form>
      </div>
    </section>
  );
}

export default ResetPassword;
