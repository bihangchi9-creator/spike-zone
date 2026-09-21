import { WORLDS, type ExperienceWorld, type V3 } from './data'
import { orbitAt } from './worldConfig'
import { advanceTime } from './experienceConfig'
const positions=new Map(WORLDS.map(w=>[w.id,orbitAt(w.orbit,0)]))
export const worldClock={time:0}
export const positionOf=(w:Pick<ExperienceWorld,'id'>):V3=>positions.get(w.id)!
export function advanceWorld(dt:number,paused:boolean){
 if(paused)return
 worldClock.time=advanceTime(worldClock.time,dt,false)
 for(const w of WORLDS){const p=orbitAt(w.orbit,worldClock.time),out=positionOf(w);out[0]=p[0];out[1]=p[1];out[2]=p[2]}
}
