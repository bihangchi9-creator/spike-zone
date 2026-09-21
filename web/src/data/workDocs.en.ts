import type { WorkDoc } from './workDocs'
export const englishDocs:Record<string,WorkDoc> = {
 'material-gen-agent':{slug:'material-gen-agent',title:'Material Generation Agent',year:'2026',role:'Independent ownership · Design to delivery',tags:['LLM','Agent','Prompt','AI productization'],body:`Turning repetitive content packaging into a reusable generation agent.

The commercial growth team regularly turns completed project materials into standardized case studies and promotional assets. The manual process requires sorting source materials, structuring a narrative, selecting templates, filling content and checking layouts. It is time-consuming and inconsistent, while unconstrained generation can distort facts and break layouts.

I independently designed and delivered the workflow as four reusable Skills: **material processing → case narrative → template filling → quality checks**, assembled through a Harness into a domain-specific Agent. The architecture separates **semantic judgment by the model** from **deterministic code** for formatting, layout and source validation. Key metrics have source tiers and human confirmation gates.

The project saved work hours and established a reusable path from business SOP to Skill, Harness and domain-specific Agent.`},
 'material-qc-agent':{slug:'material-qc-agent',title:'Material QC Agent',year:'2026',role:'Led the redesign',tags:['LLM','Multimodal','Rule engine','Risk governance'],body:`A rule-and-model judgment engine for multiple review scenarios.

Commercial growth teams submit materials under different rules. Reviewers must check fields, text, links, dates, attachments and image risks. The previous workflow covered only one scenario and was difficult to use.

Building on the initial concept, I led a redesign that converted multiple review SOPs into an extensible QC Skill, assembled into a domain-specific Agent through a Harness. An **explicit scenario index** routes requests and stops on unsupported or ambiguous scenarios. **Deterministic code** checks format, counts, dates, URLs and image metadata. Semantic and visual judgments are limited to defined rule dimensions. High-risk authorization, legal and rights questions are sent for human confirmation.

The project covers multiple review scenarios and was delivered for operational testing as a judgment-engine pilot alongside the generation engine.`},
 'audit-model-migration':{slug:'audit-model-migration',title:'Content-Audit Model Migration',year:'2026',role:'Independent delivery',tags:['Model migration','Trace attribution','Quality gates','Harness'],body:`Restoring review accuracy and automation after a base-model upgrade.

A high-volume content-review Agent saw automation and sampled accuracy fall after its foundation model was upgraded. The workflow contained many model nodes, and adding prompts without diagnosis simply moved false positives and false negatives between samples.

I independently ran dozens of **reversible iterations**, changing one sub-cause at one node per round and reverting whenever the quality gate failed. **Traces identified the responsible node**, while evaluation constrained false negatives, false positives, automation and accuracy degradation together.

Within the observed business window, high-volume automated review resumed and sampled accuracy returned to a high level. The process became a reusable review-tuning Harness.`},
 'multimodal-audit-workflow':{slug:'multimodal-audit-workflow',title:'Multimodal Content-Audit Workflow',year:'2026',role:'Independent delivery',tags:['Multimodal','LLM','Workflow architecture','Quality evaluation'],body:`An automated review workflow combining text, images and product evidence.

Low-quality content review must consider text, images and product details while reducing false positives and increasing automation. Broken image links, overlapping model responsibilities and unstable output make the workflow fragile.

I built the complete chain: **field extraction → product-evidence normalization → product profile → visual/content models → deterministic merging → a single output**. Model responsibilities are separated. Code nodes validate types, enumerations and conflicts, and catch invalid links before known-bad inputs reach a model.

At staged acceptance, the workflow maintained traceable, reversible quality control alongside high automation.`},
 'performance-qc':{slug:'performance-qc',title:'Performance Sampling AI QC',year:'2026',role:'Built independently',tags:['Agent reuse','Human in the loop','Workflow migration'],body:`Automatically resolve agreement; return disagreement to a human.

A large performance-sampling backlog required people to inspect, judge and record every item, resulting in long cycles and limited coverage.

I reused the skeleton of an existing review workflow and reorganized its judgment and output logic for quality checking. **Agreement between the model and the human judgment is processed automatically; disagreement returns to a human.** The Agent is live and continues to process work.

The project demonstrates reuse across review and QC scenarios, with deliberate allocation of risk and humans retained in the loop.`},
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
