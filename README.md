# Wall·E

<p align="center">
  <img src="assets/logo.jpg" alt="Wall·E" width="280" />
</p>

<p align="center">
  从零开始的桌面个人 Agent：陪你聊天，也帮你干活。
</p>

## 这是什么

Wall·E 是一个本地桌面个人助手。两种模式：

| 模式 | 做什么 | 技术 |
|------|--------|------|
| **Chat** | 对话、问答、日常协作；消息可能含 Markdown / 图表 | [AI SDK](https://sdk.vercel.ai/) + [Beautiful Mermaid](https://agents.craft.do/mermaid) |
| **Work** | 写代码、跑命令、改仓库 | [Pi](https://pi.dev/) |

Chat 负责轻量交互；Work 把任务交给 [Pi coding agent](https://pi.dev/)，由它在本地环境里真正执行。

## 技术栈

| 层 | 选型 |
|----|------|
| 客户端 | [Native SDK](https://native-sdk.dev/)（原生桌面窗口，非 WebView） |
| 运行时 | [Bun](https://bun.sh/) |
| UI | [HeroUI Pro](https://heroui.pro/) |
| Icons | [LobeHub Icons](https://icons.lobehub.com/)（模型 / 品牌 SVG，按需） |
| Chat | [AI SDK](https://sdk.vercel.ai/) |
| Markdown / 图表 | [Beautiful Mermaid](https://agents.craft.do/mermaid)（Chat 内 Mermaid 渲染，按需） |
| Work | [Pi](https://pi.dev/) |

## Agent Skills

开发时给 coding agent 用，按职责归类。HeroUI 相关见 [Agent Skills](https://heroui.pro/docs/react/getting-started/agent-skills)。

| 类别 | Skill | 作用 |
|------|-------|------|
| **组件选型** | [`heroui-react-pro`](https://heroui.pro/docs/react/getting-started/agent-skills) | 按场景选对 `@heroui-pro/react` 组件，遵循 v3 用法 |
| **组件美感** | [`heroui-pro-design-taste`](https://heroui.pro/docs/react/getting-started/agent-skills) | 间距、字体、色彩、卡片与表单等设计原则，提升观感 |
| **界面设计** | [Impeccable](https://impeccable.style/) | 辅助客户端整体视觉，去 AI 默认审美 |

## 状态

仓库刚起步，文档与脚手架会陆续补上。

## License

待定。
