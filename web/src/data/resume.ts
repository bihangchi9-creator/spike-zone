// Shared career content for the timeline and star systems.
export interface ResumeGroup {
  heading?: string
  logoImg?: string
  sub?: string
  link?: string
  items?: string[]
  links?: { id: string; label: string; href: string }[]
}
export interface ResumeEntry {
  period: string
  place: string
  role?: string
  logo?: { src: string; alt: string }
  points?: string[]
  groups?: ResumeGroup[]
}
export const RESUME: Record<'en' | 'zh', { title: string; entries: ResumeEntry[] }> = {
  en: {
    title: 'Resume',
    entries: [
      {
        period: '2022 – 2026',
        place: 'Dalian University of Technology',
        role: 'B.S. in Automation',
      },
      {
        period: '2026.03 – Now',
        place: 'ByteDance',
        role: 'Model Operations',
        points: [
          'Turn business needs into executable flows, tools and agentic workflows — focused on content generation & judgment',
          'Distilled a general path: business SOP → Skill → Harness → vertical Agent',
          'Deep work on LLM / multimodal Agent engineering & quality governance: model migration, Trace attribution, quality gates, human-in-loop',
          'Drive complex business projects from design to delivery via AI coding',
        ],
      },
      {
        period: '2025.08 – 2026.01',
        place: 'Dalian Chongzhen Times Intelligent Tech',
        role: 'AI Product Manager Intern',
        points: [
          'Shipped a multi-AI-Agent content product and an AI-assisted design workflow 0→1',
          'Explored Cursor / Claude Code to workflow-ize design & content production, boosting team efficiency',
        ],
      },
      {
        period: '2025.06 – 2025.08',
        place: 'Hyundai Motor R&D Center (China)',
        role: 'Smart Cockpit Product Manager Intern',
        points: [
          'Designed the “AI Music Wallpaper” feature, owning product planning and logic end-to-end',
          'Drove cross-team collaboration to push the plan into proof-of-concept',
        ],
      },
      {
        period: 'Now',
        place: 'Open Source · GitHub',
        groups: [
          {
            heading: '@bihangchi9-creator',
            sub: 'dsh-lark-bridge · trae-to-lark',
            link: 'https://github.com/bihangchi9-creator',
          },
        ],
      },
    ],
  },
  zh: {
    title: '经历',
    entries: [
      {
        period: '2022 – 2026',
        place: '大连理工大学',
        role: '自动化 · 本科',
      },
      {
        period: '2026.03 – 至今',
        place: '字节跳动',
        role: '模型运营',
        points: [
          '把业务需求转化为可执行的流程、工具与智能工作流，聚焦内容生成与内容判断两大场景',
          '沉淀「业务 SOP → Skill → Harness → 垂类 Agent」的通用产品化路径',
          '深度参与 LLM / 多模态 Agent 的工程化与质量治理：模型迁移调优、Trace 归因、质量门禁、人在回路',
          '以 AI Coding 驱动复杂业务项目从方案设计走向交付',
        ],
      },
      {
        period: '2025.08 – 2026.01',
        place: '大连崇振时代智能科技',
        role: 'AI 产品经理实习生',
        points: [
          '从 0 到 1 落地多 AI Agent 内容产品与 AI 辅助设计工作流，主导需求拆解、方案设计与团队落地',
          '主动探索 Cursor / Claude Code 等 AI 工具，将设计与内容制作流程工作流化，显著提升团队效率',
        ],
      },
      {
        period: '2025.06 – 2025.08',
        place: '现代汽车研发中心（中国）',
        role: '智能座舱产品经理实习生',
        points: [
          '参与智能座舱「AI 音乐壁纸」功能设计，独立完成产品规划与逻辑闭环',
          '推动跨部门协作，将方案推进到概念验证阶段',
        ],
      },
      {
        period: '至今',
        place: '开源 · GitHub',
        groups: [
          {
            heading: '@bihangchi9-creator',
            sub: 'dsh-lark-bridge · trae-to-lark',
            link: 'https://github.com/bihangchi9-creator',
          },
        ],
      },
    ],
  },
}

