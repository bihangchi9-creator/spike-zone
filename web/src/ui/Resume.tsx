import { motion } from 'framer-motion'
import { SOCIAL_ICONS } from './SocialIcons'
import { FOCUS_POINTS } from '../data/focusPoints'

// 履历数据（双语）。英文为译稿，可按需润色。
interface ResumeGroup {
  heading?: string
  logoImg?: string
  sub?: string
  link?: string
  items?: string[]
  links?: { id: string; label: string; href: string }[]
}
interface ResumeEntry {
  period: string
  place: string
  role?: string
  logo?: { src: string; alt: string }
  points?: string[]
  groups?: ResumeGroup[]
}
const RESUME: Record<'en' | 'zh', { title: string; entries: ResumeEntry[] }> = {
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
    title: 'Resume',
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

// 履历条目依次对应 glb 里的聚焦锚点（相机停靠点），顺序须与 entries 一致。
// 名单是唯一真源，见 data/focusPoints.ts（Scene.tsx 也从那里取）。
const POINT_ORDER = FOCUS_POINTS

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Group({ group }: { group: ResumeGroup }) {
  const heading = group.link ? (
    <a className="about-link" href={group.link} target="_blank" rel="noopener noreferrer">
      {group.heading}
    </a>
  ) : (
    <span>{group.heading}</span>
  )

  return (
    <motion.div className="tl-group" variants={itemV}>
      <div className="tl-group-head">
        {group.logoImg && (
          <span className="tl-group-logo">
            <img src={group.logoImg} alt={group.heading || ''} loading="lazy" />
          </span>
        )}
        {heading}
        {group.sub && <span className="tl-group-sub">{group.sub}</span>}
      </div>
      {group.items && (
        <ul className="tl-points">
          {group.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
      {group.links && (
        <div className="tl-logos">
          {group.links.map((l) => {
            const Icon = SOCIAL_ICONS[l.id as keyof typeof SOCIAL_ICONS]
            return (
              <a
                key={l.id}
                className="tl-logo"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  return (
    <motion.div
      className="tl-entry"
      data-point={POINT_ORDER[index]}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      {/* tl-body 包住文字内容（点保持在外做时间轴标记）：移动端可给它加卡片衬底，
          且它紧贴内容高度，不含 tl-entry 用于排布的大 padding。
          用普通 div（非 motion）：framer 变体经 React context 穿透它，叶子元素仍是
          tl-entry 的直接 stagger 子级，入场动画与包裹前完全一致。 */}
      <div className="tl-body">
        <motion.div className="tl-period" variants={itemV}>
          {entry.period}
        </motion.div>
        <motion.div className="tl-head" variants={itemV}>
          {entry.logo && (
            <span className="tl-logo-chip">
              <img src={entry.logo.src} alt={entry.logo.alt} loading="lazy" />
            </span>
          )}
          <h3 className="tl-place">{entry.place}</h3>
        </motion.div>
        {entry.role && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role}
          </motion.div>
        )}
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
        {entry.groups && entry.groups.map((g, i) => <Group key={i} group={g} />)}
      </div>
    </motion.div>
  )
}

export default function Resume({ lang }: { lang: 'en' | 'zh' }) {
  const data = RESUME[lang]
  return (
    <section className="resume" lang={lang}>
      <motion.h2
        className="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {data.title}
      </motion.h2>
      <div className="timeline">
        {data.entries.map((e, i) => (
          <Entry key={i} entry={e} index={i} />
        ))}
      </div>
    </section>
  )
}
