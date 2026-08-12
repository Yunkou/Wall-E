# Wall·E

<p align="center">
  <img src="assets/logo.jpg" alt="Wall·E" width="280" />
</p>

<p align="center">
  从零开始的桌面个人 Agent：陪你聊天，也帮你干活。
</p>

> **协作入口**：接手开发或给 AI 续作请先读 [HANDOFF.md](./HANDOFF.md)（架构、overlay、踩坑、下一步）。

## 这是什么

Wall·E 是一个 **Native SDK** 本地桌面个人助手。两种模式：

| 模式 | 做什么 | 技术（规划） |
|------|--------|----------------|
| **Chat** | 对话、问答、日常协作；消息可能含 Markdown / 图表 | [AI SDK](https://sdk.vercel.ai/) |
| **Work** | 写代码、跑命令、改仓库 | [Pi](https://pi.dev/) |

当前仓库已落地 **Codex 风格多栏 Agent shell**（mock 数据）；Chat / Work 后端尚未接入。

## 技术栈

| 层 | 选型 |
|----|------|
| 客户端 | [Native SDK](https://native-sdk.dev/)（原生窗口，无 WebView / 无 JS 运行时） |
| 逻辑 | TypeScript app core（`src/core.ts` → 编译为原生） |
| UI | Native markup（`.native`）+ `src/components/` |
| 主题 | `src/theme/uber.zig`（DesignTokens + `tokens_fn`） |
| 图标 | [Lucide Static](https://lucide.dev/guide/static/) → `app:<name>` |
| Mock | `@faker-js/faker` 仅用于生成 `src/mock/fixtures.ts` |

## 目录结构

```
.
├── app.zon                    # 清单：窗口、权限、包名
├── build.zig / build.zig.zon  # ejected 构建（Uber + Lucide launcher）
├── package.json               # 编辑器 / mock / 图标脚本（CLI 不依赖它）
├── scripts/
│   ├── generate-mock.mjs      # faker → fixtures
│   ├── sync-lucide-icons.mjs  # lucide-static → registry
│   └── prepare-sdk-overlay.sh # 本地 SDK overlay
├── src/
│   ├── app.native             # 入口视图
│   ├── core.ts                # Model / Msg / update
│   ├── components/            # markup 组件
│   ├── shell/                 # 纯逻辑（select / theme / update）
│   ├── mock/                  # fixtures + selection
│   └── theme/
│       ├── uber.zig           # DesignTokens
│       ├── lucide_icons.zig   # Lucide 注册表（生成）
│       └── ts_core_main.zig   # launcher：tokens_fn + icons
└── assets/
    ├── icon.png
    ├── logo.jpg
    └── icons/                 # 同步后的 Lucide SVG 对照
```

## 开发循环

先决条件：Node.js ≥ 22.15，Zig ≥ 0.14（或由 `native` CLI 提示安装）。

```sh
npm install -g @native-sdk/cli
npm install

native check        # core subset + markup + app.zon
native dev --core   # 逻辑环（JSON 派发 Msg）
native dev          # Debug 原生窗口
native build        # Release → zig-out/bin/wall-e
native test
npm test            # mock selection 单测
```

### 图标

```sh
npm run sync:icons   # 按 scripts/sync-lucide-icons.mjs 列表生成注册表
```

Markup：`app:folder`、`icon="app:send"`（见 [Lucide icons](https://lucide.dev/icons/)）。

### Mock 数据

```sh
node scripts/generate-mock.mjs
```

## Agent Skills

```sh
npx skills add vercel-labs/native   # 已装则跳过
native skills list
native skills get core
native skills get native-ui
native skills get ts-core
```

## License

待定。
