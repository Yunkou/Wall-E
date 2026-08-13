/// <reference types="vite/client" />

type SystemScheme = "light" | "dark";

interface WallEApi {
  getSystemScheme: () => Promise<SystemScheme>;
  onSystemScheme: (cb: (scheme: SystemScheme) => void) => () => void;
}

interface Window {
  wallE?: WallEApi;
}
