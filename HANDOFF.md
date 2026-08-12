# Wall·E 交接文档（给同事与 AI）

> 最后更新：2026-08-12  
> 分支：`main`  
> 客户端方向：**仅 Native SDK**（不是 React / HeroUI / WebView）

本文是协作入口：先读这一份，再按需打开 `README.md` 与 `native skills get …`。

---

## 1. 项目是什么

Wall·E 目标是本地桌面个人 Agent（Chat + Work 两种模式）。  
**当前已落地**：Codex 风格三栏 mock shell（项目 / 会话 / 消息 / 变更文件 + diff），纯 Native SDK 原生窗口。

| 规划 | 状态 |
|------|------|
| Native 三栏 shell UI | ✅ mock 数据可跑 |
| Uber DesignTokens 主题 + Auto/Light/Dark | ✅ |
| Lucide 图标（`app:`） | ✅ 精选子集 |
| Chat（AI SDK）/ Work（Pi） | ❌ 未接 |
| 真实 agent 后端 | ❌ 未接 |

---

## 2. 方向纠偏（重要）

早期曾走过 **React + HeroUI** 的 Web 路径，**已废弃并清理**：

- 不要新增 `web/`、React、HeroUI、CSS 主题进产品 UI
- 不要加载 `*.css` 做壳层样式；主题是 Zig `DesignTokens`
- 图标不要用 web 组件库；用 Lucide static → `registerAppIcons` → markup `app:<name>`

权威 skill：

```sh
npx skills add vercel-labs/native   # 若未装
native skills list
native skills get core
native skills get native-ui
native skills get ts-core
```

仓库内 discovery stub：`.agents/skills/native-sdk/`（以及 `.claude/skills/native-sdk` 符号链接）。

---

## 3. 架构一览

```
app.zon                 清单：窗口 hidden_inset_tall、geist 基座 pack 名
build.zig + build.zig.zon
  └─ scripts/prepare-sdk-overlay.sh
       └─ .native/sdk-overlay/   (gitignore) 本地 SDK 补丁树
src/
  core.ts               入口：Model / Msg / update / appearanceMsg / chromeMsg / helpers
  app.native            入口视图：三栏 + import 组件
  components/*.native   纯 template 组件
  shell/                纯逻辑：update / selectors / theme / composer
  mock/                 fixtures + selection（视图不 import 生成器）
  theme/
    uber.zig            DesignTokens（色板 + 4px 圆角）
    lucide_icons.zig    Lucide 注册表（生成物，可再生成）
    ts_core_main.zig    自定义 launcher：tokens_fn + registerAppIcons
scripts/
  generate-mock.mjs     faker → mock/fixtures.ts
  sync-lucide-icons.mjs lucide-static → lucide_icons.zig + assets/icons/
  prepare-sdk-overlay.sh
```

### 数据流

1. `initialModel` / `reduce`（`shell/update.ts`）维护 selection、draft、主题偏好、chrome/appearance。
2. markup 只绑 `core.ts` 上声明的字段与 **带显式返回类型** 的 helper（否则不进 model helper / contract）。
3. 主题：TS 里 `themeMode` + `colorScheme`；真正着色由 launcher `tokens_fn` 读 `model.colorScheme` / `highContrast` / `reduceMotion` 调 `uber.designTokens`。
4. 图标：boot 时 `lucide.register()`；markup 写 `app:folder` 等。

### 为何有 SDK overlay？

TS 默认 launcher 只支持 `themePack` = `house|geist`，**不能**直接设自定义 `tokens_fn` / 方便挂 app icons。  
因此 ejected 构建把 `native_sdk` 指到 `.native/sdk-overlay`：大部分 symlink 真 SDK，覆盖：

- `src/app_runner/ts_core_main.zig`（我们的 launcher）
- `uber.zig` / `lucide_icons.zig`
- `build/app.zig` 多 stage 拷贝上述文件

`build.zig` 每次配置都会跑 `prepare-sdk-overlay.sh`。  
**不要**把 `.native/` 提交进 git（已在 `.gitignore`）。

---

## 4. 本地怎么跑

前置：Node ≥ 22.15，Zig ≥ 0.14（或随 CLI 提示），`npm i -g @native-sdk/cli`。

```sh
npm install
bash scripts/prepare-sdk-overlay.sh   # 首次或换机；平时 build 也会刷

native check
native test
native dev          # 原生窗口
native dev --core   # 逻辑环
npm test            # vitest：mock selection
```

图标增补：

```sh
# 1. 编辑 scripts/sync-lucide-icons.mjs 的 DEFAULT_ICONS
# 2. npm run sync:icons
# 3. markup 使用 app:<name>
```

Mock 重生成：

```sh
node scripts/generate-mock.mjs
```

---

## 5. 本次改动摘要（相对 origin/main 脚手架）

### 产品 / UI

- 从 counter 脚手架换成 **三栏 Agent shell**（sidebar / conversation / review）
- 组件拆到 `src/components/*.native`
- mock：`src/mock/*` + faker 生成器；selection 纯函数 + vitest
- 主题：Auto / Light / Dark（titlebar toggle）；Uber DesignTokens 真正换色
- 图标：Lucide static，markup `app:*`

### 工程

- `native eject` 式 `build.zig` / `build.zig.zon`
- SDK overlay 管线（主题 + 图标 launcher）
- 清理 HeroUI/CSS 遗留（已删 `assets/themes/uber.css`）
- README 改为 Native-only；本 `HANDOFF.md` 作协作入口

### 关键实现细节（踩坑）

| 点 | 说明 |
|----|------|
| Model helpers | 必须 `export function foo(model: Model): ExplicitType`；缺返回类型不会进 contract，markup 报 unknown field |
| 主题强制 Light/Dark | 仅改 label 不够；必须 `tokens_fn` 读 `model.colorScheme` |
| app.zon `.theme` | 只能 `house` \| `geist`；自定义色在 `tokens_fn` |
| 图标 | 内置 49 名仍可用；**走 Lucide 请用 `app:`**，并保证在 `app_icons` 表里 |
| Enum | Zig 侧枚举名不能用 `error` 等关键字；状态用 `failed` 等 |
| 文本 | 0.8.4 用 `asciiBytes`；核心子集无任意 npm |
| model-contract | 改 Model/Msg/helper 后跑 `native test` 刷新 `zig-out/model-contract.zon`，再信 `native check` 的 binding 诊断 |

---

## 6. 建议的下一步（给接手的人 / AI）

优先级可按产品节奏调整：

1. **接真实 Chat**：`Cmd` / services 层流式回复，替换 mock messages  
2. **接 Work / Pi**：会话类型分流，tool/diff 接真实工作区  
3. **持久化**：selection、主题、会话列表 → `NATIVE_SDK_APP_DATA_DIR`  
4. **主题精修**：HC 对比、控件表是否要从 geist 再贴 Uber  
5. **图标**：按 UI 需要扩 `DEFAULT_ICONS`，避免一次塞进全量 Lucide（体积 / 编译）  
6. **自动化**：`native skills get automation` 冒烟截图

---

## 7. 协作约定

- **主路径文件**：`src/core.ts`、`src/app.native`、`src/components/*`、`src/shell/*`、`src/theme/*`、`app.zon`
- **生成物**：`src/mock/fixtures.ts`、`src/theme/lucide_icons.zig`、`assets/icons/*` — 改源后重跑对应 script
- **不要提交**：`.native/`、`node_modules/`、`.zig-cache/`、`zig-out/`（artifact 可本地有）
- **验证最低线**：`native check && native test`；UI 行为再 `native dev`
- **AI**：先 `HANDOFF.md` + `native skills get core/native-ui/ts-core`，再改代码；勿回退到 React 壳

---

## 8. 快速文件索引

| 需求 | 去哪 |
|------|------|
| 改布局 / 绑字段 | `src/app.native`、`src/components/*` |
| 改状态与消息 | `src/core.ts`、`src/shell/update.ts` |
| 改列表/选中规则 | `src/mock/selection.ts` |
| 改配色 | `src/theme/uber.zig` |
| 改 launcher / tokens_fn | `src/theme/ts_core_main.zig` + 重跑 overlay |
| 加图标 | `scripts/sync-lucide-icons.mjs` → `npm run sync:icons` |
| 窗口尺寸 / titlebar | `app.zon` |

---

有问题优先对照：本文 §5 踩坑表 → `native skills get …` 教学错误码 → 再查 SDK overlay 是否刷新成功。
