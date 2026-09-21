import { create } from 'zustand'
import { ownerOf, visitedIds } from './worldConfig'
import type { V3 } from './data'
interface Progress { visited:string[]; projects:string[]; shards:number[]; secret:boolean; best:number|null }
const empty:Progress={visited:[],projects:[],shards:[],secret:false,best:null}
function read():Progress {try {const p=JSON.parse(localStorage.getItem('spike-universe-v1')||'null');return p?{visited:Array.isArray(p.visited)?visitedIds(p.visited.filter((x:unknown)=>typeof x==='string')):[],projects:Array.isArray(p.projects)?p.projects.filter((x:unknown)=>typeof x==='string'):[],shards:Array.isArray(p.shards)?p.shards.filter((x:unknown)=>typeof x==='number'):[],secret:p.secret===true,best:typeof p.best==='number'&&p.best>0?p.best:null}:empty}catch{return empty}}
function save(p:Progress){try{localStorage.setItem('spike-universe-v1',JSON.stringify(p))}catch{/* Private mode still allows the current session. */}}
interface SpaceState { progress:Progress; panel:'map'|'help'|'settings'|'experience'|null; exploring:string|null; experience:string|null; project:string|null; destination:string|null; route:V3[]; speed:number; heading:number; position:V3; nearest:string|null; distance:number; race:boolean; checkpoint:number; raceTime:number; sound:boolean; low:boolean; reduced:boolean; resetFlight:number; notice:string|null; openExperience:(id:string)=>void; setPanel:(p:SpaceState['panel'])=>void; openProject:(id:string|null)=>void; navigate:(id:string|null)=>void; update:(p:Partial<SpaceState>)=>void; visit:(id:string)=>void; collect:(i:number)=>void; discover:()=>void; finish:(seconds:number)=>void; resetProgress:()=>void }
export const useSpace=create<SpaceState>((set,get)=>({progress:read(),panel:null,exploring:null,experience:null,project:null,destination:null,route:[],speed:0,heading:0,position:[0,24,-32],nearest:null,distance:0,race:false,checkpoint:0,raceTime:0,sound:false,low:false,reduced:false,resetFlight:0,notice:null,
 openExperience:experience=>set({experience,exploring:experience,panel:null,project:null,destination:null}),
 setPanel:panel=>set({panel}),
 openProject:project=>{set({project,...(project?{experience:ownerOf(project)||null,destination:null,panel:null}:{})});if(project&&!project.startsWith('pending')){const p=get().progress;if(!p.projects.includes(project)){const next={...p,projects:[...p.projects,project]};save(next);set({progress:next})}}},
 navigate:destination=>set({destination,panel:null}),update:p=>set(p),
 visit:id=>{const p=get().progress;if(!p.visited.includes(id)){const next={...p,visited:[...p.visited,id]};save(next);set({progress:next,notice:'visit:'+id})}},
 collect:i=>{const p=get().progress;if(!p.shards.includes(i)){const next={...p,shards:[...p.shards,i]};save(next);set({progress:next,notice:'shard'})}},
 discover:()=>{const p=get().progress;if(!p.secret){const next={...p,secret:true};save(next);set({progress:next,notice:'secret'})}},
 finish:seconds=>{const p=get().progress;const next={...p,best:p.best===null?seconds:Math.min(p.best,seconds)};save(next);set({progress:next,race:false,checkpoint:0,notice:'finish'})},
 resetProgress:()=>{save(empty);set({progress:{...empty},race:false,checkpoint:0,raceTime:0})},
}))
export const flightInput={keys:new Set<string>(),turn:0,thrust:0,lift:0,boost:false,brake:false,lookX:0,lookY:0}
export function clearInput(){flightInput.keys.clear();flightInput.turn=0;flightInput.thrust=0;flightInput.lift=0;flightInput.boost=false;flightInput.brake=false;flightInput.lookX=0;flightInput.lookY=0}
