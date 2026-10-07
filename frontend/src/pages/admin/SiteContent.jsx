import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useFormErrors } from "../../hooks/useFormErrors";
import FieldError from "../../components/FieldError";
import { apiJson } from "../../lib/api";
import { compressImageIfNeeded } from "../../utils/compressImage";
import "./AdminManagement.css";
import "./SiteContent.css";

function ImageEditor({ imageKey, title, image, onSaved }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const [alt, setAlt] = useState(image.alt);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { formRef, fieldErrors, setFieldErrors, fieldProps } =
    useFormErrors(error);
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function selectFile(nextFile) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = nextFile ? URL.createObjectURL(nextFile) : null;
    previewRef.current = url;
    setPreview(url);
    setFile(nextFile);
  }

  async function save(event, reset = false) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    setFieldErrors({});
    setSuccess("");
    try {
      const payload = new FormData();
      payload.append("_method", "PUT");
      payload.append("alt", alt);
      if (reset) payload.append("reset", "1");
      else if (file)
        payload.append(
          "image",
          await compressImageIfNeeded(file, { logo: imageKey === "logo" }),
        );
      const response = await apiJson(`/contenido-web/${imageKey}`, {
        method: "POST",
        body: payload,
      });
      onSaved(response.data);
      selectFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess(reset ? "Imagen original restaurada." : "Cambios guardados.");
    } catch (failure) {
      setFieldErrors(failure.data?.errors || {});
      setError(failure.message || "No se pudo guardar la imagen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      className="siteImageEditor"
      onSubmit={save}
      aria-busy={pending}
    >
      <h2>{title}</h2>
      <img
        className={`siteImagePreview ${imageKey === "logo" ? "siteImagePreview--logo" : ""}`}
        src={file ? preview || image.url : image.url}
        alt={alt || title}
      />
      <label className="adminControlLabel" htmlFor={`${imageKey}-file`}>
        Seleccionar nueva imagen
      </label>
      <input
        id={`${imageKey}-file`}
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={pending}
        aria-invalid={fieldErrors.image ? true : undefined}
        aria-describedby={`${imageKey}-help ${imageKey}-file-error`}
        onChange={(event) => {
          selectFile(event.target.files?.[0] || null);
          setSuccess("");
        }}
      />
      <p id={`${imageKey}-help`} className="adminMuted">
        PNG, JPG o WebP. Las fotos se optimizan automáticamente; el logo se
        guarda en PNG para conservar transparencia. SVG no está habilitado.
      </p>
      <FieldError id={`${imageKey}-file-error`} error={fieldErrors.image} />
      <label className="adminControlLabel" htmlFor={`${imageKey}-alt`}>
        Descripción de la imagen
      </label>
      <input
        id={`${imageKey}-alt`}
        className="adminInput"
        value={alt}
        maxLength={255}
        required
        disabled={pending}
        {...fieldProps("alt")}
        aria-describedby={fieldErrors.alt ? `${imageKey}-alt-error` : undefined}
        onChange={(event) => setAlt(event.target.value)}
      />
      <FieldError id={`${imageKey}-alt-error`} error={fieldErrors.alt} />
      {error && (
        <p className="adminError" role="alert" tabIndex={-1}>
          {error}
        </p>
      )}
      {success && (
        <p className="adminOk" role="status">
          {success}
        </p>
      )}
      <div className="siteImageActions">
        <button className="adminBtn" type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {image.custom && (
          <button
            className="adminLinkBtn"
            type="button"
            disabled={pending}
            onClick={(event) => save(event, true)}
          >
            Restaurar imagen original
          </button>
        )}
      </div>
    </form>
  );
}

export default function SiteContent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    apiJson("/contenido-web", { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) {
          setData(response.data);
          setError("");
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      });
    return () => controller.abort();
  }, [retry]);
  return (
    <section className="adminPageWrap">
      <div className="adminPageCard">
        <h1 className="adminPageTitle">Contenido de la web</h1>
        <div className="adminDivider" />
        <div className="siteContentIntro">
          <Link className="adminLinkBtn" to="/gestion">
            Volver al panel
          </Link>
          <p className="adminMuted">
            Cambia las imágenes fijas de la web. Las carpetas y los tamaños se
            gestionan automáticamente.
          </p>
        </div>
        {!data && !error && <p role="status">Cargando imágenes…</p>}
        {error && (
          <p className="adminError" role="alert">
            {error}
          </p>
        )}
        {error && (
          <button
            className="adminBtn"
            type="button"
            onClick={() => setRetry((value) => value + 1)}
          >
            Reintentar
          </button>
        )}
        {data?.home && data?.logo && (
          <div className="siteContentGrid">
            <ImageEditor
              imageKey="home"
              title="Foto principal de Inicio"
              image={data.home}
              onSaved={(image) =>
                setData((previous) => ({ ...previous, home: image }))
              }
            />
            <ImageEditor
              imageKey="logo"
              title="Logo de la web"
              image={data.logo}
              onSaved={(image) =>
                setData((previous) => ({ ...previous, logo: image }))
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
