import test from "node:test";
import assert from "node:assert/strict";
import { imageSrcSet } from "../src/lib/images.js";

test("srcSet uses real dimensions, sorts candidates and removes duplicate widths", () => {
  assert.equal(
    imageSrcSet({
      variants: [
        { url: "/large.webp", width: 700 },
        { url: "/small.webp", width: 480 },
        { url: "/medium.webp", width: 700 },
      ],
    }),
    "/small.webp 480w, /medium.webp 700w",
  );
});

test("legacy images and missing media do not invent source widths", () => {
  assert.equal(imageSrcSet(null), undefined);
  assert.equal(
    imageSrcSet({ url: "/old.webp", urlSm: "/old-sm.webp" }),
    undefined,
  );
});
