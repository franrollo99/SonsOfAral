import assert from "node:assert/strict";
import test from "node:test";
import {
  pickLatestRelease,
  pickNextConcert,
  formatConcertDate,
} from "../src/lib/home-content.mjs";

const today = new Date("2026-10-08T12:00:00");

test("concert dates are readable in Spanish without changing the local day", () => {
  assert.equal(formatConcertDate("2026-11-02"), "2 de noviembre de 2026");
  assert.equal(formatConcertDate("2026-01-01"), "1 de enero de 2026");
  assert.equal(formatConcertDate(null), "");
  assert.equal(formatConcertDate("invalid"), "");
});

test("home chooses the nearest concert, including today, without mutating data", () => {
  const items = [
    { id: 1, fecha: "2026-11-01" },
    { id: 2, fecha: "invalid" },
    { id: 3, fecha: "2026-10-07" },
    { id: 4, fecha: "2026-10-08" },
  ];
  const original = [...items];
  assert.equal(pickNextConcert(items, today).id, 4);
  assert.deepEqual(items, original);
  assert.equal(pickNextConcert([{ fecha: "2026-10-07" }], today), null);
});

test("home chooses the latest released album, EP or single, excluding future dates", () => {
  const items = [
    { id: 1, tipo: "album", fechaLanzamiento: "2026-01-01" },
    { id: 2, tipo: "single", fechaLanzamiento: "2026-10-08" },
    { id: 3, tipo: "ep", fechaLanzamiento: "2026-12-01" },
    { id: 4, fechaLanzamiento: "invalid" },
  ];
  const original = [...items];
  assert.equal(pickLatestRelease(items, today).id, 2);
  assert.deepEqual(items, original);
  assert.equal(
    pickLatestRelease([{ fechaLanzamiento: "2026-12-01" }], today),
    null,
  );
});

test("home selectors handle missing and invalid content", () => {
  for (const items of [null, undefined, {}, [], [null, {}]]) {
    assert.equal(pickLatestRelease(items, today), null);
    assert.equal(pickNextConcert(items, today), null);
  }
});
