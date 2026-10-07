import FieldError from "../../components/FieldError";
import { useFormErrors } from "../../hooks/useFormErrors";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "../../lib/api";
import "./AdminManagement.css";

function ChangePassword() {
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const { formRef, fieldErrors, setFieldErrors, fieldProps } =
    useFormErrors(error);
  const [success, setSuccess] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess("");
    if (form.password !== form.password_confirmation) {
      setFieldErrors({
        password_confirmation: ["Las contraseñas nuevas no coinciden."],
      });
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setPending(true);
    try {
      await apiJson("/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setSuccess("Contraseña actualizada correctamente.");
    } catch (failure) {
      setFieldErrors(failure.data?.errors || {});
      setError(
        failure.data?.errors
          ? Object.values(failure.data.errors).flat().join(" ")
          : failure.message,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="adminPageWrap">
      <div className="adminPageCard">
        <h1 className="adminPageTitle">Cambiar contraseña</h1>
        <div className="adminDivider" />
        <p className="adminMuted">
          Usa al menos 8 caracteres, con mayúsculas, minúsculas, números y
          símbolos.
        </p>
        <form ref={formRef} onSubmit={submit} className="adminFormGrid">
          {[
            ["current_password", "Contraseña actual", "current-password"],
            ["password", "Nueva contraseña", "new-password"],
            [
              "password_confirmation",
              "Repetir nueva contraseña",
              "new-password",
            ],
          ].map(([name, label, autocomplete]) => (
            <div className="adminFormField adminFormFieldFull" key={name}>
              <label className="adminControlLabel" htmlFor={name}>
                {label}
              </label>
              <input
                {...fieldProps(name)}
                id={name}
                type="password"
                autoComplete={autocomplete}
                className="adminInput"
                required
                disabled={pending}
                value={form[name]}
                onChange={(event) =>
                  setForm({ ...form, [name]: event.target.value })
                }
              />
              <FieldError id={`${name}-error`} error={fieldErrors[name]} />
            </div>
          ))}
          {error && (
            <p
              className="adminError adminFormFieldFull"
              role="alert"
              tabIndex={-1}
            >
              {error}
            </p>
          )}
          {success && (
            <p className="adminOk adminFormFieldFull" role="status">
              {success}
            </p>
          )}
          <div className="adminFormFieldFull d-flex gap-3">
            <button className="adminBtn" disabled={pending} type="submit">
              {pending ? "Guardando…" : "Guardar contraseña"}
            </button>
            <Link className="adminLinkBtn" to="/gestion">
              Volver al panel
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ChangePassword;
