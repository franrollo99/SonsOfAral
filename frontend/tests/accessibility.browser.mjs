import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";

// Run with Vite already running. All API calls are mocked; no database writes.
const baseUrl = process.env.A11Y_BASE_URL || "http://localhost:5173";
const imageViewerScreens = process.env.IMAGE_VIEWER_SCREENSHOTS
  ? await mkdtemp(join(tmpdir(), "soa-close-buttons-"))
  : null;
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

async function checkImageBackdrop(trigger, image, inner, overlay) {
  for (const target of [inner, overlay]) {
    await evaluate(`
      document.querySelector('${trigger}').focus();
      document.querySelector('${trigger}').click();
    `);
    await waitDialog();
    const closeButton = await evaluate(`(() => {
      const button = document.querySelector('.imageViewerClose');
      const bounds = button.getBoundingClientRect();
      return {
        width: bounds.width,
        height: bounds.height,
        label: button.getAttribute('aria-label'),
        icon: !!button.querySelector('svg'),
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      };
    })()`);
    assert.equal(closeButton.width, 48);
    assert.equal(closeButton.height, 48);
    assert.equal(closeButton.label, "Cerrar");
    assert.equal(closeButton.icon, true);
    if (target === inner) {
      await evaluate("document.querySelector('.imageViewerClose').blur()");
      await send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: 0,
        y: 0,
      });
      await poll(
        () =>
          evaluate(
            "getComputedStyle(document.querySelector('.imageViewerClose')).backgroundColor === 'rgb(0, 0, 0)'",
          ),
        "Image close button should have an opaque black background",
      );
      await send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: closeButton.x,
        y: closeButton.y,
      });
      await poll(
        () =>
          evaluate(`(() => {
          const style = getComputedStyle(document.querySelector('.imageViewerClose'));
          return style.backgroundColor === 'rgb(255, 255, 255)' && style.color === 'rgb(0, 0, 0)';
        })()`),
        "Hover should visibly invert the shared close button",
      );
      if (imageViewerScreens) {
        const screenshot = await send("Page.captureScreenshot", {
          format: "png",
        });
        await writeFile(
          join(imageViewerScreens, trigger.replace(/[^a-zA-Z]/g, "") + ".png"),
          Buffer.from(screenshot.data, "base64"),
        );
      }
      await send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: 0,
        y: 0,
      });
    }
    await evaluate(`document.querySelector('${image}').click()`);
    assert.equal(
      await evaluate("!!document.querySelector('[role=dialog]')"),
      true,
      "Clicking the image keeps the viewer open",
    );
    await evaluate("document.querySelector('.lightboxNavNext')?.click()");
    assert.equal(
      await evaluate("!!document.querySelector('[role=dialog]')"),
      true,
      "Gallery navigation keeps the viewer open",
    );
    await evaluate(`document.querySelector('${target}').click()`);
    await waitDialog(false);
    assert.equal(
      await evaluate(`document.activeElement.matches('${trigger}')`),
      true,
      "Clicking blank space closes the viewer and restores focus",
    );
  }
  await evaluate(`
    document.querySelector('${trigger}').focus();
    document.querySelector('${trigger}').click();
  `);
  await waitDialog();
  await evaluate("document.querySelector('.imageViewerClose').click()");
  await waitDialog(false);
  assert.equal(
    await evaluate(`document.activeElement.matches('${trigger}')`),
    true,
    "The shared X closes the viewer and restores focus",
  );
}

async function fill(selector, value) {
  await evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
}

async function checkConcertListing() {
  assert.equal(
    await evaluate("document.querySelector('.concertPage h1').textContent"),
    "Próximos conciertos",
  );
  assert.equal(
    await evaluate(`(() => {
      const title = document.querySelector('.concertPage h1');
      return title.classList.contains('visually-hidden')
        && title.getBoundingClientRect().height <= 1
        && getComputedStyle(title).display !== 'none';
    })()`),
    true,
    "Concert page title is visually hidden but remains accessible",
  );
  assert.equal(
    await evaluate(
      "document.querySelectorAll('.concertIndex, .listingHeader p').length",
    ),
    0,
    "Concert listings have no numbering or introductory taglines",
  );
  assert.equal(
    await evaluate("document.querySelector('.concertDate').textContent.trim()"),
    "1 de enero de 2099",
  );
  assert.equal(
    await evaluate(
      "document.querySelector('.concertDate').getAttribute('datetime')",
    ),
    "2099-01-01",
  );
  assert.equal(
    await evaluate("document.querySelector('.concertLocation').textContent"),
    "Santander, Cantabria",
  );
  assert.equal(
    await evaluate(`(() => {
      const date = parseFloat(getComputedStyle(document.querySelector('.concertDate')).fontSize);
      const venue = parseFloat(getComputedStyle(document.querySelector('.concertVenue h2')).fontSize);
      const location = parseFloat(getComputedStyle(document.querySelector('.concertLocation')).fontSize);
      const municipality = parseFloat(getComputedStyle(document.querySelector('.concertMunicipality')).fontSize);
      const province = parseFloat(getComputedStyle(document.querySelector('.concertProvince')).fontSize);
      return date >= venue && date >= 36 && location >= 17
        && municipality === location && province < municipality && province >= 14;
    })()`),
    true,
    "Date is prominent, municipality keeps its size and province is smaller",
  );
  assert.equal(
    await evaluate(`(() => {
      const page = getComputedStyle(document.querySelector('.concertPage'));
      const concert = getComputedStyle(document.querySelector('.concierto'));
      return parseFloat(page.paddingTop) <= 56
        && parseFloat(page.paddingBottom) <= 56
        && parseFloat(concert.paddingTop) <= 32
        && parseFloat(concert.paddingBottom) <= 32;
    })()`),
    true,
    "Concert page has compact vertical spacing around its rows",
  );
  assert.equal(
    await evaluate("document.querySelector('.descripcion').textContent"),
    "Test concert description",
  );
  assert.equal(
    await evaluate(
      "document.querySelector('.concertPosterBtn').textContent.trim()",
    ),
    "Ver cartel ↗",
  );
}

async function waitDialog(open = true) {
  await poll(
    () => evaluate(`!!document.querySelector('[role="dialog"]') === ${open}`),
    "Dialog state did not update",
  );
}

async function checkFocusTrap(backgroundSelector = ".siteHeader") {
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
    await evaluate(
      `document.querySelector(${JSON.stringify(backgroundSelector)}).inert`,
    ),
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
  const defaultSiteImages = JSON.parse(
    await readFile(resolve("src/assets/site-images.json"), "utf8"),
  );
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
    localStorage.clear();
    localStorage.setItem('token', 'test-admin');
    const image = '/images/optimized/logo-band-lg.png';
    const release = { id: 1, titulo: 'Test release', tipo: 'album', fechaLanzamiento: '2026-01-01', fechaFormateada: '1 enero 2026', duracionTotalMinutos: 1, portada: { url: image }, canciones: [{id: 1, titulo: 'Test song', duracion: 60, audio: {url: '/api/canciones/1/audio'}}] };
    const concert = { id: 1, lugar: 'Test venue', fecha: '2099-01-01', municipio: 'Santander', provincia: 'Cantabria', descripcion: 'Test concert description', cartel: { url: image } };
    const galleryPhoto = (width, height) => 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '"><rect width="100%" height="100%" fill="#222"/><rect x="8" y="8" width="' + (width - 16) + '" height="' + (height - 16) + '" fill="none" stroke="white" stroke-width="4"/><text x="30" y="60" fill="white" font-size="28">' + width + ' x ' + height + '</text></svg>');
    const gallery = { id: 1, tipo: 'banda', titulo: 'Test gallery', nombre: 'Test gallery', portada: {url: image}, imagenes: [{id:1, url:galleryPhoto(640, 360)}, {id:2, url:galleryPhoto(360, 640)}] };
    const siteImages = ${JSON.stringify(defaultSiteImages)};
    const originalFetch = window.fetch;
    window.fetch = async (input, options = {}) => {
      const url = new URL(input, location.href);
      if (!url.pathname.includes('/api/')) return originalFetch(input, options);
      if (url.pathname.endsWith('/canciones/1/audio')) return new Response(JSON.stringify({message: 'Audio no disponible'}), {status: 503});
      const homeMode = sessionStorage.getItem('home-mode');
      const homeEndpoint = url.pathname.endsWith('/lanzamientos') || url.pathname.endsWith('/conciertos');
      if (homeEndpoint && homeMode === 'loading') await new Promise(resolve => setTimeout(resolve, 600));
      if (homeEndpoint && homeMode === 'error') return new Response(JSON.stringify({message: 'Test error'}), {status: 503});
      if (homeEndpoint && homeMode === 'empty') return new Response('[]', {status: 200});
      if (url.pathname.endsWith('/conciertos') && homeMode === 'no-poster') return new Response(JSON.stringify([{...concert, cartel: null}]), {status: 200});
      if (url.pathname.endsWith('/conciertos') && homeMode === 'empty-poster') return new Response(JSON.stringify([{...concert, cartel: {}}]), {status: 200});
      if (url.pathname.endsWith('/conciertos') && homeMode === 'ticket') return new Response(JSON.stringify([{...concert, precioEntrada: 12, entradaAnticipada: true, enlaceEntradaAnticipada: 'https://example.test/entradas'}]), {status: 200});
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

  await navigate("/disenos", "main h1");
  assert.equal(
    await evaluate("document.querySelector('main h1').textContent"),
    "404",
    "The retired design laboratory is no longer accessible",
  );
  await navigate("/musica", ".lanzamiento");
  assert.equal(
    await evaluate("document.querySelector('.brandMark').textContent.trim()"),
    "",
  );
  assert.deepEqual(
    await evaluate(
      "[...document.querySelectorAll('.desktopNav .navLink')].map(link => link.textContent.trim())",
    ),
    ["Inicio", "Conciertos", "Música", "Galería"],
  );
  assert.deepEqual(
    await evaluate(
      "[...document.querySelectorAll('.mobileNavLink')].map(link => link.textContent.trim())",
    ),
    ["Inicio", "Conciertos", "Música", "Galería"],
  );
  assert.equal(
    await evaluate(
      "document.querySelector('.brandMark img').getAttribute('src').includes('logo-band-')",
    ),
    true,
  );
  assert.equal(
    await evaluate(
      "document.querySelector('.desktopNav [aria-current=page]').textContent.trim()",
    ),
    "Música",
  );
  console.log(
    "PASS: band logo without duplicate name, unnumbered navigation and active section",
  );
  await poll(
    () => evaluate("document.title === 'Música y lanzamientos | Sons of Aral'"),
    "Music metadata not updated",
  );
  await evaluate("document.querySelector('.lanzamiento').focus()");
  await key("Enter");
  await waitDialog();
  await checkFocusTrap();
  assert.equal(
    await evaluate(`(() => {
      const modal = document.querySelector('.releaseModal');
      const close = modal.querySelector('.imageViewerClose');
      const meta = modal.querySelector('.smallMeta');
      const cover = modal.querySelector('.cover');
      const icon = modal.querySelector('.trackPlayBtn svg');
      return close.getBoundingClientRect().width === 48
        && !!close.querySelector('svg')
        && getComputedStyle(close).backgroundColor === getComputedStyle(modal).backgroundColor
        && getComputedStyle(close).boxShadow === 'none'
        && parseFloat(getComputedStyle(meta).fontSize) >= 13
        && parseFloat(getComputedStyle(modal.querySelector('.sub')).fontSize) >= 13
        && meta.getBoundingClientRect().top - cover.getBoundingClientRect().bottom <= 13
        && icon.getAttribute('width') === '22'
        && icon.getAttribute('aria-hidden') === 'true';
    })()`),
    true,
    "Release modal uses the shared close control, readable compact metadata and larger playback icons",
  );
  await evaluate("document.querySelector('.trackPlayBtn').click()");
  await poll(
    () => evaluate("!!document.querySelector('.tracklist [role=alert]')"),
    "Unavailable audio should show an accessible error",
  );
  await evaluate("document.querySelector('.imageViewerClose').click()");
  await waitDialog(false);
  await key("Enter");
  await waitDialog();
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
  const albumScreens = process.env.PUBLIC_DESIGN_CHECK
    ? await mkdtemp(join(tmpdir(), "soa-album-screens-"))
    : null;
  for (const width of [320, 390, 640, 768, 1024, 1440, 1920, 2560]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await poll(
      () =>
        evaluate(
          "[...document.querySelectorAll('.galleryImage')].every(image => image.complete && image.naturalWidth > 0)",
        ),
      "Album photos should load",
    );
    assert.equal(
      await evaluate(`(() => {
        const photos = [...document.querySelectorAll('.galleryImage')];
        return document.documentElement.scrollWidth <= innerWidth
          && photos.every(image => {
            const bounds = image.getBoundingClientRect();
            const card = image.closest('button').getBoundingClientRect();
            return Math.abs(card.width - card.height) < 1
              && Math.abs(card.width - photos[0].closest('button').getBoundingClientRect().width) < 1
              && Math.abs(card.height - bounds.height - 2) < 1
              && getComputedStyle(image).objectFit === 'contain'
              && getComputedStyle(image).transform === 'none';
          });
      })()`),
      true,
      "Uniform square cards contain complete portrait and landscape photos at width " +
        width,
    );
    await evaluate("document.fonts.ready");
    assert.equal(
      await evaluate(`(() => {
        const heading = document.querySelector('.galleryDetailHeader h1');
        const original = heading.textContent;
        const titles = ['Fotos de la banda', 'Directo en el festival de verano de Sons of Aral en Cantabria', 'SONSOFARAL'.repeat(12)];
        const fits = titles.every(text => {
          heading.textContent = text;
          const probe = heading.cloneNode(true);
          Object.assign(probe.style, {position: 'fixed', visibility: 'hidden', width: 'max-content', whiteSpace: 'nowrap'});
          heading.parentElement.append(probe);
          const needed = probe.getBoundingClientRect().width;
          probe.remove();
          const lineHeight = parseFloat(getComputedStyle(heading).lineHeight);
          const bounds = heading.getBoundingClientRect();
          return heading.scrollWidth <= heading.clientWidth + 1
            && Math.abs(bounds.width - heading.parentElement.clientWidth) < 1
            && (needed <= bounds.width ? bounds.height <= lineHeight + 1 : bounds.height > lineHeight + 1);
        });
        heading.textContent = original;
        return fits && parseFloat(getComputedStyle(heading).fontSize) <= 80;
      })()`),
      true,
      "Album title is smaller, uses the full width and wraps only when needed at width " +
        width,
    );
    if (albumScreens && (width === 390 || width === 1440)) {
      await evaluate("document.fonts.ready");
      const screenshot = await send("Page.captureScreenshot", {
        format: "png",
      });
      await writeFile(
        join(albumScreens, "album-" + width + ".png"),
        Buffer.from(screenshot.data, "base64"),
      );
    }
  }
  if (albumScreens) console.log("Album screenshots: " + albumScreens);
  console.log(
    "PASS: uniform album cards with uncropped portrait and landscape photos at 8 widths",
  );
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
  });
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
  for (const width of [390, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: false,
    });
    assert.equal(
      await evaluate(`(() => {
        const previous = document.querySelector('.lightboxNavPrev').getBoundingClientRect();
        const next = document.querySelector('.lightboxNavNext').getBoundingClientRect();
        return previous.left === 0 && next.right === innerWidth
          && previous.top === 0 && next.top === 0
          && previous.height === innerHeight && next.height === innerHeight
          && previous.width >= 44 && next.width >= 44;
      })()`),
      true,
      "Gallery navigation spans the full height at the viewport edges",
    );
    for (const [x, y, expected] of [
      [width - 10, 100, "1 / 2"],
      [width - 10, 744, "2 / 2"],
      [10, 100, "1 / 2"],
      [10, 744, "2 / 2"],
    ]) {
      await send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x,
        y,
        button: "left",
        clickCount: 1,
      });
      await send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x,
        y,
        button: "left",
        clickCount: 1,
      });
      await poll(
        () =>
          evaluate(
            `document.querySelector('.lightboxCounter')?.textContent.trim() === '${expected}'`,
          ),
        "Clicking anywhere along either edge changes the photo without closing the viewer",
      );
    }
    assert.equal(
      await evaluate(`(() => {
        const close = document.querySelector('.lightboxInner .imageViewerClose');
        const bounds = close.getBoundingClientRect();
        return document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)?.closest('button') === close;
      })()`),
      true,
      "Full-height navigation does not cover the close button",
    );
    if (albumScreens) {
      await send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: width - 10,
        y: 422,
      });
      await poll(
        () =>
          evaluate(`(() => {
          const button = document.querySelector('.lightboxNavNext');
          const effect = getComputedStyle(button, '::before');
          return effect.opacity === '${width > 700 ? "1" : "0"}'
            && effect.backgroundImage.includes('linear-gradient(270deg')
            && effect.pointerEvents === 'none'
            && getComputedStyle(button).backgroundColor === 'rgba(0, 0, 0, 0)';
        })()`),
        "Gradient is available on desktop only, without changing the clickable area",
      );
      const screenshot = await send("Page.captureScreenshot", {
        format: "png",
      });
      await writeFile(
        join(albumScreens, "lightbox-" + width + ".png"),
        Buffer.from(screenshot.data, "base64"),
      );
    }
  }
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
  });
  console.log(
    "PASS: full-height gallery edge navigation and unobstructed close button on mobile and desktop",
  );
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 2,
  });
  async function touchGesture(from, to) {
    await send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: from[0], y: from[1] }],
    });
    for (let step = 1; step <= 6; step++) {
      await send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          {
            x: from[0] + ((to[0] - from[0]) * step) / 6,
            y: from[1] + ((to[1] - from[1]) * step) / 6,
          },
        ],
      });
    }
    await send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  }
  for (const [from, to, expected] of [
    [[280, 422], [110, 422], "1 / 2"],
    [[110, 422], [280, 422], "2 / 2"],
    [[195, 422], [205, 422], "2 / 2"],
    [[195, 400], [200, 530], "2 / 2"],
    [[370, 422], [370, 422], "1 / 2"],
    [[370, 422], [370, 422], "2 / 2"],
  ]) {
    await touchGesture(from, to);
    await poll(
      () =>
        evaluate(
          `document.querySelector('.lightboxCounter')?.textContent.trim() === '${expected}'`,
        ),
      "Touch swipes and arrow taps should navigate once without closing; short and vertical gestures do not navigate",
    );
  }
  await poll(
    () =>
      evaluate(
        "[...document.querySelectorAll('.lightboxNav')].every(button => getComputedStyle(button, '::before').opacity === '0' && getComputedStyle(button).boxShadow === 'none')",
      ),
    "Touch navigation should not leave a gradient or focus stripe behind",
  );
  if (albumScreens) {
    const screenshot = await send("Page.captureScreenshot", { format: "png" });
    await writeFile(
      join(albumScreens, "lightbox-touch.png"),
      Buffer.from(screenshot.data, "base64"),
    );
  }
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
  });
  console.log(
    "PASS: real touch swipes, short and vertical gestures, repeated arrow taps and no sticky mobile effects",
  );
  await key("Escape");
  await waitDialog(false);
  assert.equal(
    await evaluate("document.activeElement.matches('.galleryImageCard')"),
    true,
  );
  console.log("PASS: mobile gallery arrows, focus trap and restoration");
  await checkImageBackdrop(
    ".galleryImageCard",
    ".lightboxImage",
    ".lightboxInner",
    ".lightboxOverlay",
  );

  await navigate("/conciertos", ".concierto");
  await checkConcertListing();
  await evaluate("document.querySelector('.concertPosterBtn').focus()");
  await key("Enter");
  await waitDialog();
  await checkFocusTrap();
  assert.equal(
    await evaluate("document.querySelector('.imageViewerImage').alt"),
    "Cartel de Test venue",
  );
  await key("Escape");
  await waitDialog(false);
  assert.equal(
    await evaluate("document.activeElement.matches('.concertPosterBtn')"),
    true,
  );
  await checkImageBackdrop(
    ".concertPosterBtn",
    ".imageViewerImage",
    ".imageViewerInner",
    ".imageViewerOverlay",
  );
  for (const mode of ["no-poster", "empty-poster"]) {
    await evaluate(`sessionStorage.setItem('home-mode', '${mode}')`);
    await navigate("/conciertos", ".concierto");
    assert.equal(
      await evaluate("document.querySelectorAll('.concertPosterBtn').length"),
      0,
      "No poster button without a usable image URL",
    );
  }
  await evaluate("sessionStorage.setItem('home-mode', 'ticket')");
  await navigate("/conciertos", ".entradaBtn");
  assert.equal(
    await evaluate("document.querySelector('.entradaBtn').href"),
    "https://example.test/entradas",
  );
  assert.equal(
    await evaluate(
      "getComputedStyle(document.querySelector('.entradaBtn')).backgroundColor",
    ),
    "rgb(255, 255, 255)",
  );
  assert.equal(
    await evaluate(
      "getComputedStyle(document.querySelector('.concertPosterBtn')).backgroundColor",
    ),
    "rgba(0, 0, 0, 0)",
  );
  await evaluate("sessionStorage.removeItem('home-mode')");
  console.log(
    "PASS: concert poster button, shared viewer, keyboard, empty posters and ticket hierarchy",
  );
  console.log(
    "PASS: upcoming concerts, no intro or numbering, prominent dates and readable locations",
  );

  await navigate("/", ".homePosterBtn");
  assert.equal(
    await evaluate("document.querySelectorAll('.homeTextLink').length"),
    0,
    "Redundant links below the hero have been removed",
  );
  assert.equal(
    await evaluate(
      "document.querySelector('.homeConcertDate').textContent.trim()",
    ),
    "1 de enero de 2099",
  );
  assert.equal(
    await evaluate(
      "document.querySelector('.homeConcertDate').getAttribute('datetime')",
    ),
    "2099-01-01",
  );
  assert.equal(
    await evaluate("document.querySelector('.homeConcert h3').textContent"),
    "Test venue",
  );
  assert.equal(
    await evaluate("document.querySelector('.homeConcertCity').textContent"),
    "Santander",
  );
  assert.equal(
    await evaluate(
      "document.querySelector('.homeConcertProvince').textContent",
    ),
    "Cantabria",
  );
  assert.equal(
    await evaluate(
      "document.querySelector('.homeConcert').textContent.includes('Test concert description')",
    ),
    false,
  );
  assert.equal(
    await evaluate(`(() => {
      const size = selector => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
      return size('.homeConcertDate') > size('.homeConcert h3')
        && size('.homeConcertCity') > size('.homeConcertProvince');
    })()`),
    true,
  );
  console.log(
    "PASS: no redundant home links; date, venue, city and province have clear hierarchy",
  );
  assert.deepEqual(
    await evaluate(`[...document.querySelectorAll('.homeHero .homeActions a')].map(link => ({
      text: link.textContent.trim(),
      path: link.getAttribute('href'),
      background: getComputedStyle(link).backgroundColor,
      color: getComputedStyle(link).color,
    }))`),
    [
      {
        text: "Escuchar música ↗",
        path: "/musica",
        background: "rgb(255, 255, 255)",
        color: "rgb(0, 0, 0)",
      },
      {
        text: "Ver conciertos ↗",
        path: "/conciertos",
        background: "rgb(255, 255, 255)",
        color: "rgb(0, 0, 0)",
      },
    ],
  );
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
  await checkImageBackdrop(
    ".homePosterBtn",
    ".imageViewerImage",
    ".imageViewerInner",
    ".imageViewerOverlay",
  );

  await evaluate("document.querySelector('.homeReleaseCover').focus()");
  await key("Enter");
  await waitDialog();
  await checkFocusTrap();
  assert.equal(
    await evaluate("document.querySelector('.imageViewerImage').alt"),
    "Portada Test release",
  );
  await key("Escape");
  await waitDialog(false);
  assert.equal(
    await evaluate("document.activeElement.matches('.homeReleaseCover')"),
    true,
  );
  assert.equal(
    await evaluate(
      "document.querySelectorAll('.homePage .eyebrow, .homeCoverHint').length",
    ),
    0,
  );
  console.log("PASS: cover enlarges without overlay labels and restores focus");
  await checkImageBackdrop(
    ".homeReleaseCover",
    ".imageViewerImage",
    ".imageViewerInner",
    ".imageViewerOverlay",
  );
  console.log(
    "PASS: album, concert and gallery close on all blank areas, but not images or arrows",
  );
  console.log(
    "PASS: identical image close buttons, 48px targets, contrasting hover and X dismissal",
  );
  if (imageViewerScreens)
    console.log("Close button screenshots: " + imageViewerScreens);

  await evaluate("document.querySelector('.homeSongsBtn').focus()");
  await key("Enter");
  await waitDialog();
  await checkFocusTrap();
  assert.equal(
    await evaluate(
      "document.querySelector('.tracklist').textContent.includes('Test song')",
    ),
    true,
  );
  await key("Escape");
  await waitDialog(false);
  assert.equal(
    await evaluate("document.activeElement.matches('.homeSongsBtn')"),
    true,
  );
  console.log("PASS: home release uses shared song modal and restores focus");

  if (process.env.PUBLIC_DESIGN_CHECK) {
    const directory = await mkdtemp(join(tmpdir(), "soa-home-screens-"));
    for (const width of [320, 390, 640, 768, 1024, 1440, 1920, 2560]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 960,
        deviceScaleFactor: 1,
        mobile: false,
      });
      for (const [path, selector] of [
        ["/", ".homeReleaseCover"],
        ["/musica", ".lanzamiento"],
        ["/conciertos", ".concierto"],
        ["/galeria", ".galleryCard"],
      ]) {
        await navigate(path, selector);
        assert.equal(
          await evaluate("document.documentElement.scrollWidth <= innerWidth"),
          true,
          path + " fits width " + width,
        );
        assert.equal(
          await evaluate("document.querySelectorAll('h1').length"),
          1,
        );
        if (path !== "/") {
          assert.equal(
            await evaluate(`(() => {
              const heading = document.querySelector('h1');
              const section = heading.closest('section');
              return heading.classList.contains('visually-hidden')
                && heading.getBoundingClientRect().height <= 1
                && getComputedStyle(heading).display !== 'none'
                && parseFloat(getComputedStyle(section).paddingTop) <= 56;
            })()`),
            true,
            "Listing title is accessible without leaving a large header gap on " +
              path,
          );
        }
        if (path === "/musica") {
          assert.equal(
            await evaluate(`(() => {
              const header = document.querySelector('.musicHeader');
              const style = getComputedStyle(header);
              const filters = header.querySelector('.musicFilters').getBoundingClientRect();
              return header.querySelector('h1').textContent === 'Música'
                && !header.querySelector('.eyebrow')
                && style.borderBottomStyle === 'solid'
                && Math.abs(header.getBoundingClientRect().width - header.parentElement.clientWidth) < 1
                && header.getBoundingClientRect().bottom > filters.bottom
                && getComputedStyle(document.querySelector('.lanzamiento'), '::after').content === 'none';
            })()`),
            true,
            "Music header has a full-width divider below filters and no card arrow at width " +
              width,
          );
          if (width === 390 || width === 1440) {
            await evaluate("document.fonts.ready");
            const listingShot = await send("Page.captureScreenshot", {
              format: "png",
            });
            await writeFile(
              join(directory, "music-" + width + ".png"),
              Buffer.from(listingShot.data, "base64"),
            );
            await evaluate("document.querySelector('.lanzamiento').focus()");
            await key("Enter");
            await waitDialog();
            await checkFocusTrap();
            await poll(
              () =>
                evaluate(
                  "getComputedStyle(document.querySelector('.releaseModal')).opacity === '1'",
                ),
              "Release modal entrance animation should finish before capturing",
            );
            const modalShot = await send("Page.captureScreenshot", {
              format: "png",
            });
            await writeFile(
              join(directory, "release-modal-" + width + ".png"),
              Buffer.from(modalShot.data, "base64"),
            );
            await evaluate(
              "document.querySelector('.imageViewerClose').click()",
            );
            await waitDialog(false);
          }
        }
        if (path === "/galeria") {
          assert.equal(
            await evaluate(`(() => {
              const toolbar = document.querySelector('.galleryToolbar');
              const filters = toolbar.querySelector('.galleryFilters');
              const sort = toolbar.querySelector('.gallerySortWrap');
              const button = filters.querySelector('button');
              return !document.querySelector('.galleryPage .eyebrow')
                && parseFloat(getComputedStyle(button).fontSize) >= 12
                && button.getBoundingClientRect().height >= 44
                && parseFloat(getComputedStyle(sort.querySelector('select')).fontSize) >= 12
                && getComputedStyle(toolbar).borderBottomStyle === 'solid'
                && (innerWidth < 700 || Math.abs(sort.getBoundingClientRect().right - toolbar.getBoundingClientRect().right) < 1);
            })()`),
            true,
            "Gallery filters are left aligned and sorting is right aligned at width " +
              width,
          );
          await evaluate(
            "document.querySelectorAll('.galleryFilterBtn')[1].click()",
          );
          await poll(
            () =>
              evaluate(
                "!document.querySelector('.galleryCard') && document.querySelectorAll('.galleryFilterBtn')[1].getAttribute('aria-pressed') === 'true'",
              ),
            "Concert filter should show the empty state when no galleries match",
          );
          await evaluate(`
            document.querySelectorAll('.galleryFilterBtn')[2].click();
            const select = document.querySelector('#gallerySort');
            select.value = 'oldest';
            select.dispatchEvent(new Event('change', {bubbles: true}));
          `);
          await poll(
            () =>
              evaluate(
                "!!document.querySelector('.galleryCard') && document.querySelector('#gallerySort').value === 'oldest'",
              ),
            "Band filter and sort selection should remain usable",
          );
          await evaluate("document.querySelector('.galleryFilterBtn').click()");
          if (width === 390 || width === 1440) {
            await evaluate("document.fonts.ready");
            const screenshot = await send("Page.captureScreenshot", {
              format: "png",
            });
            await writeFile(
              join(directory, "gallery-" + width + ".png"),
              Buffer.from(screenshot.data, "base64"),
            );
          }
        }
        if (path === "/conciertos") {
          await checkConcertListing();
          if (width === 390 || width === 1440) {
            await evaluate("document.fonts.ready");
            const metrics = await send("Page.getLayoutMetrics");
            const screenshot = await send("Page.captureScreenshot", {
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
              join(directory, "concerts-" + width + ".png"),
              Buffer.from(screenshot.data, "base64"),
            );
          }
        }
      }
      await navigate("/", ".homeReleaseCover");
      assert.equal(
        await evaluate(`(() => {
          const left = selector => document.querySelector(selector).getBoundingClientRect().left;
          const hero = left('.homeHeroCopy');
          return Math.abs(hero - left('.homeSection')) < 1
            && (innerWidth <= 760 || Math.abs(hero - left('.siteNav')) < 1);
        })()`),
        true,
        "Hero copy follows the same centered container at width " + width,
      );
      assert.equal(
        await evaluate(
          "getComputedStyle(document.querySelector('h1')).fontFamily.includes('Oswald')",
        ),
        true,
      );
      assert.equal(
        await evaluate(
          "Math.round(document.querySelector('.homeHero').getBoundingClientRect().width) === document.documentElement.clientWidth",
        ),
        true,
        JSON.stringify(
          await evaluate(
            "({viewport:innerWidth,client:document.documentElement.clientWidth,hero:document.querySelector('.homeHero').getBoundingClientRect().width,body:document.body.getBoundingClientRect().width})",
          ),
        ),
      );
      await send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
      await poll(
        () => evaluate("!document.querySelector('.revealPending')"),
        "Reduced motion should reveal all home content",
      );
      assert.equal(
        await evaluate(
          "getComputedStyle(document.querySelector('.homeHeroTitle')).animationName",
        ),
        "none",
      );
      if (width === 390 || width === 1440 || width === 2560) {
        await evaluate("document.fonts.ready");
        await poll(
          () => evaluate("[...document.images].every(image => image.complete)"),
          "Home images did not load",
        );
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
          join(directory, width + ".png"),
          Buffer.from(shot.data, "base64"),
        );
      }
      await send("Emulation.setEmulatedMedia", { features: [] });
      await evaluate("document.querySelector('.homeReleaseCover').focus()");
      await key("Enter");
      await waitDialog();
      await checkFocusTrap();
      await key("Escape");
      await waitDialog(false);
      await evaluate("document.querySelector('.homeSongsBtn').focus()");
      await key("Enter");
      await waitDialog();
      await checkFocusTrap();
      await key("Escape");
      await waitDialog(false);
    }
    await evaluate("sessionStorage.setItem('home-mode', 'empty')");
    await navigate("/", ".homeEmpty");
    assert.equal(
      await evaluate(
        "document.body.textContent.includes('Nuevas fechas próximamente.')",
      ),
      true,
    );
    await evaluate("sessionStorage.setItem('home-mode', 'error')");
    await navigate("/", ".homeSection .errorMessage");
    await poll(
      () =>
        evaluate(
          "document.querySelectorAll('.homeSection [role=alert]').length === 2",
        ),
      "Independent home errors not displayed",
    );
    await evaluate("sessionStorage.setItem('home-mode', 'loading')");
    await navigate("/", ".homeSection [role=status]");
    await poll(
      () => evaluate("!!document.querySelector('.homeReleaseCover')"),
      "Loading should resolve to release",
    );
    await evaluate("sessionStorage.setItem('home-mode', 'no-poster')");
    await navigate("/", ".homeFeatureWithoutImage");
    assert.equal(
      await evaluate(
        "document.querySelector('.homeConcert').textContent.includes('Test venue') && !document.querySelector('.homePosterBtn')",
      ),
      true,
    );
    await evaluate("sessionStorage.removeItem('home-mode')");
    console.log(
      "PASS: home loading, independent errors, empty data and concert without poster",
    );
    console.log(
      "PASS: public pages at 8 widths, aligned hero container and reduced motion",
    );
    console.log("Home screenshots: " + directory);
  }

  for (const width of [390, 1280]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false,
    });
    for (const [path, title, relatedPath] of [
      ["/privacidad", "Política de Privacidad", "/aviso-legal"],
      ["/aviso-legal", "Aviso Legal", "/privacidad"],
    ]) {
      await navigate(path, ".legalBody");
      assert.equal(
        await evaluate(
          "document.querySelector('.siteFooter').textContent.includes('Noise from')",
        ),
        false,
      );
      assert.equal(
        await evaluate("document.querySelectorAll('.footerSocial a').length"),
        5,
      );
      assert.equal(
        await evaluate("document.querySelector('h1').textContent"),
        title,
      );
      assert.equal(
        await evaluate("document.documentElement.scrollWidth <= innerWidth"),
        true,
      );
      assert.equal(
        await evaluate(
          "/académic|Francisco|Fin de Grado|titular del proyecto|\\[email/i.test(document.querySelector('.legalBody').textContent)",
        ),
        false,
        "Legal copy does not identify the developer or describe a student project",
      );
      assert.equal(
        await evaluate(
          `!!document.querySelector('.legalBody a[href="${relatedPath}"]')`,
        ),
        true,
      );
      assert.equal(
        await evaluate(
          "/pendiente|antes de publicar|domicilio|Titular del sitio web|Responsable del tratamiento|Actualizaciones de esta política|Google Fonts|dirección IP|credenciales|almacenamiento local/i.test(document.querySelector('.legalPage').textContent)",
        ),
        false,
        "Public legal copy is concise, non-technical and has no placeholders",
      );
      assert.equal(
        await evaluate(
          "document.querySelector('.legalBody').textContent.trim().split(/\\s+/).length < 450",
        ),
        true,
        "Each policy stays proportionate to an informational band website",
      );
      if (path === "/privacidad") {
        assert.equal(
          await evaluate(
            "!!document.querySelector('.legalBody a[href=\"https://www.aepd.es/\"]')",
          ),
          true,
          "Privacy copy retains rights and the complaints channel",
        );
      }
    }
  }
  console.log(
    "PASS: professional legal copy, linked policies, no developer attribution, mobile and desktop",
  );

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
  assert.equal(
    await evaluate(
      "getComputedStyle(document.querySelector('.adminCreateBtn')).color",
    ),
    "rgb(0, 0, 0)",
    "Admin create button retains contrast with the neutral accent",
  );
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
    files: [resolve("public/images/optimized/logo-band-sm.png")],
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
