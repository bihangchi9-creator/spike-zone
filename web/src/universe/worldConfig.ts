// Single catalog for identity, ownership, orbit, appearance and atlas hierarchy.
export type V3 = [number,number,number]
export type Orbit = {radius:number;period:number;phase:number;inclination:number}
export type WorldConfig = {id:string;name:[string,string];resumeIndex:number;description:[string,string];radius:number;color:string;accent:string;model:'designed'|'hyundai';priority:number;spin:number;orbit:Orbit;slugs:string[]}
export const SYSTEM={center:[0,24,-600] as V3,boundary:980,clearance:24,spawn:[0,24,-32] as V3}
export const WORLD_CONFIG:WorldConfig[]=[
 {id:'university',name:['大连理工','Dalian University of Technology'],resumeIndex:0,description:['自动化学习、数字人项目、篮球赛与校史话剧的校园记忆。','Automation studies, a digital-human project, basketball and university theater.'],radius:54,color:'#27679b',accent:'#8cb7de',model:'designed',priority:0,spin:.014,orbit:{radius:140,period:1500,phase:-.7,inclination:.1},slugs:['dut-digital-human','dut-basketball','dut-theater']},
 {id:'bytedance',name:['字节跳动','ByteDance'],resumeIndex:1,description:['把业务 SOP 变成可复用的 AI 能力。内容生成、内容判断与模型质量治理。','Turning business SOPs into reusable AI capabilities: content generation, judgment and model quality.'],radius:52,color:'#347acf',accent:'#64c9c3',model:'designed',priority:0,spin:.017,orbit:{radius:270,period:2300,phase:.45,inclination:-.05},slugs:['material-gen-agent','material-qc-agent','audit-model-migration','multimodal-audit-workflow','performance-qc']},
 {id:'opensource',name:['开源探索','Open source'],resumeIndex:4,description:['从独立构思到开源实现，持续生长的产品与工具。','Independent ideas become open-source products and tools, with room to keep growing.'],radius:50,color:'#3e8268',accent:'#a3d7b0',model:'designed',priority:1,spin:.012,orbit:{radius:400,period:3500,phase:Math.PI,inclination:-.26},slugs:['dsh-lark-bridge','trae-to-lark']},
 {id:'hyundai',name:['现代汽车','Hyundai'],resumeIndex:3,description:['探索音乐、动态视觉与智能座舱之间的联系。','Exploring music, moving images and the smart cockpit experience.'],radius:33.5,color:'#002C5F',accent:'#ffffff',model:'hyundai',priority:2,spin:.004,orbit:{radius:510,period:4800,phase:-1.78,inclination:.08},slugs:['ai-music-wallpaper']},
 {id:'chongzhen',name:['崇振时代','Chongzhen Times'],resumeIndex:2,description:['多 Agent 内容产品与 AI 辅助设计工作流。项目详情待补充。','Multi-agent content products and AI-assisted design workflows. Project details are to be added.'],radius:38,color:'#b96b38',accent:'#edc090',model:'designed',priority:2,spin:.013,orbit:{radius:630,period:6000,phase:1.90,inclination:.1},slugs:['pending-studio']},
]
export function orbitAt(orbit:Orbit,time:number):V3{
 const a=orbit.phase+time*Math.PI*2/orbit.period,r=orbit.radius
 return [SYSTEM.center[0]+r*Math.sin(a),SYSTEM.center[1]+r*Math.cos(a)*Math.sin(orbit.inclination),SYSTEM.center[2]+r*Math.cos(a)*Math.cos(orbit.inclination)]
}
// Fixed oblique orthographic mapping, shared by bodies, orbits, ship and route vertices.
export function atlasPoint(p:readonly number[]):[number,number]{return [500+(p[0]-SYSTEM.center[0])*.58,310+(p[2]-SYSTEM.center[2])*.4-(p[1]-SYSTEM.center[1])*.28]}
export const ownerOf=(slug:string)=>WORLD_CONFIG.find(w=>w.slugs.includes(slug))?.id
export const realProjectIds=WORLD_CONFIG.flatMap(w=>w.slugs).filter(id=>!id.startsWith('pending'))
export const visitedIds=(ids:string[])=>[...new Set(ids.map(id=>ownerOf(id)||id))]
