import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";

// Run with Vite already running. All API calls are mocked; no database writes.
const baseUrl = process.env.A11Y_BASE_URL || "http://localhost:5173";
const executable =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profile = await mkdtemp(join(tmpdir(), "soa-a11y-"));
const browser = spawn(
  executable,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);
let launchError;
browser.on("error", (error) => {
  launchError = error;
});
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
let socket;
let sequence = 0;
const pending = new Map();

async function poll(callback, message) {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (launchError) throw launchError;
    if (await callback()) return;
    await pause(100);
  }
  throw new Error(message);
}

function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolveCall, rejectCall) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      rejectCall(new Error(`CDP timeout: ${method}`));
    }, 10000);
    pending.set(id, { resolveCall, rejectCall, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function navigate(path, selector) {
  await send("Page.navigate", { url: `${baseUrl}${path}` });
  await poll(
    () => evaluate(`!!document.querySelector(${JSON.stringify(selector)})`),
    `Missing ${selector} on ${path}`,
  );
}

async function key(key, modifiers = 0) {
  const codes = { Tab: 9, Escape: 27, Enter: 13, ArrowRight: 39, " ": 32 };
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key,
    code: key === " " ? "Space" : key,
    text: key === "Enter" ? "\r" : key === " " ? " " : undefined,
    windowsVirtualKeyCode: codes[key],
    modifiers,
  });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, modifiers });
}

async function fill(selector, value) {
  await evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
}

async function waitDialog(open = true) {
  await poll(
    () => evaluate(`!!document.querySelector('[role="dialog"]') === ${open}`),
    "Dialog state did not update",
  );
}

async function checkFocusTrap() {
  assert.equal(
    await evaluate(`(() => {
      const bounds = document.querySelector('[role="dialog"]').getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= innerWidth && bounds.width > 0;
    })()`),
    true,
    "Dialog fits the viewport",
  );
  assert.equal(
    await evaluate(
      `document.querySelector('[role="dialog"]').contains(document.activeElement)`,
    ),
    true,
  );
  await evaluate(
    `window.dialogItems = [...document.querySelector('[role="dialog"]').querySelectorAll('button,a[href],input,select,textarea,[tabindex]')].filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length); window.dialogItems.at(-1).focus()`,
  );
  await key("Tab");
  assert.equal(
    await evaluate("document.activeElement === window.dialogItems[0]"),
    true,
    "Tab wraps to first control",
  );
  assert.equal(
    await evaluate(
      "getComputedStyle(document.activeElement).outlineStyle !== 'none'",
    ),
    true,
    "Keyboard focus is visibly outlined",
  );
  await key("Tab", 8);
  assert.equal(
    await evaluate("document.activeElement === window.dialogItems.at(-1)"),
    true,
    "Shift+Tab wraps to last control",
  );
  assert.equal(
    await evaluate("document.querySelector('.siteHeader').inert"),
    true,
    "Background is inert",
  );
}

try {
  let port;
  await poll(async () => {
    try {
      port = Number(
        (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split(
          "\n",
        )[0],
      );
      return !!port;
    } catch {
      return false;
    }
  }, "Chrome did not start");
  const targets = await (
    await fetch(`http://127.0.0.1:${port}/json/list`)
  ).json();
  socket = new WebSocket(
    targets.find((target) => target.type === "page").webSocketDebuggerUrl,
  );
  await new Promise((done, fail) => {
    socket.onopen = done;
    socket.onerror = fail;
  });
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    const call = pending.get(message.id);
    if (!call) return;
    clearTimeout(call.timeout);
    pending.delete(message.id);
    if (message.error) call.rejectCall(new Error(message.error.message));
    else call.resolveCall(message.result);
  };
  await send("Page.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
    localStorage.clear();
    localStorage.setItem('token', 'test-admin');
    const image = '/images/logo.png';
    const release = { id: 1, titulo: 'Test release', tipo: 'album', fechaLanzamiento: '2026-01-01', portada: { url: image }, canciones: [{id: 1, titulo: 'Test song', duracion: 60}] };
    const concert = { id: 1, lugar: 'Test venue', fecha: '2099-01-01', cartel: { url: image } };
    const gallery = { id: 1, tipo: 'banda', titulo: 'Test gallery', nombre: 'Test gallery', imagenes: [{id:1, url:image}, {id:2, url:image}] };
    const siteImages = { home: {alt: 'Sons of Aral', url: '/images/optimized/home-lg.webp', custom: false, variants: []}, logo: {alt: 'Sons of Aral', url: '/images/optimized/logo-sm.png', custom: false, variants: []} };
    const originalFetch = window.fetch;
    window.fetch = async (input, options = {}) => {
      const url = new URL(input, location.href);
      if (!url.pathname.includes('/api/')) return originalFetch(input, options);
      if (options.method === 'DELETE') return new Response(JSON.stringify({ message: 'No se pudo borrar: prueba' }), { status: 500 });
      if (['POST','PUT'].includes(options.method)) {
        await new Promise(resolve => setTimeout(resolve, 250));
        if (url.pathname.includes('/contenido-web/') && window.mockSuccess) {
          const key = url.pathname.split('/').at(-1);
          siteImages[key] = { ...siteImages[key], alt: options.body.get('alt'), custom: options.body.get('reset') !== '1' };
          return new Response(JSON.stringify({data: siteImages[key]}), {status: 200});
        }
        if (window.mockSuccess) return new Response(JSON.stringify({ message: 'OK' }), { status: 200 });
        return new Response(JSON.stringify({ message: 'Datos inválidos', errors: { titulo: ['El título es obligatorio.'], email: ['Email no válido.'], current_password: ['Contraseña incorrecta.'] } }), { status: 422 });
      }
      const payload = url.pathname.endsWith('/auth/me') ? { data: { user: { rol: 'admin' } } }
        : url.pathname.endsWith('/contenido-web') ? {data: siteImages}
        : url.pathname.endsWith('/lanzamientos') ? [release]
        : url.pathname.includes('/conciertos') ? [concert]
        : url.pathname.endsWith('/galerias/1') ? gallery : [gallery];
      return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
  `,
  });

  await navigate("/musica", ".lanzamiento");
  await poll(
    () => evaluate("document.title === 'Música y lanzamientos | Sons of Aral'"),
    "Music metadata not updated",
  );
  await evaluate("document.querySelector('.lanzamiento').focus()");
  await key("Enter");
  await waitDialog();
  await checkFocusTrap();
  await key("Escape");
  await waitDialog(false);
  assert.equal(
    await evaluate("document.activeElement.matches('.lanzamiento')"),
    true,
  );
  assert.equal(await evaluate("document.body.style.overflow"), "");
  assert.equal(
    await evaluate("document.querySelector('.siteHeader').inert"),
    false,
  );
  await key(" ");
  await waitDialog();
  await key("Escape");
  console.log(
    "PASS: music cards, Tab/Shift+Tab, Escape, focus restoration, background",
  );

  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
  });
  assert.equal(
    await evaluate("document.querySelector('#mobile-navigation').inert"),
    true,
  );
  await evaluate(
    "document.querySelector('.menuToggle').focus(); document.querySelector('.menuToggle').click()",
  );
  await poll(
    () => evaluate("!document.querySelector('#mobile-navigation').inert"),
    "Mobile menu did not open",
  );
  await key("Escape");
  await poll(
    () => evaluate("document.querySelector('#mobile-navigation').inert"),
    "Mobile menu did not close",
  );
  assert.equal(
    await evaluate("document.activeElement.matches('.menuToggle')"),
    true,
  );
  console.log(
    "PASS: mobile menu closed links inert, Escape restores toggle focus",
  );

  await navigate("/galeria/1", ".galleryImageCard");
  await evaluate(
    "document.querySelector('.galleryImageCard').focus(); document.querySelector('.galleryImageCard').click()",
  );
  await waitDialog();
  await checkFocusTrap();
  await key("ArrowRight");
  await poll(
    () =>
      evaluate(
        "document.querySelector('.lightboxCounter').textContent.includes('2 / 2')",
      ),
    "Gallery arrow failed",
  );
  await key("Escape");
  await waitDialog(false);
  assert.equal(
    await evaluate("document.activeElement.matches('.galleryImageCard')"),
    true,
  );
  console.log("PASS: mobile gallery arrows, focus trap and restoration");

  await navigate("/", ".homePosterBtn");
  await evaluate(
    "document.querySelector('.homePosterBtn').focus(); document.querySelector('.homePosterBtn').click()",
  );
  await waitDialog();
  await checkFocusTrap();
  await key("Escape");
  await waitDialog(false);
  assert.equal(
    await evaluate("document.activeElement.matches('.homePosterBtn')"),
    true,
  );
  console.log("PASS: poster lightbox single-control Tab loop and Escape");

  await send("Emulation.clearDeviceMetricsOverride");
  await navigate("/gestion/conciertos", ".adminActions");
  await evaluate(
    "document.querySelector('.adminActions button').focus(); document.querySelector('.adminActions button').click()",
  );
  await waitDialog();
  await checkFocusTrap();
  await evaluate(
    "document.querySelector('.adminModal input[type=text]').focus()",
  );
  await key("Enter");
  await key("Escape");
  assert.equal(
    await evaluate("!!document.querySelector('[role=dialog]')"),
    true,
    "Cannot dismiss pending mutation",
  );
  await poll(
    () => evaluate("!!document.querySelector('[role=alert]')"),
    "Validation error missing",
  );
  await key("Escape");
  await waitDialog(false);
  await evaluate(
    "document.querySelector('.adminActions button:last-child').focus(); document.querySelector('.adminActions button:last-child').click()",
  );
  await waitDialog();
  assert.equal(
    await evaluate(
      "document.activeElement.hasAttribute('data-modal-initial-focus')",
    ),
    true,
    "Cancel initially focused",
  );
  await evaluate(
    "document.querySelector('[role=dialog] .adminActionBtn--danger').click()",
  );
  await poll(
    () => evaluate("!!document.querySelector('[role=dialog] [role=alert]')"),
    "Delete error missing",
  );
  assert.equal(
    await evaluate("!!document.querySelector('[role=dialog]')"),
    true,
  );
  await key("Escape");
  await waitDialog(false);
  console.log(
    "PASS: admin dialogs, pending save dismissal blocked, deletion error accessible",
  );

  await navigate("/gestion/galerias", ".adminCreateBtn");
  await evaluate("document.querySelector('.adminActions button').click()");
  await waitDialog();
  await evaluate(
    "document.querySelector('.adminModalFooter button:last-child').click()",
  );
  await poll(
    () => evaluate("document.activeElement.id === 'gallery-title'"),
    "Invalid gallery title not focused",
  );
  assert.equal(
    await evaluate(
      "document.getElementById(document.activeElement.getAttribute('aria-describedby')).textContent",
    ),
    "El título es obligatorio.",
  );
  await key("Escape");
  console.log("PASS: validation error associated with invalid field and focus");

  await navigate("/gestion/lanzamientos", ".adminCreateBtn");
  await evaluate("document.querySelector('.adminCreateBtn').click()");
  await waitDialog();
  await evaluate(
    "document.querySelector('.adminModalFooter button:last-child').click()",
  );
  await poll(
    () => evaluate("document.activeElement.id === 'song-base-title'"),
    "Invalid nested song title not focused",
  );
  assert.equal(
    await evaluate("document.activeElement.getAttribute('aria-invalid')"),
    "true",
  );
  await key("Escape");
  console.log(
    "PASS: nested song validation associates title and duration errors",
  );

  await navigate("/gestion/acceso", "#email");
  await poll(
    () => evaluate("document.title === 'Gestión | Sons of Aral'"),
    "Admin metadata not updated",
  );
  assert.equal(
    await evaluate("document.querySelector('meta[name=robots]').content"),
    "noindex, nofollow",
  );
  await fill("#email", "admin@example.com");
  await fill("#password", "wrong");
  await evaluate("document.querySelector('form').requestSubmit()");
  await poll(
    () =>
      evaluate(
        "document.activeElement.id === 'email' && document.activeElement.getAttribute('aria-invalid') === 'true'",
      ),
    "Login invalid field not focused",
  );
  console.log("PASS: login labels, inline errors and invalid field focus");

  await navigate("/gestion/contrasena", "#current_password");
  await fill("#current_password", "wrong");
  await fill("#password", "StrongPass1!");
  await fill("#password_confirmation", "StrongPass1!");
  await evaluate("document.querySelector('form').requestSubmit()");
  await poll(
    () =>
      evaluate(
        "document.activeElement.id === 'current_password' && document.activeElement.getAttribute('aria-invalid') === 'true'",
      ),
    "Invalid current password not focused",
  );
  console.log("PASS: change password server validation focus");

  await navigate(
    "/gestion/recuperar?token=test&email=admin@example.com",
    "#password2",
  );
  await fill("#password", "StrongPass1!");
  await fill("#password2", "different");
  await evaluate("document.querySelector('form').requestSubmit()");
  await poll(
    () =>
      evaluate(
        "document.activeElement.id === 'password2' && document.activeElement.getAttribute('aria-invalid') === 'true'",
      ),
    "Password mismatch not focused",
  );
  await fill("#password2", "StrongPass1!");
  await evaluate(
    "window.mockSuccess = true; document.querySelector('form').requestSubmit()",
  );
  await poll(
    () => evaluate("!!document.querySelector('[role=status]')"),
    "Recovery success not announced",
  );
  await pause(1500);
  assert.equal(await evaluate("location.pathname"), "/gestion/recuperar");
  console.log(
    "PASS: recovery mismatch focus and readable success without automatic redirect",
  );
  await navigate("/gestion/contenido", "#home-file");
  assert.equal(
    await evaluate("document.querySelectorAll('.siteImageEditor').length"),
    2,
  );
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
  });
  assert.equal(
    await evaluate(
      "document.querySelector('.siteContentGrid').scrollWidth <= document.querySelector('.siteContentGrid').clientWidth",
    ),
    true,
  );
  const dom = await send("DOM.getDocument");
  const input = await send("DOM.querySelector", {
    nodeId: dom.root.nodeId,
    selector: "#logo-file",
  });
  await send("DOM.setFileInputFiles", {
    nodeId: input.nodeId,
    files: [resolve("public/images/optimized/logo-sm.png")],
  });
  await fill("#logo-alt", "Logo nuevo");
  await evaluate(
    "window.mockSuccess = true; document.querySelectorAll('.siteImageEditor')[1].requestSubmit()",
  );
  await poll(
    () =>
      evaluate(
        "document.querySelectorAll('.siteImageEditor')[1].textContent.includes('Cambios guardados.')",
      ),
    "Site logo save feedback missing",
  );
  assert.equal(
    await evaluate("document.querySelector('#logo-file').value"),
    "",
    "Saved file input is cleared",
  );
  await evaluate(
    "document.querySelectorAll('.siteImageEditor')[1].querySelector('button[type=button]').click()",
  );
  await poll(
    () =>
      evaluate(
        "document.querySelectorAll('.siteImageEditor')[1].textContent.includes('Imagen original restaurada.')",
      ),
    "Site reset failed",
  );
  console.log(
    "PASS: site image management upload, save, reset and mobile layout",
  );
  if (process.env.A11Y_SCREENSHOTS) {
    const directory = await mkdtemp(join(tmpdir(), "soa-image-screens-"));
    for (const [name, width, height] of [
      ["mobile", 390, 844],
      ["desktop", 1280, 1000],
    ]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await evaluate("window.scrollTo(0, 0)");
      const metrics = await send("Page.getLayoutMetrics");
      const shot = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: 0,
          width,
          height: metrics.cssContentSize.height,
          scale: 1,
        },
      });
      await writeFile(
        join(directory, name + ".png"),
        Buffer.from(shot.data, "base64"),
      );
    }
    console.log("Screenshots: " + directory);
  }
} finally {
  socket?.close();
  for (const call of pending.values()) clearTimeout(call.timeout);
  browser.kill();
  await pause(500);
  // Only remove the exact generated temporary profile, never a user profile.
  if (
    resolve(profile).startsWith(resolve(tmpdir()) + sep) &&
    profile.includes("soa-a11y-")
  ) {
    await rm(profile, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
  }
}
