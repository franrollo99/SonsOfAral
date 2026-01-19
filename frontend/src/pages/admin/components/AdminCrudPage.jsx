import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../AdminManagement.css";
import ConfirmModal from "./ConfirmModal";
import AdminEntityModal from "./AdminEntityModal";

const API_URL = "http://localhost:8000";

const normalize = (v) => String(v ?? "").toLowerCase();

function AdminCrudPage({
  title = "Entidad",
  subtitle = "Gestión por modal (crear/editar).",
  entityName = "registro",
  // endpoints
  listPath,   // "/api/conciertos"
  createPath, // "/api/conciertos"
  updatePath, // (id) => `/api/conciertos/${id}`
  deletePath, // (id) => `/api/conciertos/${id}`

  // table
  columns = [], // [{ key, header, render?, className?, title? }]
  columnsGridCss, // string CSS grid-template-columns + min-width

  // search
  searchKeys = [], // ["id","nombre",...]
  // editor
  emptyForm = {},
  formFields = [],
  buildPayload = (form) => form,

  // auth
  requireAdmin = true,
  backTo = "/area-admin",
}) {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);

  const authHeaders = useMemo(() => {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  // UI
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  // delete modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // editor modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [editorOk, setEditorOk] = useState("");
  const [form, setForm] = useState(emptyForm);

  // ========= Load + auth =========
  useEffect(() => {
    const run = async () => {
      setError("");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        if (requireAdmin) {
          const meRes = await fetch(`${API_URL}/api/auth/me`, {
            method: "GET",
            headers: authHeaders,
          });
          const meData = await meRes.json().catch(() => ({}));

          if (!meRes.ok) {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
            return;
          }

          const rol = meData?.user?.rol || meData?.user?.role;
          if (rol !== "admin") {
            navigate("/area-usuario", { replace: true });
            return;
          }
        }

        const res = await fetch(`${API_URL}${listPath}`, {
          method: "GET",
          headers: authHeaders,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `No se pudieron cargar ${title.toLowerCase()}.`);

        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setRows(list);
      } catch (e) {
        setError(e.message || `Error cargando ${title.toLowerCase()}.`);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [authHeaders, listPath, navigate, requireAdmin, title, token]);

  // ========= Search + pagination =========
  const filtered = useMemo(() => {
    const needle = normalize(q).trim();
    if (!needle) return rows;

    return rows.filter((r) => {
      const haystack = (searchKeys.length ? searchKeys : Object.keys(r || {}))
        .map((k) => normalize(r?.[k]))
        .join(" | ");
      return haystack.includes(needle);
    });
  }, [q, rows, searchKeys]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => setPage(1), [q, pageSize]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  // ========= Delete flow =========
  const onDeleteClick = (row) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setToDelete(null);
    setConfirmLoading(false);
  };

  const doDelete = async () => {
    if (!toDelete?.id) return;
    setConfirmLoading(true);

    try {
      const res = await fetch(`${API_URL}${deletePath(toDelete.id)}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `No se pudo borrar el ${entityName}.`);

      setRows((prev) => prev.filter((r) => r.id !== toDelete.id));
      closeConfirm();
    } catch (e) {
      alert(e.message || "Error borrando.");
      setConfirmLoading(false);
    }
  };

  // ========= Editor flow =========
  const openCreate = () => {
    setEditorError("");
    setEditorOk("");
    setForm({ ...emptyForm });
    setEditorOpen(true);
  };

  const openEdit = (row) => {
    setEditorError("");
    setEditorOk("");
    setForm({ ...emptyForm, ...(row || {}) });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorLoading(false);
    setEditorError("");
    setEditorOk("");
  };

  const onSave = async () => {
    setEditorError("");
    setEditorOk("");
    setEditorLoading(true);

    try {
      const isEdit = !!form.id;

      const url = isEdit
        ? `${API_URL}${updatePath(form.id)}`
        : `${API_URL}${createPath}`;

      const method = isEdit ? "PUT" : "POST";
      const payload = buildPayload(form);

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.message ||
          (data?.errors ? Object.values(data.errors).flat().join(" ") : "No se pudo guardar.");
        throw new Error(msg);
      }

      const saved = data?.data ?? data;

      if (isEdit) {
        setRows((prev) => prev.map((r) => (r.id === form.id ? saved : r)));
      } else {
        setRows((prev) => [saved, ...prev]);
      }

      setEditorOk(isEdit ? `${title.slice(0, -1)} actualizado.` : `${title.slice(0, -1)} creado.`);
      setEditorOpen(false);
    } catch (e) {
      setEditorError(e.message || "Error guardando.");
    } finally {
      setEditorLoading(false);
    }
  };

  // ========= Render =========
  if (loading) {
    return (
      <section className="container adminPageWrap">
        <div className="adminPageCard">
          <h1 className="adminPageTitle">{title}</h1>
          <p className="adminMuted">Cargando...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container adminPageWrap">
        <div className="adminPageCard">
          <h1 className="adminPageTitle">{title}</h1>
          <p className="adminError">{error}</p>
          <button className="adminBtn" onClick={() => navigate(backTo)}>Volver al panel</button>
        </div>
      </section>
    );
  }

  const colsClass = "adminEntityCols";

  return (
    <section className="container adminPageWrap">
      <div className="adminPageCard">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <h1 className="adminPageTitle">{title}</h1>
            <p className="adminMuted">{subtitle}</p>
          </div>

          <button className="adminLinkBtn" type="button" onClick={() => navigate(backTo)}>
            Volver
          </button>
        </div>

        <div className="adminDivider" />

        <div className="adminTableControls">
          <div className="adminControl">
            <label className="adminControlLabel">Mostrar</label>
            <select className="adminSelect" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="adminControl adminControlGrow">
            <label className="adminControlLabel">Buscar</label>
            <input
              className="adminInput"
              placeholder="Busca por cualquier campo"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="adminControl adminControlRight">
            <div className="adminControlLabel">Resultados</div>
            <div className="adminMuted">{total} encontrados</div>
          </div>
        </div>

        <div className="adminTableWrap">
          <div className="adminTable">
            <div className={`adminTableHead ${colsClass}`}>
              {columns.map((c) => (
                <div key={c.key} className={c.className || ""}>
                  {c.header}
                </div>
              ))}
              <div className="text-end">Acciones</div>
            </div>

            <div className="adminTableBody">
              {pageRows.length === 0 ? (
                <p className="adminMuted adminPad">No hay resultados.</p>
              ) : (
                pageRows.map((r) => (
                  <div key={r.id} className={`adminTableRow ${colsClass}`}>
                    {columns.map((c) => {
                      const raw = r?.[c.key];
                      const content = c.render ? c.render(raw, r) : (raw ?? "-");
                      const titleAttr = typeof c.title === "function" ? c.title(raw, r) : c.title;
                      return (
                        <div key={c.key} className={c.className || ""} title={titleAttr || ""}>
                          {content}
                        </div>
                      );
                    })}

                    <div className="adminActions">
                      <button className="adminActionBtn" type="button" onClick={() => openEdit(r)}>
                        Editar
                      </button>
                      <button className="adminActionBtn adminActionBtn--danger" type="button" onClick={() => onDeleteClick(r)}>
                        Borrar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="adminPager">
          <button className="adminPagerBtn" type="button" onClick={() => goTo(1)} disabled={page === 1}>«</button>
          <button className="adminPagerBtn" type="button" onClick={() => goTo(page - 1)} disabled={page === 1}>‹</button>

          <div className="adminPagerInfo">
            Página <b>{page}</b> de <b>{totalPages}</b>
          </div>

          <button className="adminPagerBtn" type="button" onClick={() => goTo(page + 1)} disabled={page === totalPages}>›</button>
          <button className="adminPagerBtn" type="button" onClick={() => goTo(totalPages)} disabled={page === totalPages}>»</button>
        </div>

        <div className="adminCreateBand">
          <div className="adminCreateBandInner">
            <button className="adminCreateBtn" type="button" onClick={openCreate}>
              + Crear {entityName}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirmar borrado"
        text={`¿Seguro que quieres borrar el ${entityName} #${toDelete?.id}?`}
        loading={confirmLoading}
        onCancel={closeConfirm}
        onConfirm={doDelete}
      />

      <AdminEntityModal
        open={editorOpen}
        title={form.id ? `Editar ${entityName} #${form.id}` : `Crear ${entityName}`}
        formFields={formFields}
        form={form}
        setForm={setForm}
        error={editorError}
        ok={editorOk}
        loading={editorLoading}
        onClose={closeEditor}
        onSave={onSave}
        saveText="Guardar"
      />

      {/* columnas de la tabla */}
      <style>{`
        .adminEntityCols{
          ${columnsGridCss}
        }
      `}</style>
    </section>
  );
}

export default AdminCrudPage;