import { contextBridge, ipcRenderer } from "electron";

export type SystemScheme = "light" | "dark";

const api = {
  getSystemScheme: (): Promise<SystemScheme> =>
    ipcRenderer.invoke("get-system-scheme") as Promise<SystemScheme>,
  onSystemScheme: (cb: (scheme: SystemScheme) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, scheme: SystemScheme) => {
      cb(scheme);
    };
    ipcRenderer.on("system-scheme", listener);
    return () => {
      ipcRenderer.removeListener("system-scheme", listener);
    };
  },
};

contextBridge.exposeInMainWorld("wallE", api);

declare global {
  interface Window {
    wallE: typeof api;
  }
}
