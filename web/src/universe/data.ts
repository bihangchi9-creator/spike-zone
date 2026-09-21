import { CAMPUS_STORIES } from './worlds/campusStories'
import { RESUME } from '../data/resume'
import { WORKS, type WorkListItem } from '../data/works'
import { WORLD_CONFIG, type WorldConfig } from './worldConfig'
export type { V3 } from './worldConfig'
import type { V3 } from './worldConfig'
export type Lang='zh'|'en'
export type ExperienceWorld=WorldConfig&{period:string;periodZh:string;role:[string,string]}
export const WORLDS:ExperienceWorld[]=WORLD_CONFIG.map(w=>{
 const zh=RESUME.zh.entries[w.resumeIndex],en=RESUME.en.entries[w.resumeIndex]
 return {...w,period:en.period,periodZh:zh.period,role:[zh.role||'',en.role||'']}
})
export const worldFor=(id:string)=>WORLDS.find(w=>w.id===id)
export const projectWorld=(id:string)=>WORLDS.find(w=>w.slugs.includes(id))
export const periodFor=(w:ExperienceWorld,lang:Lang)=>lang==='zh'?w.periodZh:w.period
export const pick=(pair:[string,string],lang:Lang)=>pair[lang==='zh'?0:1]
export function workFor(id:string,lang:Lang):WorkListItem{
 if(CAMPUS_STORIES[id])return {slug:id,name:pick(CAMPUS_STORIES[id].name,lang),meta:lang==='zh'?'校园经历':'Campus experience'}
 return WORKS[lang].sections.flatMap(s=>s.items||[]).find(w=>w.slug===id)||{slug:id,name:lang==='zh'?'项目资料待补充':'Project details to be added',meta:lang==='zh'?'尚未提供项目资料，不代表新增成果':'No project details supplied; no additional achievement is claimed'}
}
export const RACE:V3[] = [[0,24,-52],[0,24,-77],[-8,27,-100],[-22,31,-117],[-44,35,-112],[-56,29,-89],[-35,24,-65],[0,24,-52]]
export const SHARDS:V3[] = [[8,24,-42],[-12,28,-65],[-62,34,-90],[78,49,-182],[-156,70,-237],[149,-12,-360],[-50,100,-425]]
export const SECRET:V3 = [35,80,-310]
export function seeded(seed:number){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
