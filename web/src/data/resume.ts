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
          'Translate user needs into AI-assisted workflows and tools',
          'Develop reusable tools for content generation and quality evaluation',
          'Work on LLM and multimodal applications, model adaptation, evaluation and human–AI collaboration',
          'Use AI coding to move projects from solution design to delivery',
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
          '把使用需求转化为 AI 辅助流程与工具，关注模型应用提效',
          '围绕内容生成与质量评估，沉淀可复用的工具与方法',
          '参与 LLM / 多模态应用的工程化实践，开展模型适配、效果评估与人机协同设计',
          '通过 AI Coding 推进项目从方案设计走向交付',
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

