import type { WorkDoc } from './workDocs'
export const englishDocs:Record<string,WorkDoc> = {
 'material-gen-agent':{slug:'material-gen-agent',title:'Content Generation Assistant',year:'2026',role:'Independent ownership · Design to delivery',tags:['LLM','Agent','Prompt','AI productization'],body:`Turning repetitive content organization and writing into reusable AI-assisted workflows.

I independently owned requirements analysis, solution design and implementation. I combined prompts, workflow orchestration and programmatic validation to make model output better suited to user needs.

This work gave me practical experience delivering generative AI applications and sharpened my understanding of content quality, maintainability and human review.`},
 'material-qc-agent':{slug:'material-qc-agent',title:'Assisted Content Quality Checks',year:'2026',role:'Led the redesign',tags:['LLM','Multimodal','Rule-based validation','Quality evaluation'],body:`Combining rule-based validation and model capabilities to assist content quality checks.

Building on an existing solution, I led a redesign, clarified different user needs, separated programmatic checks from model judgment, and improved result feedback and human review.

This experience developed my ability to turn scattered requirements into extensible tools and to evaluate where model capabilities are useful.`},
 'audit-model-migration':{slug:'audit-model-migration',title:'Model Adaptation and Evaluation',year:'2026',role:'Independent delivery',tags:['Model adaptation','Prompt tuning','Error analysis','Quality evaluation'],body:`Adapting applications and evaluating quality as model versions change.

I independently handled problem analysis and iterative tuning. I compared samples, examined model calls and adjusted prompts to assess application behavior, then documented reusable evaluation methods.

This work reinforced the value of verifiable changes and matching model capabilities to practical needs.`},
 'multimodal-audit-workflow':{slug:'multimodal-audit-workflow',title:'Multimodal Information Workflow',year:'2026',role:'Independent delivery',tags:['Multimodal','LLM','Workflow design','Quality evaluation'],body:`Organizing text and images into a structured model workflow.

I independently designed and implemented the workflow, clarified responsibilities across inputs, model processing and results, and used programmatic validation to handle invalid inputs and output-format issues.

This experience developed my multimodal engineering skills and strengthened my focus on workflow reliability and traceable results.`},
 'performance-qc':{slug:'performance-qc',title:'Human–AI Quality Review',year:'2026',role:'Built independently',tags:['Agent reuse','Human in the loop','Workflow design'],body:`Exploring how AI-assisted checks can work alongside human review.

I reused existing workflow capabilities, reorganized tasks and result feedback for new quality-checking needs, and independently built an assistant that retained human participation and review.

This work demonstrates my experience adapting tools to new contexts and thinking through the division of work between automation and human judgment.`},
 'dsh-lark-bridge':{slug:'dsh-lark-bridge',title:'dsh-lark-bridge',year:'2026',role:'Independent open source · Concept to implementation',tags:['AI coding','Agent control plane','Product design','Permissions'],link:'https://github.com/bihangchi9-creator/dsh-lark-bridge',body:`Making Feishu a native front end and operating interface for Agents.

I independently conceived and built this open-source project. Feishu group messages drive Agents with project directories, tools and persistent sessions, with different groups mapped to different workspaces. I owned the product decisions, AI-coding-driven implementation and acceptance, and continue to update the project on GitHub.

The design separates the **public core** from **internal extensions**. An owner, allowlist and fail-closed permission model limits Agent access, while plugin failures are isolated. The public version has automated tests, bilingual documentation and cross-platform setup.

The central product decision was to identify Feishu as a native Agent interface and turn that idea into an independent plugin product.`},
 'trae-to-lark':{slug:'trae-to-lark',title:'trae-to-lark',year:'2026',role:'Independent open source',tags:['Feishu bot','Coding Agent','Node.js','Open source'],link:'https://github.com/bihangchi9-creator/trae-to-lark',body:`A lightweight bot that connects Feishu / Lark messages to local TRAE CLI, Claude Code or Codex CLI.

- **Streaming cards:** continuously updated replies with progress and tool-call messages.
- **Session continuity:** separate sessions for each chat, topic or document-comment thread.
- **Multiple workspaces:** switch with /cd, save and reuse with /ws.
- **Per-chat models:** independent /model settings, queues, batching and /stop.
- **Images and files:** download attachments for the local Agent.
- **Interactive cards:** help, workspace lists and status.

Built on Node.js, the project treats TRAE CLI as a first-class Agent alongside Claude Code and Codex, sharing the same session and event protocol. It allows developers to collaborate with local coding Agents through a chat interface.`},
 'ai-music-wallpaper':{slug:'ai-music-wallpaper',title:'AI Music Wallpaper',year:'2025',role:'Smart cockpit product internship · Hyundai',tags:['Smart cockpit','AI product','Cross-team collaboration','Proof of concept'],body:`Exploring music and dynamic visuals in an intelligent cockpit.

I helped design an AI music wallpaper feature, participated in needs discovery and product design, and independently completed the initial product plan, key logic and functional loop. Working across teams, I helped resolve technical blockers such as API latency and move the proposal into proof of concept.

This experience developed my understanding of delivering AI products in hardware and cockpit contexts.`},
}
