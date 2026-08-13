# Wall·E design context

## Product
Desktop personal agent shell (Electron + React + TypeScript). Codex-style three-pane layout: sessions · conversation/compose · review/diff. Mock data only; Chat/Work backends not connected yet.

## Aesthetic
**Uber-inspired monochrome.** Near-black / porcelain accents, grey surfaces, 4px radius, dense information density without clutter. Prefer restraint over decoration.

## Platform
Electron desktop (macOS titlebar inset). Primary UI in React with HeroUI (`@heroui/react` + `@heroui-pro/react`) and the custom **Uber** theme (`src/renderer/themes/uber.css`, `data-theme="uber" | "uber-dark"`).

## Motion
GSAP micro-interactions for session switch fades and selection pulses. Respect `prefers-reduced-motion`.

## Anti-patterns
- No purple gradients, glassmorphism, or AI-slop card grids
- No oversized rounded corners (stay near 4px ladder)
- No blue default “SaaS” primary — accent is black (light) / porcelain (dark)
- Don’t introduce a second design system alongside HeroUI tokens

## Commands
Use `/impeccable` for critique, polish, and pre-ship checks after UI changes.
