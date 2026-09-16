import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** Returns an unused loopback TCP port for a short-lived Chrome debugging server. */
async function reservePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

/** Repeatedly fetches a Chrome debugging endpoint until it becomes available. */
async function waitForJson(url) {
  let lastError;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw lastError ?? new Error(`Chrome endpoint did not become ready: ${url}`);
}

/** Wraps one page-level Chrome DevTools Protocol websocket. */
class CdpPage {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
  }

  /** Opens the websocket and begins routing replies and events. */
  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      const listeners = this.events.get(message.method) ?? [];
      this.events.delete(message.method);
      for (const listener of listeners) listener(message.params);
    });
  }

  /** Sends one CDP command and resolves with its result. */
  call(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.socket.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  /** Resolves the next time the named CDP event arrives. */
  once(method) {
    return new Promise((resolve) => {
      const listeners = this.events.get(method) ?? [];
      listeners.push(resolve);
      this.events.set(method, listeners);
    });
  }

  /** Closes the page websocket. */
  close() {
    this.socket.close();
  }
}

/** Captures one fresh-load viewport after exactly two seconds of browser time. */
async function capture({ htmlPath, outputPath, width, height, reduced }) {
  const port = await reservePort();
  const profile = await mkdtemp(join(tmpdir(), "fat-cat-cdp-"));
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--disable-component-update",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: "ignore" });

  let page;
  try {
    await waitForJson(`http://127.0.0.1:${port}/json/version`);
    const targetResponse = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
      method: "PUT",
    });
    if (!targetResponse.ok) throw new Error(`Unable to create Chrome target: ${targetResponse.status}`);
    const target = await targetResponse.json();
    page = new CdpPage(target.webSocketDebuggerUrl);
    await page.open();
    await page.call("Page.enable");
    await page.call("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: width,
      screenHeight: height,
      positionX: 0,
      positionY: 0,
      dontSetVisibleSize: false,
    });
    await page.call("Emulation.setEmulatedMedia", {
      media: "screen",
      features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }],
    });

    const loaded = page.once("Page.loadEventFired");
    await page.call("Page.navigate", { url: pathToFileURL(htmlPath).href });
    await loaded;
    const metrics = await page.call("Runtime.evaluate", {
      expression: "({innerWidth, innerHeight, dpr: devicePixelRatio, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight})",
      returnByValue: true,
    });
    const observed = metrics.result.value;
    if (observed.innerWidth !== width || observed.innerHeight !== height || observed.dpr !== 1) {
      throw new Error(`Viewport mismatch: ${JSON.stringify(observed)} expected ${width}x${height}@1`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const screenshot = await page.call("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });
    await mkdir(new URL(".", pathToFileURL(outputPath)), { recursive: true });
    await writeFile(outputPath, Buffer.from(screenshot.data, "base64"));
    return { outputPath, reduced, ...observed };
  } finally {
    page?.close();
    chrome.kill("SIGTERM");
  }
}

const [htmlPath, outputDirectory] = process.argv.slice(2);
if (!htmlPath || !outputDirectory) {
  throw new Error("Usage: node capture-evidence.mjs <index.html> <output-directory>");
}

const cases = [
  { name: "desktop-normal.png", width: 1440, height: 900, reduced: false },
  { name: "mobile-normal.png", width: 390, height: 844, reduced: false },
  { name: "desktop-reduced.png", width: 1440, height: 900, reduced: true },
  { name: "mobile-reduced.png", width: 390, height: 844, reduced: true },
];

for (const item of cases) {
  const result = await capture({
    htmlPath,
    outputPath: join(outputDirectory, item.name),
    width: item.width,
    height: item.height,
    reduced: item.reduced,
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

