import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type {RenderDprOwner} from './renderDpr'
// Preserve scene detail; lower only supersampling after a sustained slow window.
export default function RenderBudget({owner}:{owner:RenderDprOwner}){
 const sample=useRef({elapsed:0,frames:0,warm:0,key:''})
 useFrame(({size},dt)=>{
  const s=sample.current,state=owner.getSnapshot(),key=`${state.epoch}:${size.width}:${size.height}`
  if(s.key!==key){s.elapsed=0;s.frames=0;s.warm=0;s.key=key}
  if(owner.fixed)return
  if(document.hidden){s.elapsed=0;s.frames=0;s.warm=0;return}
  s.warm+=dt;if(state.low||s.warm<4)return
  s.elapsed+=Math.min(dt,.1);s.frames++
  if(s.elapsed<3)return
  if(s.elapsed/s.frames>.027&&state.dpr>1)owner.request(state.dpr-.25,'adaptive',{meanSeconds:s.elapsed/s.frames,frames:s.frames})
  s.elapsed=0;s.frames=0
 })
 return null
}
