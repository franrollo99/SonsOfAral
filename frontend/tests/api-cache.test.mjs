import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  apiJson,
  apiRequest,
  clearSession,
  getAuthToken,
  setSession,
  SESSION_EVENT,
} from "../src/lib/api.js";
import {
  CONTENT_EVENT,
  contentRevision,
  invalidateContent,
  readCache,
  writeCache,
} from "../src/lib/cache.js";

beforeEach(() => {
  globalThis.window = new EventTarget();
  const storage = {};
  Object.defineProperties(storage, {
    getItem: { value: (key) => storage[key] ?? null },
    setItem: {
      value: (key, value) => {
        storage[key] = String(value);
      },
    },
    removeItem: {
      value: (key) => {
        delete storage[key];
      },
    },
  });
  globalThis.localStorage = storage;
});

test("una sesión caducada notifica el cierre; un error de servidor conserva el token", async () => {
  setSession("admin-token");
  let notifications = 0;
  window.addEventListener(SESSION_EVENT, () => {
    notifications++;
  });
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "No disponible" }), { status: 500 });
  await assert.rejects(apiJson("/auth/me"), { status: 500 });
  assert.equal(getAuthToken(), "admin-token");
  assert.equal(notifications, 0);
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "Sesión caducada" }), {
      status: 401,
    });
  await assert.rejects(apiJson("/auth/me"), { status: 401 });
  assert.equal(getAuthToken(), null);
  assert.equal(notifications, 1);
});

test("credenciales incorrectas en login no cierran otra sesión existente", async () => {
  setSession("existing");
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.has("Authorization"), false);
    return new Response("{}", { status: 401 });
  };
  await assert.rejects(apiJson("/auth/login", { auth: false, method: "POST" }));
  assert.equal(getAuthToken(), "existing");
});

test("un 401 de una petición anterior no borra un token nuevo", async () => {
  setSession("old");
  globalThis.fetch = async () => {
    setSession("new");
    return new Response("{}", { status: 401 });
  };
  await assert.rejects(apiJson("/auth/me"));
  assert.equal(getAuthToken(), "new");
});

test("subidas FormData conservan el boundary automático y muestran validación por campo", async () => {
  setSession("admin");
  const body = new FormData();
  body.append("titulo", "Prueba");
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.body, body);
    assert.equal(options.headers.has("Content-Type"), false);
    assert.equal(options.headers.get("Authorization"), "Bearer admin");
    return new Response(
      JSON.stringify({
        message: "Datos inválidos",
        errors: { portada: ["Imagen demasiado grande"] },
      }),
      { status: 422 },
    );
  };
  await assert.rejects(apiJson("/galerias", { method: "POST", body }), {
    message: "Imagen demasiado grande",
  });
});

test("guardar o borrar contenido invalida listas, detalles y opciones relacionadas", async () => {
  writeCache("/conciertos", [1], contentRevision());
  writeCache("/galerias/2", { id: 2 }, contentRevision());
  let notifications = 0;
  window.addEventListener(CONTENT_EVENT, () => {
    notifications++;
  });
  globalThis.fetch = async () => new Response(null, { status: 204 });
  await apiJson("/conciertos/1", { method: "DELETE" });
  assert.equal(readCache("/conciertos"), null);
  assert.equal(readCache("/galerias/2"), null);
  assert.equal(notifications, 1);
});

test("una edición fallida no invalida datos válidos", async () => {
  writeCache("/lanzamientos", [1], contentRevision());
  globalThis.fetch = async () => new Response("{}", { status: 422 });
  await assert.rejects(apiJson("/lanzamientos/1", { method: "PUT" }));
  assert.deepEqual(readCache("/lanzamientos"), [1]);
});

test("la caché caduca a los cinco minutos y rechaza respuestas anteriores a una edición", () => {
  const oldRevision = contentRevision();
  writeCache("/conciertos", [1], oldRevision);
  const now = Date.now;
  Date.now = () => now() + 5 * 60 * 1000 + 1;
  try {
    assert.equal(readCache("/conciertos"), null);
  } finally {
    Date.now = now;
  }
  invalidateContent();
  assert.equal(writeCache("/conciertos", ["obsoleto"], oldRevision), false);
  assert.equal(readCache("/conciertos"), null);
});

test("se transmite AbortSignal y los errores de red conservan la sesión", async () => {
  setSession("admin");
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.signal, controller.signal);
    throw new DOMException("Cancelado", "AbortError");
  };
  await assert.rejects(
    apiRequest("/conciertos", { signal: controller.signal }),
    { name: "AbortError" },
  );
  assert.equal(getAuthToken(), "admin");
  clearSession();
});

test("cambiar las imágenes fijas invalida su caché pública", async () => {
  writeCache(
    "/contenido-web",
    { home: { url: "/old.webp" } },
    contentRevision(),
  );
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ data: {} }), { status: 200 });
  await apiJson("/contenido-web/home", {
    method: "POST",
    body: new FormData(),
  });
  assert.equal(readCache("/contenido-web"), null);
});
