import {STOPS,type Stop} from './catalog'
import {cockpitPoint} from './motorMotionV2'
export type ModelRevision='original'|'v1'|'v2'
export const refinedWorlds=['opensource','university','hyundai'] as const
export function mainWorldRevision(id:string):ModelRevision{
 if(!refinedWorlds.some(world=>world===id))return 'original'
 if(import.meta.env.DEV&&typeof location!=='undefined'){
  const selected=new URLSearchParams(location.search).get('world-version')
  if(selected==='original'||selected==='v1')return selected
 }
 return 'v2'
}
export function stopsForRevision(id:string,revision:ModelRevision):Stop[]{
 if(id!=='hyundai'||revision!=='v2')return STOPS[id]
 return STOPS.hyundai.map(stop=>({...stop,position:cockpitPoint(stop.position),camera:[9,10,13]}))
}
