---
title: dsh-lark-bridge
year: 2026
role: 独立开源 · 构思到实现
tags: [AI Coding, Agent 控制平面, 插件/产品设计, 开源, 权限模型]
link: https://github.com/bihangchi9-creator/dsh-lark-bridge
---

让飞书成为 Agent 的原生前端与操作界面。

这是一个我从构思到实现的独立开源项目：把飞书桥接为 Agent 的原生前端，让飞书群消息能驱动具备项目目录、工具与持久会话的 Agent，不同群对应不同工作区。我独立完成产品判断、AI coding 驱动、实现与验收，并持续在 GitHub 更新。

设计上把**公共核心**与**内部扩展层**分离，内部能力不进公开仓库；用 owner、allowlist、fail-closed 权限模型与多档权限限制 Agent 的触达范围，并对插件故障做隔离。公共版已完成自动化测试，附中英文说明与跨平台 setup。

项目的核心判断，在于识别出「飞书可作为 Agent 原生前端」并把它落成一个独立的插件产品。
