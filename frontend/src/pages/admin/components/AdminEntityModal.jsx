import { useEffect } from "react";
import { useRef } from "react";
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
      } catch { }
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

function Field({ field, form, setForm }) {
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

  const isDisabled = typeof disabled === "function" ? disabled(form) : !!disabled;

  const onChange = (value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const currentSizes = type === "sizes" ? normalizeArrayValue(form?.[name]) : null;

  const commonProps = {
    className: type === "textarea" ? "adminTextarea" : "adminInput",
    value: form?.[name] ?? "",
    placeholder: placeholder || "",
    disabled: isDisabled,
  };

  if (type === "file") {
    const currentUrl = field.currentUrlKey ? form?.[field.currentUrlKey] : null;
    const currentName = field.currentNameKey ? form?.[field.currentNameKey] : null;
    const removeFlag = field.removeFlagKey ? !!form?.[field.removeFlagKey] : false;
    const selectedFile = form?.[name] instanceof File ? form[name] : null;
    const fileInputRef = useRef(null);

    const previewUrl = selectedFile
      ? URL.createObjectURL(selectedFile)
      : !removeFlag
        ? currentUrl
        : null;

    const shownName = selectedFile
      ? selectedFile.name
      : !removeFlag
        ? currentName
        : null;

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
        <label className="adminControlLabel">{label}</label>

        <input
          ref={fileInputRef}
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

        {help ? (
          <p className="adminMuted">
            {typeof help === "function" ? help(form) : help}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`adminFormField ${full ? "adminFormFieldFull" : ""}`}>
      <label className="adminControlLabel">{label}</label>

      {type === "textarea" ? (
        <textarea
          {...commonProps}
          rows={rows || 4}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : type === "select" ? (
        <select
          className="adminSelect"
          value={form?.[name] ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          onMouseDown={() => {
            const currentValue = form?.[name] ?? "";
            if (String(currentValue) !== "") return;

            const firstReal = options.find((o) => {
              const isObj = typeof o === "object" && o !== null;
              const v = isObj ? o.value : o;
              return String(v) !== "";
            });

            if (firstReal) {
              const isObj = typeof firstReal === "object" && firstReal !== null;
              const v = isObj ? firstReal.value : firstReal;
              onChange(String(v));
            }
          }}
        >
          {options.map((opt) => {
            const isObj = typeof opt === "object" && opt !== null;
            const optValue = isObj ? opt.value : opt;
            const text = isObj ? opt.label : String(opt);
            const optDisabled = isObj ? !!opt.disabled : false;
            const optHidden = isObj ? !!opt.hidden : false;

            const currentValue = form?.[name] ?? "";
            const isPlaceholder = String(optValue) === "";
            const shouldHide = optHidden || (isPlaceholder && String(currentValue) !== "");

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
      ) : type === "orderLines" ? (
        <div className="adminSizes" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="adminTable" style={{ width: "100%", minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Producto</th>
                  <th style={{ textAlign: "right" }}>Cantidad</th>
                  <th style={{ textAlign: "right" }}>Precio</th>
                  <th style={{ textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(form?.[name]) ? form?.[name] : []).map((ln, idx) => {
                  const producto =
                    ln?.nombre_producto ?? "-";

                  const qty = Number(ln?.cantidad ?? ln?.qty ?? 0) || 0;
                  const price = Number(ln?.precio ?? ln?.precio_unitario ?? ln?.price ?? 0) || 0;
                  const subtotal = qty * price;

                  return (
                    <tr key={idx}>
                      <td>{producto}</td>
                      <td style={{ textAlign: "right" }}>{qty}</td>
                      <td style={{ textAlign: "right" }}>{price.toFixed(2)} €</td>
                      <td style={{ textAlign: "right" }}>{subtotal.toFixed(2)} €</td>
                    </tr>
                  );
                })}

                {(!Array.isArray(form?.[name]) || form?.[name].length === 0) && (
                  <tr>
                    <td colSpan={4} className="adminMuted" style={{ padding: "12px 8px" }}>
                      Sin líneas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

      {typeof help === "function" ? (
        <p className="adminMuted">{help(form)}</p>
      ) : help ? (
        <p className="adminMuted">{help}</p>
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
  ok,
  loading,
  onClose,
  onSave,
  showSave = true,
  saveText = "Guardar",
  afterFields,
}) {
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="adminModalOverlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="adminModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="adminModalHeader">
          <h3 className="adminModalTitle">{title}</h3>
          <button className="adminModalClose" type="button" onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        <div className="adminModalBody">
          {error && <p className="adminError" style={{ marginTop: 0 }}>{error}</p>}
          {ok && <p className="adminOk" style={{ marginTop: 0 }}>{ok}</p>}

          <div className="adminFormGrid">
            {formFields.map((f) => (
              <Field key={f.name} field={f} form={form} setForm={setForm} />
            ))}
          </div>

          {afterFields ? <div className="adminAfterFields">{afterFields}</div> : null}
        </div>

        <div className="adminModalFooter">
          <div className="adminModalFooterInner">
            <button className="adminBtn" type="button" onClick={onClose} disabled={loading}>
              Volver
            </button>

            {showSave && (
              <button className="adminBtn" type="button" onClick={onSave} disabled={loading}>
                {loading ? "Guardando..." : saveText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminEntityModal;