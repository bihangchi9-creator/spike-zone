---
title: trae-to-lark
year: 2026
role: 独立开源
tags: [飞书机器人, Coding Agent, Node.js, 开源]
link: https://github.com/bihangchi9-creator/trae-to-lark
---

一个轻量级机器人，把飞书 / Lark 消息连接到本地的 TRAE CLI、Claude Code 或 Codex CLI —— 让你直接在飞书聊天里驱动本地编码 Agent。

核心能力：

- **流式卡片回复**：实时更新，并以 COT 过程消息展示 Agent 的进度与工具调用
- **会话连续性**：每个聊天 / 话题 / 文档评论线程都有独立会话
- **多工作区管理**：`/cd` 切换项目，`/ws` 保存与复用项目目录
- **按聊天设模型**：`/model` 独立设置；支持消息队列、批处理与 `/stop` 中断
- **图片与文件传输**：机器人下载到本地供 Agent 使用
- **交互式卡片**：`/help`、`/ws list`、`/status` 等

技术栈：Node.js (>= 20.12)，把 TRAE CLI（`traex`）作为一流 Agent，与 Claude Code、Codex 并列，复用相同的会话 / 事件协议。项目为开发者提供了一座桥梁：通过飞书聊天界面就能与本地编码 Agent 协作。
