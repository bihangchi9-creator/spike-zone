import { worldClock, positionOf } from './worldMotion'
import { WORLDS } from './data'
import { useSpace } from './state'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
// Opt-in local QA only; no diagnostic UI in the normal portfolio.
export default function FrameDiagnostics({mode}:{mode:string}) {
 const sample=useRef({mode,elapsed:0,frames:[] as number[],last:0,width:0,height:0,low:false})
 useFrame(({gl,size},dt)=>{
  const s=sample.current,space=useSpace.getState()
  if(s.mode!==mode||s.low!==space.low||document.hidden||s.width!==size.width||s.height!==size.height){s.low=space.low;s.mode=mode;s.elapsed=0;s.frames=[];s.last=0;s.width=size.width;s.height=size.height;return}
  s.elapsed+=dt
  if(s.elapsed<3)return
  s.frames.push(dt*1000)
  if(s.frames.length>1800)s.frames.shift()
  if(s.elapsed-s.last<1)return
  s.last=s.elapsed
  const sorted=[...s.frames].sort((a,b)=>a-b),mean=s.frames.reduce((a,b)=>a+b,0)/s.frames.length
  const out=document.getElementById('frame-diagnostics')
  if(out)out.textContent=JSON.stringify({mode,seconds:Math.round(s.elapsed-3),frames:s.frames.length,fps:Math.round(1000/mean),p95ms:Math.round(sorted[Math.floor(sorted.length*.95)]),dpr:gl.getPixelRatio(),width:size.width,height:size.height,quality:space.low?"light":"detailed",orbitTime:+worldClock.time.toFixed(2),projectPaused:!!space.project,worlds:WORLDS.map(w=>({id:w.id,position:positionOf(w).map(v=>+v.toFixed(2))})),ship:space.position.map(v=>+v.toFixed(2)),destination:space.destination,experience:space.experience})
 })
 return null
}
