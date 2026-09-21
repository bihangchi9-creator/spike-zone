import { WORLDS, type ExperienceWorld, type V3 } from './data'
import { positionOf } from './worldMotion'
export function dockOf(w:ExperienceWorld):V3{
 const p=positionOf(w)
 const preferred=[p[0]+w.radius*.25,p[1]+w.radius*.12,p[2]+w.radius+34] as V3
 const r=w.radius+36,candidates:V3[]=[preferred,[p[0],p[1]+r,p[2]],[p[0],p[1]-r,p[2]],[p[0]+r,p[1],p[2]],[p[0]-r,p[1],p[2]],[p[0],p[1],p[2]-r]]
 return candidates.find(c=>WORLDS.every(other=>other.id===w.id||Math.hypot(...positionOf(other).map((v,i)=>v-c[i]))>other.radius+14))||candidates[1]
}
export function labelOf(w:ExperienceWorld,_close=false):V3{
 const p=positionOf(w)
 return [p[0],p[1]+w.radius+8,p[2]]
}
