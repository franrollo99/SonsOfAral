import { useEffect, useMemo, useRef, useState } from "react";
import { compressImageIfNeeded } from "../../../utils/compressImage";
import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const date = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString("es-ES");
};

const emptyGallery = {
    id: null,
    tipo: "concierto",
    titulo: "",
    conciertoId: "",
    portadaId: "",
    portadaFile: null,
    portadaPreview: "",
    removePortada: false,
    imagenesDraft: [],
};

function buildConcertLabel(concierto) {
    const fecha = concierto?.fecha ? date(concierto.fecha) : "-";
    const lugar = concierto?.lugar || "Sin lugar";
    const municipio = concierto?.municipio || "";
    const provincia = concierto?.provincia || "";
    const zona = [municipio, provincia].filter(Boolean).join(", ");
    return zona ? `${fecha} · ${lugar} · ${zona}` : `${fecha} · ${lugar}`;
}

function GalleryCoverField({ form, setForm }) {
    const inputRef = useRef(null);

    const handleCoverChange = (e) => {
        const file = e.target.files?.[0];

        if (!file || !String(file.type || "").startsWith("image/")) {
            e.target.value = "";
            return;
        }

        setForm((prev) => {
            if (prev.portadaPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(prev.portadaPreview);
            }

            return {
                ...prev,
                portadaFile: file,
                portadaPreview: URL.createObjectURL(file),
                portadaId: "",
                removePortada: false,
            };
        });

        e.target.value = "";
    };

    const coverUrl = form?.portadaPreview || "";

    return (
        <div className="d-flex flex-column gap-3">
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={handleCoverChange}
            />

            <div className="d-flex flex-wrap gap-2">
                <button
                    type="button"
                    className="adminActionBtn px-3"
                    onClick={() => inputRef.current?.click()}
                >
                    Seleccionar portada
                </button>
            </div>

            {coverUrl && (
                <div>
                    <img src={coverUrl} alt="Portada" className="galleryAdminCoverImage" />
                </div>
            )}
        </div>
    );
}

function GalleryImagesField({ form, setForm }) {
    const inputRef = useRef(null);

    const imagenes = Array.isArray(form?.imagenesDraft) ? form.imagenesDraft : [];
    const visibleImages = imagenes.filter((img) => !img.remove);
    const selectedImages = visibleImages.filter((img) => img.selected);

    const onAddImages = (e) => {
        const files = Array.from(e.target.files || []).filter((file) =>
            String(file.type || "").startsWith("image/")
        );

        if (!files.length) {
            e.target.value = "";
            return;
        }

        const nuevas = files.map((file) => ({
            _k: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
            id: null,
            file,
            url: URL.createObjectURL(file),
            selected: false,
            remove: false,
            isNew: true,
        }));

        setForm((prev) => ({
            ...prev,
            imagenesDraft: [...(Array.isArray(prev.imagenesDraft) ? prev.imagenesDraft : []), ...nuevas],
        }));

        e.target.value = "";
    };

    const toggleSelected = (_k) => {
        setForm((prev) => ({
            ...prev,
            imagenesDraft: (prev.imagenesDraft || []).map((img) =>
                img._k === _k ? { ...img, selected: !img.selected } : img
            ),
        }));
    };

    const removeSelectedImages = () => {
        setForm((prev) => ({
            ...prev,
            imagenesDraft: (prev.imagenesDraft || []).map((img) => {
                if (!img.selected) return img;

                if (img.isNew && img.url?.startsWith("blob:")) {
                    URL.revokeObjectURL(img.url);
                }

                return {
                    ...img,
                    remove: true,
                    selected: false,
                };
            }),
        }));
    };

    return (
        <div className="d-flex flex-column gap-3">
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={onAddImages}
            />

            <div className="d-flex flex-wrap gap-2">
                <button
                    type="button"
                    className="adminActionBtn px-3"
                    onClick={() => inputRef.current?.click()}
                >
                    Seleccionar imágenes
                </button>

                <button
                    type="button"
                    className="adminActionBtn adminActionBtn--danger px-3"
                    onClick={removeSelectedImages}
                    disabled={selectedImages.length === 0}
                >
                    Borrar seleccionadas
                </button>
            </div>

            {visibleImages.length > 0 && (
                <>
                    <div className="adminMuted">
                        {visibleImages.length} {visibleImages.length === 1 ? "imagen" : "imágenes"}
                        {selectedImages.length > 0 ? ` · ${selectedImages.length} seleccionadas` : ""}
                    </div>

                    <div className="galleryAdminGrid">
                        {visibleImages.map((img, index) => (
                            <button
                                key={img._k}
                                type="button"
                                className={`galleryAdminCard ${img.selected ? "isSelected" : ""}`}
                                onClick={() => toggleSelected(img._k)}
                            >
                                <img
                                    src={img.url}
                                    alt={`Imagen ${index + 1}`}
                                    className="galleryAdminImage"
                                />
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function GalleryManagement() {
    const [concertOptions, setConcertOptions] = useState([]);

    const loadConcerts = async (signal = undefined) => {
        try {
            const params = new URLSearchParams();
            params.append("sort", "latest");
            params.append("sin_galeria", "1");
            params.append("all", "1");

            const res = await fetch(`${import.meta.env.VITE_API_URL}/conciertos?${params.toString()}`, {
                headers: { Accept: "application/json" },
                signal,
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json().catch(() => ({}));
            const rows = Array.isArray(data?.data) ? data.data : [];
            setConcertOptions(rows);
        } catch (e) {
            if (e?.name !== "AbortError") {
                console.error(e);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        loadConcerts(controller.signal);
        return () => controller.abort();
    }, []);

    const conciertoSelectOptions = useMemo(() => {
        return [
            { value: "", label: "Selecciona un concierto" },
            ...concertOptions.map((c) => ({
                value: String(c.id),
                label: buildConcertLabel(c),
            })),
        ];
    }, [concertOptions]);

    return (
        <AdminCrudPage
            title="Galerías"
            entityName="galería"
            listPath="/galerias"
            createPath="/galerias"
            updatePath={(id) => `/galerias/${id}`}
            deletePath={(id) => `/galerias/${id}`}
            requireAdmin
            emptyForm={emptyGallery}
            searchKeys={["id", "tipo", "titulo", "nombre", "concierto.lugar", "concierto.fecha"]}
            mapRowToForm={(base, row) => {
                const imagenes = Array.isArray(row?.imagenes) ? row.imagenes : [];

                return {
                    ...base,
                    ...(row || {}),
                    tipo: row?.tipo || "concierto",
                    titulo: row?.titulo || "",
                    conciertoId: row?.conciertoId
                        ? String(row.conciertoId)
                        : row?.concierto_id
                            ? String(row.concierto_id)
                            : "",
                    portadaId: row?.portadaId
                        ? String(row.portadaId)
                        : row?.portada_id
                            ? String(row.portada_id)
                            : "",
                    portadaFile: null,
                    portadaPreview: row?.portada?.url || "",
                    removePortada: false,
                    imagenesDraft: imagenes.map((img) => ({
                        _k: String(img.id),
                        id: img.id,
                        file: null,
                        url: img.url,
                        selected: false,
                        remove: false,
                        isNew: false,
                    })),
                };
            }}
            columns={[
                { key: "id", header: "ID", className: "adminMono" },
                { key: "tipo", header: "Tipo" },
                { key: "nombre", header: "Nombre", className: "adminTruncate", title: (v) => v || "" },
                {
                    key: "imagenes",
                    header: "Imágenes",
                    render: (v) => (Array.isArray(v) ? v.length : 0),
                },
            ]}
            columnsGridCss={`
                grid-template-columns:
                100px
                2fr
                130px
                170px;
                min-width: 980px;
            `}
            formFields={[
                {
                    name: "tipo",
                    label: "Tipo",
                    type: "select",
                    options: [
                        { value: "concierto", label: "concierto" },
                        { value: "banda", label: "banda" },
                    ],
                },
            ]}
            modalAfterFields={({ form, setForm, error }) => {
                const currentConcertId = String(form?.conciertoId || "");
                const currentConcert = form?.concierto || null;

                const conciertoOptionsWithCurrent = [
                    { value: "", label: "Selecciona un concierto" },
                    ...(() => {
                        const options = concertOptions.map((c) => ({
                            value: String(c.id),
                            label: buildConcertLabel(c),
                        }));

                        const exists = options.some((opt) => opt.value === currentConcertId);

                        if (currentConcertId && currentConcert && !exists) {
                            options.unshift({
                                value: currentConcertId,
                                label: buildConcertLabel(currentConcert),
                            });
                        }

                        return options;
                    })(),
                ];

                return (
                    <div className="d-flex flex-column gap-3">
                        {String(form?.tipo) === "concierto" ? (
                            <div className="d-flex flex-column gap-2">
                                <label className="adminControlLabel">Concierto</label>

                                <select
                                    className="adminInput"
                                    value={form?.conciertoId || ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            conciertoId: e.target.value,
                                            titulo: "",
                                        }))
                                    }
                                >
                                    {conciertoOptionsWithCurrent.map((option) => (
                                        <option key={option.value || "empty"} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : null}

                        {String(form?.tipo) === "banda" ? (
                            <div className="d-flex flex-column gap-2">
                                <label className="adminControlLabel">Título</label>

                                <input
                                    type="text"
                                    className="adminInput"
                                    value={form?.titulo || ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            titulo: e.target.value,
                                            conciertoId: "",
                                        }))
                                    }
                                />
                            </div>
                        ) : null}

                        <div className="d-flex flex-column gap-2">
                            <label className="adminControlLabel">Portada</label>
                            <GalleryCoverField form={form} setForm={setForm} />
                        </div>

                        {error ? <div className="adminError">{error}</div> : null}

                        <div className="d-flex flex-column gap-2">
                            <label className="adminControlLabel">Imágenes</label>
                            <GalleryImagesField form={form} setForm={setForm} />
                        </div>
                    </div>
                );
            }}
            buildPayload={async (form) => {
                const fd = new FormData();
                const imagenes = Array.isArray(form.imagenesDraft) ? form.imagenesDraft : [];
                const removeImageIds = [];

                fd.append("tipo", form.tipo || "concierto");
                fd.append("titulo", String(form.tipo) === "banda" ? form.titulo || "" : "");
                fd.append("concierto_id", String(form.tipo) === "concierto" ? form.conciertoId || "" : "");

                if (form.portadaFile instanceof File) {
                    const compressed = await compressImageIfNeeded(form.portadaFile);
                    fd.append("portada", compressed);
                } else if (form.portadaId) {
                    fd.append("portada_id", String(form.portadaId));
                }

                if (form.removePortada) {
                    fd.append("remove_portada", "1");
                }

                for (const [index, img] of imagenes.entries()) {
                    if (img.remove && img.id) {
                        removeImageIds.push(img.id);
                    }

                    if (!img.remove && img.isNew && img.file instanceof File) {
                        const compressed = await compressImageIfNeeded(img.file);
                        fd.append(`imagenes[${index}]`, compressed);
                    }
                }

                if (removeImageIds.length > 0) {
                    fd.append("remove_imagen_ids", JSON.stringify(removeImageIds));
                }

                return fd;
            }}
            onSaveSuccess={() => {
                loadConcerts();
            }}
            onDeleteSuccess={() => {
                loadConcerts();
            }}
        />
    );
}

export default GalleryManagement;