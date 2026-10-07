export const publicPages = [
  {
    path: "/",
    title: "Sons of Aral | Web oficial de la banda",
    description:
      "Web de Sons of Aral. Descubre nuestra música, próximos conciertos y fotografías de la banda.",
  },
  {
    path: "/conciertos",
    title: "Conciertos | Sons of Aral",
    description:
      "Fechas, salas y entradas para los conciertos de Sons of Aral.",
  },
  {
    path: "/musica",
    title: "Música y lanzamientos | Sons of Aral",
    description:
      "Escucha la discografía de Sons of Aral: álbumes, EP y singles.",
  },
  {
    path: "/galeria",
    title: "Galería | Sons of Aral",
    description:
      "Fotografías de Sons of Aral, conciertos y momentos de la banda.",
  },
  {
    path: "/privacidad",
    title: "Privacidad | Sons of Aral",
    description:
      "Información sobre privacidad y tratamiento de datos en la web de Sons of Aral.",
  },
  {
    path: "/aviso-legal",
    title: "Aviso legal | Sons of Aral",
    description:
      "Información legal y condiciones de uso de la web de Sons of Aral.",
  },
];

export const adminPaths = [
  "/gestion",
  "/gestion/acceso",
  "/gestion/recuperar",
  "/gestion/conciertos",
  "/gestion/lanzamientos",
  "/gestion/galerias",
  "/gestion/contenido",
  "/gestion/contrasena",
];

export function normalizeSiteUrl(value = "") {
  if (!value) return "";
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "VITE_SITE_URL debe ser un origen HTTPS sin credenciales, ruta ni parámetros.",
    );
  }
  return url.origin;
}

export function metadata(path, { siteUrl = "", allowIndexing = false } = {}) {
  const pathname = path.replace(/\/$/, "") || "/";
  const page = publicPages.find((item) => item.path === pathname);
  const gallery = /^\/galeria\/\d+$/.test(pathname);
  const privatePage = !page && !gallery;
  const title =
    page?.title ||
    (gallery ? "Galería de fotos | Sons of Aral" : "Gestión | Sons of Aral");
  const description =
    page?.description ||
    (gallery
      ? "Fotografías de conciertos y de la banda Sons of Aral."
      : "Acceso privado a la gestión de Sons of Aral.");
  return {
    title,
    description,
    robots:
      allowIndexing && siteUrl && !privatePage
        ? "index, follow"
        : "noindex, nofollow",
    url: !privatePage && siteUrl ? siteUrl + pathname : "",
    image: siteUrl
      ? siteUrl + "/images/optimized/home-md.webp"
      : "/images/optimized/home-md.webp",
  };
}

export function metaEntries(meta) {
  return [
    ["description", "name", "description", meta.description],
    ["robots", "name", "robots", meta.robots],
    ["og-title", "property", "og:title", meta.title],
    ["og-description", "property", "og:description", meta.description],
    ["og-type", "property", "og:type", "website"],
    ["og-site-name", "property", "og:site_name", "Sons of Aral"],
    ["og-locale", "property", "og:locale", "es_ES"],
    ["og-url", "property", "og:url", meta.url],
    ["og-image", "property", "og:image", meta.image],
    ["og-image-alt", "property", "og:image:alt", "Sons of Aral"],
    ["twitter-card", "name", "twitter:card", "summary_large_image"],
    ["twitter-title", "name", "twitter:title", meta.title],
    ["twitter-description", "name", "twitter:description", meta.description],
    ["twitter-image", "name", "twitter:image", meta.image],
  ];
}

export function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

export function renderHead(meta) {
  const tags = [`<title id="soa-title">${escapeHtml(meta.title)}</title>`];
  for (const [id, attribute, name, content] of metaEntries(meta)) {
    if (content)
      tags.push(
        `<meta id="soa-${id}" ${attribute}="${name}" content="${escapeHtml(content)}" />`,
      );
  }
  if (meta.url)
    tags.push(
      `<link id="soa-canonical" rel="canonical" href="${escapeHtml(meta.url)}" />`,
    );
  return tags.join("\n");
}

export function robotsText(config) {
  return config.allowIndexing && config.siteUrl
    ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${config.siteUrl}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
}

export function sitemapXml(config) {
  const urls =
    config.allowIndexing && config.siteUrl
      ? publicPages
          .map(
            (page) =>
              `<url><loc>${escapeHtml(config.siteUrl + page.path)}</loc></url>`,
          )
          .join("\n")
      : "";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
