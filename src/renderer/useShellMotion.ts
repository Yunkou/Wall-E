import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Micro-interactions for the agent shell.
 * Honors prefers-reduced-motion via gsap matchMedia.
 */
export function useShellMotion(deps: {
  threadId: number;
  projectId: number;
  fileId: number;
  colorScheme: string;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Soft fade-in when switching sessions
        if (messagesRef.current) {
          gsap.fromTo(
            messagesRef.current.querySelectorAll(".shell-message"),
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.28,
              stagger: 0.04,
              ease: "power2.out",
              overwrite: "auto",
            },
          );
        }
      });
      return () => mm.revert();
    },
    { dependencies: [deps.threadId, deps.projectId], scope: shellRef },
  );

  // Selected list row pulse
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = shellRef.current;
    if (!root) return;
    const selected = root.querySelectorAll(".shell-list-item[data-selected='true']");
    if (!selected.length) return;
    gsap.fromTo(
      selected,
      { scale: 0.985 },
      { scale: 1, duration: 0.18, ease: "power2.out", overwrite: "auto" },
    );
  }, [deps.projectId, deps.threadId, deps.fileId]);

  return { shellRef, messagesRef };
}
