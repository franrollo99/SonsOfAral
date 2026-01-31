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
        // fallback abajo
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

  // ✅ ocultar campo dinámicamente (lo usaremos para tallas y lo que quieras)
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
        // ✅ NUEVO: detalle de líneas de pedido (solo lectura)
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
                    ln?.producto?.nombre ??
                    ln?.producto_nombre ??
                    ln?.nombre ??
                    ln?.producto ??
                    "-";

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
        <small className="adminMuted">{help(form)}</small>
      ) : help ? (
        <small className="adminMuted">{help}</small>
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
}) {
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
        </div>

        <div className="adminModalFooter">
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
  );
}

export default AdminEntityModal;
