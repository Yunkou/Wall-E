# Wall·E 交接文档（给同事与 AI）

> 最后更新：2026-08-12  
> 分支：`main`  
> 客户端方向：**Electron + React + TypeScript**（不再要求 Native SDK / Zig）

本文是协作入口：先读这一份，再按需打开 `README.md`。

---

## 1. 项目是什么

Wall·E 目标是本地桌面个人 Agent（Chat + Work 两种模式）。  
**当前已落地**：Codex 风格三栏 mock shell（项目 / 会话 / 消息 / 变更文件 + diff），Electron 窗口 + React UI。

| 规划 | 状态 |
|------|------|
| Electron 三栏 shell UI | ✅ mock 数据可跑 |
| system / light / dark 主题 | ✅ |
| Lucide 图标（lucide-react） | ✅ 精选子集 |
| Chat（AI SDK）/ Work（Pi） | ❌ 未接 |
| 真实 agent 后端 | ❌ 未接 |

---

## 2. 方向纠偏（重要）

早期走过 **Native SDK**（`.native` markup + Zig DesignTokens）路径；因伙伴环境在较新技术栈上碰壁，**产品主路径已切到 Electron + React + TypeScript**。

- **主路径**：`npm install` → `npm run dev`（仅需 Node）
- **不要**再把 `native check` / `native dev` / Zig 当作必装前置
- 仓库中若仍有 `app.zon`、`build.zig*`、`src/**/*.native`、`src/theme/*.zig`，视为历史/遗留，**不阻塞** Electron 开发
- 纯 domain（selection / reduce）与 React 视图分离；单测只跑 domain

---

## 3. 架构一览

```
electron/
  main.ts               窗口生命周期 + system theme 信号
  preload.ts            contextBridge: wallE.getSystemScheme / onSystemScheme
src/
  core.ts               domain 对外 surface（re-export）
  shell/                纯逻辑 reduce / selectors / theme / composer
  mock/                 fixtures + selection
  renderer/
    main.tsx            React 挂载
    App.tsx             三栏 shell（HeroUI Button/Chip/TextArea…）
    useShellModel.ts    useReducer + 系统主题 → Uber data-theme
    useShellMotion.ts   GSAP 微交互（session 切换 / 选中）
    styles.css          tailwind + @heroui/styles + pro css + uber
    themes/uber.css     Uber light/dark tokens（4px radius, 单色 accent）
scripts/
  generate-mock.mjs     faker → mock/fixtures.ts
.agents/skills/         heroui / impeccable / gsap skills
```

### 数据流

1. `createInitialModel` / `reduce`（`shell/update.ts`）维护 selection、draft、主题偏好。
2. React `useShellModel` 以 `useReducer(reduce)` 驱动；UI 通过 `send(msg)` 派发。
3. 主题：`themeMode` + `systemScheme` → `colorScheme`；`applyUberTheme` 设置 `data-theme="uber" | "uber-dark"` + `class="light|dark"`。
4. Mock fixtures 为纯字符串 domain 数据；视图不 import 生成器。

### UI / 设计

- **HeroUI**：`@heroui/react` + `@heroui-pro/react`，Tailwind v4；**无** Provider。
- **Uber 主题**：自研 CSS（对齐旧 Native `uber.zig` 色板），不是 Pro 内置 brutalism/glass/mouve。
- **Impeccable**：`.agents/skills/impeccable` + `DESIGN.md` 设计上下文。
- **GSAP**：`.agents/skills/gsap-*` + 运行时 `gsap` / `@gsap/react`。

---

## 4. 本地怎么跑

前置：**Node ≥ 20**。无需 Zig / Native CLI。

```sh
pnpm install
# HeroUI Pro（需本机已 `npx heroui-pro login`，勿提交 token）
npx heroui-pro install --yes

pnpm test
pnpm dev
pnpm build && pnpm start
```

Mock 重生成：

```sh
npm run generate:mock
```

---

## 5. 迁移摘要（相对 Native-only）

### 产品 / UI

- 三栏 Agent shell 改为 React：sidebar / conversation / review
- 主题：Auto / Light / Dark（titlebar toggle）
- 图标：lucide-react 组件
- domain 字段从 `Uint8Array`（Native markup 绑定）改为 `string`

### 工程

- Electron main + preload + Vite renderer
- vitest 覆盖 selection + reduce（真实 shipped 模块）
- package scripts 不再依赖 `native dev` / `native check`
- README / 本文件指向 Electron 工作流

---

## 6. 建议的下一步

1. **接真实 Chat**：流式回复，替换 mock messages  
2. **接 Work / Pi**：会话类型分流，tool/diff 接真实工作区  
3. **持久化**：selection、主题、会话列表  
4. **打包**：electron-builder / 签名（非当前范围）

---

## 7. 协作约定

- **主路径文件**：`electron/*`、`src/renderer/*`、`src/shell/*`、`src/mock/*`、`src/core.ts`
- **生成物**：`src/mock/fixtures.ts` — 改生成器后重跑 `npm run generate:mock`
- **不要提交**：`node_modules/`、`dist/`、`dist-electron/`、`.native/`、`.zig-cache/`、`zig-out/`
- **验证最低线**：`npm test && npm run build`；UI 再 `npm run dev`
- **AI**：先读本文件 + README，再改代码；domain 保持纯函数、可单测

---

## 8. 快速文件索引

| 需求 | 去哪 |
|------|------|
| 改布局 / 交互 | `src/renderer/App.tsx`、`styles.css` |
| 改状态与消息 | `src/shell/update.ts`、`src/shell/model.ts` |
| 改列表/选中规则 | `src/mock/selection.ts` |
| 改配色 | `src/renderer/styles.css` |
| 改窗口 | `electron/main.ts` |
| Mock 数据 | `scripts/generate-mock.mjs` |

---

有问题优先对照：本文 §2 方向 → `npm test` / `npm run build` → 再查 Electron 主进程日志。
