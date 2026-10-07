import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { metadata, metaEntries, normalizeSiteUrl } from "../lib/seo";

const config = {
  siteUrl: normalizeSiteUrl(import.meta.env.VITE_SITE_URL || ""),
  allowIndexing: import.meta.env.VITE_ALLOW_INDEXING === "true",
};

export default function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = metadata(pathname, config);
    document.title = meta.title;
    for (const [id, attribute, name, content] of metaEntries(meta)) {
      let element = document.getElementById(`soa-${id}`);
      if (!content) {
        element?.remove();
        continue;
      }
      if (!element) {
        element = document.createElement("meta");
        element.id = `soa-${id}`;
        document.head.append(element);
      }
      element.setAttribute(attribute, name);
      element.content = content;
    }
    let canonical = document.getElementById("soa-canonical");
    if (!meta.url) canonical?.remove();
    else {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.id = "soa-canonical";
        canonical.rel = "canonical";
        document.head.append(canonical);
      }
      canonical.href = meta.url;
    }
  }, [pathname]);
  return null;
}
