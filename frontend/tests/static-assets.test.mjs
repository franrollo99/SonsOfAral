import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";

const frontend = new URL("../", import.meta.url);

test("los originales se conservan fuera del directorio publico", async () => {
  for (const name of ["logo-band.png", "bandaSOA2.png"]) {
    const original = await readFile(
      new URL(`assets/originals/${name}`, frontend),
    );
    assert.equal(original.subarray(1, 4).toString(), "PNG");
    await assert.rejects(access(new URL(`public/images/${name}`, frontend)), {
      code: "ENOENT",
    });
  }
  for (const name of ["bandaSOA.png", "logo.png"]) {
    await assert.rejects(access(new URL(`public/images/${name}`, frontend)), {
      code: "ENOENT",
    });
  }
});

test("las variantes publicas del manifiesto siguen disponibles", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("src/assets/site-images.json", frontend), "utf8"),
  );
  for (const image of Object.values(manifest)) {
    for (const variant of image.variants) {
      assert.ok(variant.url.startsWith("/images/optimized/"));
      await access(new URL(`public${variant.url}`, frontend));
    }
  }
});
