// 作品集数据（双语）。5 大板块 → 点击展开作品详情。
// 纯数据驱动：增删板块 / 作品只改本文件，Works.jsx 仅负责渲染。
//
// 板块字段：
//   id        唯一标识（用于 framer layoutId 共享元素动画）
//   no        编号 '01'…'05'
//   title     板块标题
//   tagline   索引行右侧一句话
//   items[]   扁平作品列表：{ name, meta?, tags?, link? }
//             点击 item 弹出全屏详情，可补充可选媒体/文案字段：
//             { image?, video?, year?, desc? }（缺省时媒体用占位、简介回退 meta/标签）
//   groups[]  分组作品（与 items 二选一）：{ heading, items: string[] }
//   awards[]  奖项 chip（可选）
//   footer    底部技术/备注一行（可选）

export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading: string
  items: string[]
}

export interface WorkSection {
  id: string
  no: string
  title: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

export const WORKS: Record<'zh' | 'en', WorksLang> = {
  zh: {
    title: '作品',
    closeLabel: '返回',
    openLabel: '展开作品',
    hint: '继续下滑',
    awardsLabel: '获奖',
    visitLabel: '访问作品',
    detailPlaceholder: '你的作品介绍',
    phImageLabel: '图片 / 视频',
    phButtonLabel: '跳转按钮',
    countLabel: (n) => `${n} 件作品`,
    sections: [
      {
        id: 'bytedance',
        no: '01',
        title: '字节 · 模型运营',
        tagline: '模型应用、工作流设计与效率提升',
        items: [
          {
            name: '内容生成助手',
            meta: '内容整理与生成的 AI 辅助流程',
            tags: ['LLM', 'Agent', 'AI 产品化'],
            slug: 'material-gen-agent',
          },
          {
            name: '内容质量辅助检查',
            meta: '结合规则校验与模型能力的辅助检查',
            tags: ['多模态', '规则校验', '质量评估'],
            slug: 'material-qc-agent',
          },
          {
            name: '模型适配与评估',
            meta: '模型版本适配、问题分析与迭代评估',
            tags: ['模型适配', '问题归因', '质量评估'],
            slug: 'audit-model-migration',
          },
          {
            name: '多模态信息处理工作流',
            meta: '文本与图像信息的组织、处理与校验',
            tags: ['多模态', '链路架构', '质量评估'],
            slug: 'multimodal-audit-workflow',
          },
          {
            name: '人机协同质检',
            meta: 'AI 辅助检查与人工复核的协同设计',
            tags: ['人机协同', 'Agent 复用', '工作流设计'],
            slug: 'performance-qc',
          },
        ],
        footer: '项目经验概述 · 仅展示脱敏后的职责与方法',
      },
      {
        id: 'opensource',
        no: '02',
        title: '开源项目',
        tagline: '从构思到实现的独立 Agent 产品',
        items: [
          {
            name: 'dsh-lark-bridge',
            meta: '让飞书成为 Agent 的原生前端',
            tags: ['AI Coding', 'Agent 控制平面', '权限模型'],
            link: 'https://github.com/bihangchi9-creator/dsh-lark-bridge',
            slug: 'dsh-lark-bridge',
          },
          {
            name: 'trae-to-lark',
            meta: '飞书桥接 TRAE / Claude Code / Codex CLI',
            tags: ['飞书机器人', 'Coding Agent', 'Node.js'],
            link: 'https://github.com/bihangchi9-creator/trae-to-lark',
            slug: 'trae-to-lark',
          },
        ],
      },
      {
        id: 'intern',
        no: '03',
        title: '实习作品',
        tagline: 'AI + 硬件 / 座舱产品落地',
        items: [
          {
            name: 'AI 音乐壁纸',
            meta: '智能座舱 AI 产品 · 现代汽车',
            tags: ['智能座舱', 'AI 产品', '跨部门协作'],
            slug: 'ai-music-wallpaper',
          },
        ],
      },
    ],
  },
  en: {
    title: 'Works',
    closeLabel: 'Back',
    openLabel: 'Explore',
    hint: 'Keep scrolling',
    awardsLabel: 'Awards',
    visitLabel: 'Visit site',
    detailPlaceholder: 'Your work description',
    phImageLabel: 'Image / Video',
    phButtonLabel: 'Link button',
    countLabel: (n) => `${n} works`,
    sections: [
      {
        id: 'bytedance',
        no: '01',
        title: 'ByteDance · Model Ops',
        tagline: 'Model applications, workflow design and productivity',
        items: [
          {
            name: 'Content Generation Assistant',
            meta: 'AI-assisted content organization and generation',
            tags: ['LLM', 'Agent', 'AI Productization'],
            slug: 'material-gen-agent',
          },
          {
            name: 'Assisted Content Quality Checks',
            meta: 'Quality checks with rules and model assistance',
            tags: ['Multimodal', 'Rule-based Validation', 'Quality Evaluation'],
            slug: 'material-qc-agent',
          },
          {
            name: 'Model Adaptation and Evaluation',
            meta: 'Model adaptation, error analysis and iterative evaluation',
            tags: ['Model Adaptation', 'Error Analysis', 'Quality Evaluation'],
            slug: 'audit-model-migration',
          },
          {
            name: 'Multimodal Information Workflow',
            meta: 'Organizing, processing and validating text and images',
            tags: ['Multimodal', 'Pipeline Design', 'Quality Eval'],
            slug: 'multimodal-audit-workflow',
          },
          {
            name: 'Human–AI Quality Review',
            meta: 'Designing AI-assisted checks alongside human review',
            tags: ['Human-in-loop', 'Agent Reuse', 'Workflow Design'],
            slug: 'performance-qc',
          },
        ],
        footer: 'Selected experience · Responsibilities and methods summarized for public sharing',
      },
      {
        id: 'opensource',
        no: '02',
        title: 'Open Source',
        tagline: 'Independent Agent products, concept to shipping',
        items: [
          {
            name: 'dsh-lark-bridge',
            meta: 'Make Feishu the native front-end for Agents',
            tags: ['AI Coding', 'Agent Control Plane', 'Permission Model'],
            link: 'https://github.com/bihangchi9-creator/dsh-lark-bridge',
            slug: 'dsh-lark-bridge',
          },
          {
            name: 'trae-to-lark',
            meta: 'Bridge Feishu to TRAE / Claude Code / Codex CLI',
            tags: ['Feishu Bot', 'Coding Agent', 'Node.js'],
            link: 'https://github.com/bihangchi9-creator/trae-to-lark',
            slug: 'trae-to-lark',
          },
        ],
      },
      {
        id: 'intern',
        no: '03',
        title: 'Internship Work',
        tagline: 'AI + hardware / cockpit product',
        items: [
          {
            name: 'AI Music Wallpaper',
            meta: 'Smart-cockpit AI feature · Hyundai',
            tags: ['Smart Cockpit', 'AI Product', 'Cross-team'],
            slug: 'ai-music-wallpaper',
          },
        ],
      },
    ],
  },
}

// 板块配图（横向画廊每张卡片左侧的整高封面）。放到 public/works/covers/ 下，
// 再在此登记 { 板块id: 图片路径 }。缺图时左栏自动用大编号渐变占位。
// 目前无自有配图 → 全部走渐变编号占位（有设计感的 01/02/03）。以后有图再补。
export const SECTION_COVERS: Record<string, string> = {
  // bytedance: `${import.meta.env.BASE_URL}works/covers/bytedance.jpg`,
  // opensource: `${import.meta.env.BASE_URL}works/covers/opensource.jpg`,
  // intern: `${import.meta.env.BASE_URL}works/covers/intern.jpg`,
}

// 统计一个板块的作品数（items 或 groups 求和），用于索引行 hover 显示
export function sectionCount(section: WorkSection): number {
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((n, g) => n + g.items.length, 0)
  return 0
}
