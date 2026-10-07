import { apiJson } from "../../../lib/api";
import { useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../AdminManagement.css";
import ConfirmModal from "./ConfirmModal";
import AdminEntityModal from "./AdminEntityModal";

const normalize = (v) => String(v ?? "").toLowerCase();

function AdminCrudPage({
  title = "Entidad",
  entityName = "registro",
  hideSave = false,
  listPath,
  createPath,
  updatePath,
  deletePath,
  columns = [],
  columnsGridCss,
  searchKeys = [],
  editLabel = "Editar",
  emptyForm = {},
  formFields = [],
  buildPayload = (form) => form,
  backTo = "/gestion",
  modalAfterFields,
  mapRowToForm,
  onSaveSuccess,
  onDeleteSuccess,
}) {
  const navigate = useNavigate();
  const controlsId = useId();
  const canCreate = !!createPath;
  const canDelete = typeof deletePath === "function";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editorFieldErrors, setEditorFieldErrors] = useState({});
  const [toDelete, setToDelete] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [editorOk, setEditorOk] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setError("");

      try {
        const data = await apiJson(listPath, { signal: controller.signal });
        if (controller.signal.aborted) return;
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setRows(list);
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e.message || `Error cargando ${title.toLowerCase()}.`);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [listPath, title]);

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

  const onDeleteClick = (row) => {
    if (!canDelete) return;
    setDeleteError("");
    setToDelete(row);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setToDelete(null);
    setConfirmLoading(false);
  };

  const doDelete = async () => {
    if (!canDelete) return;
    if (!toDelete?.id) return;

    setDeleteError("");
    setConfirmLoading(true);

    try {
      await apiJson(deletePath(toDelete.id), { method: "DELETE" });

      setRows((prev) => prev.filter((r) => r.id !== toDelete.id));

      if (typeof onDeleteSuccess === "function") {
        onDeleteSuccess(toDelete);
      }

      closeConfirm();
    } catch (e) {
      setDeleteError(e.message || "Error borrando.");
      setConfirmLoading(false);
    }
  };

  const openCreate = () => {
    if (!canCreate) return;
    setEditorFieldErrors({});
    setEditorError("");
    setEditorOk("");
    const base = { ...emptyForm };
    const finalForm =
      typeof mapRowToForm === "function" ? mapRowToForm(base, null) : base;
    setForm(finalForm);
    setEditorOpen(true);
  };

  const openEdit = (row) => {
    setEditorFieldErrors({});
    setEditorError("");
    setEditorOk("");
    const base = { ...emptyForm, ...(row || {}) };
    const finalForm =
      typeof mapRowToForm === "function" ? mapRowToForm(base, row) : base;
    setForm(finalForm);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorLoading(false);
    setEditorFieldErrors({});
    setEditorError("");
    setEditorOk("");
  };

  const onSave = async () => {
    if (editorLoading) return;
    setEditorFieldErrors({});
    setEditorError("");
    setEditorOk("");
    setEditorLoading(true);

    try {
      const isEdit = !!form.id;

      if (!isEdit && !canCreate) {
        throw new Error("Crear está deshabilitado para esta entidad.");
      }

      const url = isEdit ? updatePath(form.id) : createPath;

      const payload = await buildPayload(form);
      const isFD = payload instanceof FormData;

      let method = isEdit ? "PUT" : "POST";

      if (isEdit && isFD) {
        payload.append("_method", "PUT");
        method = "POST";
      }

      const data = await apiJson(url, {
        method,
        headers: isFD ? {} : { "Content-Type": "application/json" },
        body: isFD ? payload : JSON.stringify(payload),
      });

      const saved = data?.data ?? data;

      if (isEdit) {
        setRows((prev) => prev.map((r) => (r.id === form.id ? saved : r)));
      } else {
        setRows((prev) => [saved, ...prev]);
      }

      if (typeof onSaveSuccess === "function") {
        onSaveSuccess(saved);
      }

      setEditorOk(
        isEdit
          ? `${title.slice(0, -1)} actualizado.`
          : `${title.slice(0, -1)} creado.`,
      );
      setEditorOpen(false);
    } catch (e) {
      setEditorFieldErrors(e.data?.errors || {});
      setEditorError(e.message || "Error guardando.");
    } finally {
      setEditorLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container adminPageWrap">
        <div className="adminPageCard">
          <h1 className="adminPageTitle">{title}</h1>
          <p className="adminMuted" role="status">
            Cargando...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container adminPageWrap">
        <div className="adminPageCard">
          <h1 className="adminPageTitle">{title}</h1>
          <p className="adminError" role="alert">
            {error}
          </p>
          <button className="adminBtn" onClick={() => navigate(backTo)}>
            Volver al panel
          </button>
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
          </div>

          <button
            className="adminLinkBtn"
            data-modal-return-focus
            type="button"
            onClick={() => navigate(backTo)}
          >
            Volver
          </button>
        </div>

        <div className="adminDivider" />

        {editorOk && (
          <p className="adminOk" role="status">
            {editorOk}
          </p>
        )}
        <div className="adminTableControls">
          <div className="adminControl">
            <label className="adminControlLabel" htmlFor={`${controlsId}-size`}>
              Mostrar
            </label>
            <select
              id={`${controlsId}-size`}
              className="adminSelect"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="adminControl adminControlGrow">
            <label
              className="adminControlLabel"
              htmlFor={`${controlsId}-search`}
            >
              Buscar
            </label>
            <input
              className="adminInput"
              id={`${controlsId}-search`}
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
              <div className="text-center">Acciones</div>
            </div>

            <div className="adminTableBody">
              {pageRows.length === 0 ? (
                <p className="adminMuted adminPad">No hay resultados.</p>
              ) : (
                pageRows.map((r) => (
                  <div key={r.id} className={`adminTableRow ${colsClass}`}>
                    {columns.map((c) => {
                      const raw = r?.[c.key];
                      const content = c.render
                        ? c.render(raw, r)
                        : (raw ?? "-");
                      const titleAttr =
                        typeof c.title === "function"
                          ? c.title(raw, r)
                          : c.title;
                      return (
                        <div
                          key={c.key}
                          className={c.className || ""}
                          title={titleAttr || ""}
                        >
                          {content}
                        </div>
                      );
                    })}

                    <div className="adminActions">
                      <button
                        className="adminActionBtn"
                        type="button"
                        onClick={() => openEdit(r)}
                      >
                        {editLabel}
                      </button>

                      {canDelete ? (
                        <button
                          className="adminActionBtn adminActionBtn--danger"
                          type="button"
                          onClick={() => onDeleteClick(r)}
                        >
                          Borrar
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="adminPager">
          <button
            className="adminPagerBtn"
            aria-label="Primera página"
            type="button"
            onClick={() => goTo(1)}
            disabled={page === 1}
          >
            «
          </button>
          <button
            className="adminPagerBtn"
            aria-label="Página anterior"
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
          >
            ‹
          </button>

          <div className="adminPagerInfo">
            Página <b>{page}</b> de <b>{totalPages}</b>
          </div>

          <button
            className="adminPagerBtn"
            aria-label="Página siguiente"
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
          >
            ›
          </button>
          <button
            className="adminPagerBtn"
            aria-label="Última página"
            type="button"
            onClick={() => goTo(totalPages)}
            disabled={page === totalPages}
          >
            »
          </button>
        </div>

        {canCreate ? (
          <div className="adminCreateBand">
            <div className="adminCreateBandInner">
              <button
                className="adminCreateBtn"
                type="button"
                onClick={openCreate}
              >
                Crear {entityName}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {canDelete ? (
        <ConfirmModal
          open={confirmOpen}
          title="Confirmar borrado"
          text={`¿Seguro que quieres borrar el ${entityName}?`}
          error={deleteError}
          loading={confirmLoading}
          onCancel={closeConfirm}
          onConfirm={doDelete}
        />
      ) : null}

      <AdminEntityModal
        open={editorOpen}
        title={form.id ? `Editar ${entityName}` : `Crear ${entityName}`}
        formFields={formFields}
        form={form}
        setForm={setForm}
        fieldErrors={editorFieldErrors}
        error={editorError}
        ok={editorOk}
        loading={editorLoading}
        onClose={closeEditor}
        onSave={onSave}
        saveText="Guardar"
        showSave={!hideSave}
        afterFields={
          typeof modalAfterFields === "function"
            ? modalAfterFields({
                form,
                setForm,
                fieldErrors: editorFieldErrors,
              })
            : null
        }
      />

      <style>{`
        .adminEntityCols{
          ${columnsGridCss}
        }
      `}</style>
    </section>
  );
}

export default AdminCrudPage;
