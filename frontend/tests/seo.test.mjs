import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  metadata,
  normalizeSiteUrl,
  renderHead,
  robotsText,
  sitemapXml,
} from "../src/lib/seo.js";
import { seoPlugin } from "../build/seoPlugin.js";

const production = { siteUrl: "https://example.com", allowIndexing: true };

test("SEO permanece desactivado hasta configurar la publicación", () => {
  assert.equal(metadata("/").robots, "noindex, nofollow");
  assert.equal(robotsText({}), "User-agent: *\nDisallow: /\n");
  assert.ok(!sitemapXml({}).includes("<url>"));
});

test("metadatos públicos y privados no incluyen credenciales de recuperación", () => {
  assert.equal(
    metadata("/musica/", production).url,
    "https://example.com/musica",
  );
  assert.equal(metadata("/musica", production).robots, "index, follow");
  const privateHead = renderHead(
    metadata("/gestion/recuperar?token=secret", production),
  );
  assert.ok(privateHead.includes("noindex, nofollow"));
  assert.ok(!privateHead.includes("secret"));
  assert.ok(!privateHead.includes("canonical"));
  assert.ok(!sitemapXml(production).includes("/gestion"));
});

test("valida el dominio y escapa HTML", () => {
  assert.equal(normalizeSiteUrl("https://example.com/"), "https://example.com");
  for (const invalid of [
    "http://example.com",
    "https://user:pass@example.com",
    "https://example.com/ruta",
  ]) {
    assert.throws(() => normalizeSiteUrl(invalid));
  }
  const head = renderHead({ ...metadata("/"), title: '<script>"&' });
  assert.ok(head.includes("&lt;script&gt;&quot;&amp;"));
  assert.ok(!head.includes("<script>"));
});

test("el build genera HTML público y privado con metadatos iniciales distintos", async () => {
  const directory = await mkdtemp(join(tmpdir(), "soa-seo-"));
  try {
    const plugin = seoPlugin(production);
    plugin.configResolved({
      command: "build",
      root: directory,
      build: { outDir: "." },
    });
    await writeFile(
      join(directory, "index.html"),
      plugin.transformIndexHtml("<head><!-- SEO_HEAD --></head>"),
    );
    await plugin.closeBundle();
    const music = await readFile(join(directory, "musica/index.html"), "utf8");
    const admin = await readFile(
      join(directory, "gestion/acceso/index.html"),
      "utf8",
    );
    assert.ok(music.includes("Música y lanzamientos"));
    assert.ok(music.includes("https://example.com/musica"));
    assert.ok(admin.includes("noindex, nofollow"));
    assert.ok(!admin.includes("canonical"));
    assert.ok(
      (await readFile(join(directory, "robots.txt"), "utf8")).includes(
        "Sitemap:",
      ),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("cerrar Vite en desarrollo no intenta generar archivos de producción", async () => {
  const plugin = seoPlugin({});
  plugin.configResolved({
    command: "serve",
    root: ".",
    build: { outDir: "dist" },
  });
  await plugin.closeBundle();
});
