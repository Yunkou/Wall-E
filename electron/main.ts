import { app, BrowserWindow, nativeTheme, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.DIST = path.join(__dirname, "../dist");
// Do not write `process.env.X = process.env.X` when unset: Node stores the
// string "undefined", so loadURL("undefined") → ERR_INVALID_URL / black window.
const viteDevServerUrl = process.env.VITE_DEV_SERVER_URL;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const isMac = process.platform === "darwin";
  const isWin = process.platform === "win32";

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: "Wall·E",
    titleBarStyle: isMac ? "hiddenInset" : "default",
    // Leave room between traffic lights and the sidebar brand row.
    trafficLightPosition: { x: 14, y: 14 },
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0f1115" : "#f6f7f9",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (viteDevServerUrl) {
    void mainWindow.loadURL(viteDevServerUrl);
  } else {
    void mainWindow.loadFile(path.join(process.env.DIST!, "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function pushSystemScheme() {
  if (!mainWindow) return;
  const scheme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
  mainWindow.webContents.send("system-scheme", scheme);
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("get-system-scheme", () => {
    return nativeTheme.shouldUseDarkColors ? "dark" : "light";
  });

  nativeTheme.on("updated", pushSystemScheme);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
