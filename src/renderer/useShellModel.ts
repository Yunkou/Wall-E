import { useCallback, useEffect, useReducer } from "react";
import { createInitialModel, reduce } from "../shell/update";
import type { Model, Msg } from "../shell/model";

function shellReducer(model: Model, msg: Msg): Model {
  return reduce(model, msg);
}

/** Map model color scheme → HeroUI Uber data-theme + class. */
export function applyUberTheme(isDark: boolean) {
  const root = document.documentElement;
  root.dataset.theme = isDark ? "uber-dark" : "uber";
  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
  // Keep legacy data-scheme for any remaining CSS
  root.dataset.scheme = isDark ? "dark" : "light";
}

export function useShellModel() {
  const [model, dispatch] = useReducer(shellReducer, undefined, createInitialModel);

  useEffect(() => {
    applyUberTheme(model.colorScheme === "dark");
  }, [model.colorScheme]);

  useEffect(() => {
    const wallE = window.wallE;
    if (!wallE) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = () => {
        dispatch({
          kind: "appearance_changed",
          colorScheme: mq.matches ? "dark" : "light",
          reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          highContrast: false,
        });
      };
      apply();
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }

    let unsub: (() => void) | undefined;
    void wallE.getSystemScheme().then((scheme) => {
      dispatch({
        kind: "appearance_changed",
        colorScheme: scheme,
        reduceMotion: false,
        highContrast: false,
      });
    });
    unsub = wallE.onSystemScheme((scheme) => {
      dispatch({
        kind: "appearance_changed",
        colorScheme: scheme,
        reduceMotion: false,
        highContrast: false,
      });
    });
    return () => unsub?.();
  }, []);

  const send = useCallback((msg: Msg) => {
    dispatch(msg);
  }, []);

  return { model, send };
}
