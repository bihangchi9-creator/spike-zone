import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useSpace } from './state'
// Preserve scene detail; lower only supersampling after a sustained slow window.
export default function RenderBudget(){
 const setDpr=useThree(s=>s.setDpr),low=useSpace(s=>s.low),sample=useRef({elapsed:0,frames:0,warm:0})
 useEffect(()=>{sample.current={elapsed:0,frames:0,warm:0}},[low])
 useFrame(({gl},dt)=>{
  const s=sample.current;if(document.hidden){s.elapsed=0;s.frames=0;s.warm=0;return}
  s.warm+=dt;if(low||s.warm<4)return
  s.elapsed+=Math.min(dt,.1);s.frames++
  if(s.elapsed<3)return
  if(s.elapsed/s.frames>.027&&gl.getPixelRatio()>1)setDpr(Math.max(1,gl.getPixelRatio()-.25))
  s.elapsed=0;s.frames=0
 })
 return null
}
