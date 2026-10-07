import { useEffect, useId, useRef } from "react";
import { useModal } from "../../../hooks/useModal";
import "../AdminManagement.css";

function normalizeArrayValue(v) {
  if (Array.isArray(v)) return v.map(String);
  if (v == null) return [];

  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];

    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        // Se conserva como texto normal si no es JSON válido.
      }
    }

    if (s.includes(",")) {
      return s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }

    return [s];
  }

  return [String(v)];
}

function Field({ field, form, setForm, fieldErrors }) {
  const id = useId();
  const error = [fieldErrors[field.errorName || field.name]]
    .flat()
    .filter(Boolean)
    .join(" ");
  const accessibility = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby":
      [field.help ? `${id}-help` : null, error ? `${id}-error` : null]
        .filter(Boolean)
        .join(" ") || undefined,
  };
  const fileInputRef = useRef(null);
  const {
    name,
    label,
    type = "text",
    placeholder,
    options = [],
    full = false,
    step,
    min,
    max,
    rows,
    disabled,
    help,
    sizes = ["XS", "S", "M", "L", "XL", "XXL"],
  } = field;

  const showWhen = field.showWhen;
  if (typeof showWhen === "function" && !showWhen(form)) {
    return null;
  }

  const isDisabled =
    typeof disabled === "function" ? disabled(form) : !!disabled;

  const onChange = (value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const currentSizes =
    type === "sizes" ? normalizeArrayValue(form?.[name]) : null;

  const commonProps = {
    ...accessibility,
    className: type === "textarea" ? "adminTextarea" : "adminInput",
    value: form?.[name] ?? "",
    placeholder: placeholder || "",
    disabled: isDisabled,
  };

  if (type === "file") {
    const currentUrl = field.currentUrlKey ? form?.[field.currentUrlKey] : null;
    const currentName = field.currentNameKey
      ? form?.[field.currentNameKey]
      : null;
    const removeFlag = field.removeFlagKey
      ? !!form?.[field.removeFlagKey]
      : false;
    const selectedFile = form?.[name] instanceof File ? form[name] : null;

    const existingUrl = removeFlag ? null : currentUrl;
    const existingName = removeFlag ? null : currentName;
    const previewUrl = selectedFile
      ? URL.createObjectURL(selectedFile)
      : existingUrl;
    const shownName = selectedFile ? selectedFile.name : existingName;

    const clearSelectedNewFile = () => {
      setForm((p) => ({
        ...p,
        [name]: null,
      }));
    };

    const removeCurrentlyShownFile = () => {
      if (selectedFile) {
        setForm((p) => ({
          ...p,
          [name]: null,
        }));
        return;
      }

      if (field.removeFlagKey && currentUrl) {
        setForm((p) => ({
          ...p,
          [name]: null,
          [field.removeFlagKey]: true,
        }));
      }
    };

    return (
      <div className={`adminFormField ${full ? "adminFormFieldFull" : ""}`}>
        <label className="adminControlLabel" htmlFor={id}>
          {label}
        </label>

        <input
          ref={fileInputRef}
          aria-label={label}
          type="file"
          accept={field.accept || "image/png,image/jpeg,image/webp"}
          disabled={isDisabled}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;

            setForm((p) => ({
              ...p,
              [name]: file,
              ...(field.removeFlagKey ? { [field.removeFlagKey]: false } : {}),
            }));

            e.target.value = "";
          }}
        />

        <button
          type="button"
          {...accessibility}
          className="adminActionBtn text-start px-3"
          disabled={isDisabled}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? "Cambiar imagen" : "Seleccionar imagen"}
        </button>

        {shownName ? (
          <p className="adminMuted" style={{ display: "block", marginTop: 8 }}>
            Archivo mostrado: {shownName}
          </p>
        ) : null}

        {previewUrl ? (
          <div style={{ marginTop: 10 }}>
            <img
              src={previewUrl}
              alt=""
              style={{
                display: "block",
                width: "100%",
                maxWidth: 260,
                borderRadius: 10,
                objectFit: "cover",
              }}
            />

            <div className="d-flex gap-2 mt-2">
              {!selectedFile && currentUrl ? (
                <button
                  type="button"
                  className="adminActionBtn adminActionBtn--danger"
                  onClick={removeCurrentlyShownFile}
                  disabled={isDisabled}
                >
                  Eliminar imagen
                </button>
              ) : null}

              {selectedFile && currentUrl ? (
                <button
                  type="button"
                  className="adminActionBtn"
                  onClick={clearSelectedNewFile}
                  disabled={isDisabled}
                >
                  Descartar imagen nueva
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {error && (
          <p id={`${id}-error`} className="adminError">
            {error}
          </p>
        )}
        {help ? (
          <p id={`${id}-help`} className="adminMuted">
            {typeof help === "function" ? help(form) : help}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`adminFormField ${full ? "adminFormFieldFull" : ""}`}>
      <label className="adminControlLabel" htmlFor={id}>
        {label}
      </label>

      {type === "textarea" ? (
        <textarea
          {...commonProps}
          rows={rows || 4}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : type === "select" ? (
        <select
          {...accessibility}
          className="adminSelect"
          value={form?.[name] ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
        >
          {options.map((opt) => {
            const isObj = typeof opt === "object" && opt !== null;
            const optValue = isObj ? opt.value : opt;
            const text = isObj ? opt.label : String(opt);
            const optDisabled = isObj ? !!opt.disabled : false;
            const optHidden = isObj ? !!opt.hidden : false;

            const currentValue = form?.[name] ?? "";
            const isPlaceholder = String(optValue) === "";
            const shouldHide =
              optHidden || (isPlaceholder && String(currentValue) !== "");

            return (
              <option
                key={String(optValue)}
                value={optValue}
                disabled={optDisabled}
                hidden={shouldHide}
                style={shouldHide ? { display: "none" } : undefined}
              >
                {text}
              </option>
            );
          })}
        </select>
      ) : type === "checkbox" ? (
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            {...accessibility}
            type="checkbox"
            checked={!!form?.[name]}
            onChange={(e) => onChange(e.target.checked ? 1 : 0)}
            disabled={isDisabled}
          />
          <span className="adminMuted">Activado</span>
        </label>
      ) : type === "sizes" ? (
        <div className="adminSizes">
          <div className="adminSizesGrid">
            {sizes.map((s) => {
              const isOn = currentSizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  className={`adminSizeBtn ${isOn ? "isOn" : ""}`}
                  disabled={isDisabled}
                  onClick={() => {
                    const next = isOn
                      ? currentSizes.filter((x) => x !== s)
                      : [...currentSizes, s];

                    onChange(next);
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <input
          {...commonProps}
          type={type}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && (
        <p id={`${id}-error`} className="adminError">
          {error}
        </p>
      )}
      {typeof help === "function" ? (
        <p id={`${id}-help`} className="adminMuted">
          {help(form)}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className="adminMuted">
          {help}
        </p>
      ) : null}
    </div>
  );
}

function AdminEntityModal({
  open,
  title,
  formFields = [],
  form,
  setForm,
  error,
  fieldErrors = {},
  ok,
  loading,
  onClose,
  onSave,
  showSave = true,
  saveText = "Guardar",
  afterFields,
}) {
  const titleId = useId();
  const dialogRef = useModal(open, onClose, !loading);
  useEffect(() => {
    if (open && error) {
      const dialog = dialogRef.current;
      (
        dialog?.querySelector('[aria-invalid="true"]:not(:disabled)') ||
        dialog?.querySelector('[role="alert"]')
      )?.focus();
    }
  }, [open, error, fieldErrors, dialogRef]);

  if (!open) return null;

  return (
    <div
      className="adminModalOverlay"
      onMouseDown={() => {
        if (!loading) onClose();
      }}
    >
      <form
        className="adminModal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        aria-busy={loading}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (!loading && showSave) onSave();
        }}
      >
        <div className="adminModalHeader">
          <h3 id={titleId} className="adminModalTitle">
            {title}
          </h3>
          <button
            className="adminModalClose"
            aria-label="Cerrar editor"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="adminModalBody">
          {error && (
            <p
              className="adminError"
              role="alert"
              tabIndex={-1}
              style={{ marginTop: 0 }}
            >
              {error}
            </p>
          )}
          {ok && (
            <p className="adminOk" role="status" style={{ marginTop: 0 }}>
              {ok}
            </p>
          )}

          <div className="adminFormGrid">
            {formFields.map((f) => (
              <Field
                key={f.name}
                field={f}
                form={form}
                setForm={setForm}
                fieldErrors={fieldErrors}
              />
            ))}
          </div>

          {afterFields ? (
            <div className="adminAfterFields">{afterFields}</div>
          ) : null}
        </div>

        <div className="adminModalFooter">
          <div className="adminModalFooterInner">
            <button
              className="adminBtn"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Volver
            </button>

            {showSave && (
              <button className="adminBtn" type="submit" disabled={loading}>
                {loading ? "Guardando..." : saveText}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminEntityModal;
