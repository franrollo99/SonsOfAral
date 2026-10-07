import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import {
  adminPaths,
  publicPages,
  metadata,
  renderHead,
  robotsText,
  sitemapXml,
} from "../src/lib/seo.js";

export function seoPlugin(config) {
  let outputDirectory;
  let isBuild = false;
  return {
    name: "soa-route-metadata",
    configResolved(resolved) {
      isBuild = resolved.command === "build";
      outputDirectory = resolve(resolved.root, resolved.build.outDir);
    },
    transformIndexHtml(html) {
      return html.replace(
        "<!-- SEO_HEAD -->",
        `<!-- SOA_HEAD_START -->\n${renderHead(metadata("/", config))}\n<!-- SOA_HEAD_END -->`,
      );
    },
    async closeBundle() {
      if (!isBuild) return;
      const index = await readFile(
        resolve(outputDirectory, "index.html"),
        "utf8",
      );
      for (const path of [
        ...publicPages.map((page) => page.path),
        ...adminPaths,
      ]) {
        if (path === "/") continue;
        const html = index.replace(
          /<!-- SOA_HEAD_START -->[\s\S]*?<!-- SOA_HEAD_END -->/,
          renderHead(metadata(path, config)),
        );
        const target = resolve(outputDirectory, path.slice(1), "index.html");
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, html);
      }
      await writeFile(
        resolve(outputDirectory, "robots.txt"),
        robotsText(config),
      );
      await writeFile(
        resolve(outputDirectory, "sitemap.xml"),
        sitemapXml(config),
      );
    },
  };
}
