import "../AdminManagement.css";

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
  } = field;

  const isDisabled = typeof disabled === "function" ? disabled(form) : !!disabled;

  const onChange = (value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

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
        >
          {options.map((opt) => {
            const value = typeof opt === "object" ? opt.value : opt;
            const text = typeof opt === "object" ? opt.label : String(opt);
            return (
              <option key={String(value)} value={value}>
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
      ) : (
        <input
          {...commonProps}
          type={type}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            // number => guardamos string para no romper el input; parseas en buildPayload()
            onChange(e.target.value);
          }}
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
          <button className="adminBtn" type="button" onClick={onSave} disabled={loading}>
            {loading ? "Guardando..." : saveText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminEntityModal;