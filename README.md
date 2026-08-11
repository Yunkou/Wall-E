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
| **Chat** | 对话、问答、日常协作 | [Vercel AI SDK](https://sdk.vercel.ai/) |
| **Work** | 写代码、跑命令、改仓库 | [Pi](https://pi.dev/) |

Chat 负责轻量交互；Work 把任务交给 [Pi coding agent](https://pi.dev/)，由它在本地环境里真正执行。

## 技术栈

| 层 | 选型 |
|----|------|
| 客户端 | [Native SDK](https://native-sdk.dev/)（原生桌面窗口，非 WebView） |
| 运行时 | [Bun](https://bun.sh/) |
| UI | [HeroUI Pro](https://heroui.pro/) |
| Chat | [AI SDK](https://sdk.vercel.ai/) |
| Work | [Pi](https://pi.dev/) |

## 状态

仓库刚起步，文档与脚手架会陆续补上。

## License

待定。
