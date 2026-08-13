# Wall·E Electron 视觉测试报告

- **测试对象**:Wall·E (Desktop personal agent shell — Electron + React + TypeScript)
- **测试时间**:2026-08-12
- **测试范围**:Electron 应用 UI 视觉问题(只测 Electron,其他模块不涉及)
- **测试方式**:运行 `npm start` 启动应用,截屏捕获当前 UI 状态,逐区域视觉分析
- **修复状态**:2026-08-12 已按下列清单落地修复(见 `src/renderer/**`)

---

## 测试环境

- macOS(Darwin)
- Electron 35.7.5
- 启动命令:`npm start`(`electron .`)
- 默认窗口尺寸:1280 × 800(`electron/main.ts`)

---

## 问题清单

按严重度分级:

### 🔴 P0 — 严重(必须立刻修)

#### 1. 顶部 breadcrumb 文字严重重叠 — ✅ 已修

**位置**:窗口顶部中间偏右区域

**现象**:多段文字直接叠加渲染,可肉眼读出以下乱码:

- `the micAcAdobip` — `microchip` 和 `Adobe` 文字叠加
- `program Abthrough the blueto` — 文字叠加
- `Auto` / `Light` 主题按钮也跟文字挤到同一坐标

**根因**:HeroUI `.breadcrumbs__item` 默认 `shrink-0`,长 session 标题无法收缩,溢出叠在主题控件上。

**修复**:
- `AgentNavbar`: breadcrumbs 放进 `min-w-0 flex-1 overflow-hidden` 槽
- Item 覆盖为 `!shrink min-w-0` + 内层 `truncate`
- 主题控件 `shrink-0`;状态 chip 从 navbar 移出(保留在 conversation header)
- `styles.css` 全局覆盖 breadcrumb item 允许 shrink

#### 2. Sidebar Sessions 状态 badge 位置不一致 — ✅ 已修

**位置**:左侧 Sidebar 的 Sessions 列表

**现象**:四条 session 的 badge 位置不一致(Idle 靠右栏 / Review·Failed 跟在文字后)。

**修复**:
- `Sidebar.MenuLabel` 固定 `flex-1 min-w-0` + 原生 title tooltip
- `Sidebar.MenuChip` 固定 `ml-auto w-[4.5rem] shrink-0 justify-end`
- CSS 兜底 `[data-slot="chip"] { margin-left: auto }`

---

### 🟠 P1 — 比较明显

#### 3. 顶部 macOS 红绿黄按钮和 Wall·E 标题贴太近 — ✅ 已修

**修复**:
- Sidebar header `titlebar !pt-[36px]`,把品牌区推到 traffic lights 下方
- `trafficLightPosition` 微调为 `{ x: 14, y: 14 }`

#### 4. 标题区与上方内容互相挤压 — ✅ 已修

**修复**:
- Conversation header: 标题 `line-clamp-2 break-words`,badge 独立 `shrink-0` 右侧
- 元信息单独一行,不再和 badge 抢水平空间

#### 5. Review Panel 文件列表信息过载且被截断 — ✅ 已修

**修复**:
- 文件名显示 basename,目录单独一行(完整 path 在 `title` tooltip)
- 增删数完整显示,status chip 换到第二行 stats 区

#### 6. Diff 视图无行号,可能溢出 — ✅ 已修

**修复**:
- 统一 diff 解析 `oldNo` / `newNo` gutter
- 表格布局 + 横向 `overflow-x-auto`
- add/del/meta 行背景色

---

### 🟡 P2 — 体验/打磨

#### 7. Copy 链接位置尴尬 — ✅ 已修

**修复**:Copy 改为 lucide 图标,挂在消息 `ChatMessage.Actions` 上(hover 显隐)。

#### 8. "Review the override digital system approach" 按钮含义不明 — ✅ 已修

**说明**:这是 mock 用户消息,不是 quick action。

**修复**:用户气泡 `max-w-[85%]` + 右对齐,避免看起来像居中 suggestion chip。

#### 9. 输入框 placeholder 文字过长 — ✅ 已修

**修复**:placeholder 缩短为 `Describe a task for Wall-E…`。

#### 10. 底部状态行混在输入框区域 — ✅ 已修

**修复**:状态文案移出 `PromptInput.Footer`,独立成 compose 区底栏一行。

#### 11. Sidebar 底部 `mock data` 标签 — ✅ 已修

**修复**:footer 改为带边框的 warning badge 卡片,风格与 sidebar 统一。

#### 12. 三个面板间视觉边界弱 — ✅ 已修

**修复**:sidebar / review 使用 `border` + inset `box-shadow` 加强分隔。

#### 13. 工具调用卡片视觉分组弱 — ✅ 已修

**修复**:
- 序号 badge
- done / error 边框与底色
- 状态 chip 按 state 上色

#### 14. Session 文件名截断长度不统一 — ✅ 已修

**修复**:统一 CSS `truncate` + `title` 显示完整名(截断由布局宽度决定,不再手写字符数)。

---

## 验证

```sh
npm test
npm run typecheck
npm run build
npm start   # 目视确认 navbar / sessions / review / compose
```

---

## 截图归档

- `doc/screenshots/initial.png` — 全屏首屏(若存在)
- `doc/screenshots/current.png` — 完整 Wall·E 窗口(由用户提供)
