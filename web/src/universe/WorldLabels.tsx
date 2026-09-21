import { useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'
import { WORLDS, pick, periodFor, type Lang } from './data'
import { useSpace } from './state'
import { positionOf } from './worldMotion'
import { labelOf } from './worldAnchors'
import { segmentTouchesSphere } from './flightMath'

export default function WorldLabels({lang}:{lang:Lang}){
 const anchor=useRef<T.Group>(null),root=useRef<HTMLDivElement>(null)
 const direction=useRef(new T.Vector3()),point=useRef(new T.Vector3())
 useFrame(({camera,size})=>{
  camera.getWorldDirection(direction.current);anchor.current?.position.copy(camera.position).add(direction.current)
  if(!root.current)return
  const state=useSpace.getState(),nodes=root.current.querySelectorAll<HTMLButtonElement>('button')
  nodes.forEach(n=>{n.style.visibility='hidden';n.style.pointerEvents='none';n.tabIndex=-1})
  if(state.panel||state.project||state.exploring)return
  const mobile=size.width<700,placed:{x:number;y:number}[]=[],width=mobile?180:190,height=64
  const sorted=[...WORLDS].sort((a,b)=>a.priority-b.priority)
  for(const w of sorted){
   if(mobile&&state.nearest===w.id&&state.distance<45&&!state.race)continue
   const distance=camera.position.distanceTo(point.current.set(...positionOf(w)))
   const close=distance<w.radius+180
   const worldPoint=labelOf(w,close)
   if(!close)worldPoint[1]=positionOf(w)[1]-w.radius-12
   if(WORLDS.some(other=>other.id!==w.id&&segmentTouchesSphere(camera.position.toArray() as [number,number,number],worldPoint,positionOf(other),other.radius)))continue
   point.current.set(...worldPoint).project(camera)
   if(point.current.z<0||point.current.z>1)continue
   const x=(point.current.x+1)*size.width/2,y=(1-point.current.y)*size.height/2
   if(x<18||x>size.width-18)continue
   const lx=T.MathUtils.clamp(x,width/2+14,size.width-width/2-14)
   const ly=[y,y+68,y-68].find(cy=>cy>190&&cy<size.height-(mobile?245:115)&&!(!mobile&&lx<300&&cy<330)&&!(!mobile&&lx>size.width-255&&cy<270)&&!placed.some(p=>Math.abs(p.x-lx)<width+8&&Math.abs(p.y-cy)<height+8))
   if(ly===undefined)continue
   if(mobile&&placed.length>=1)continue
   const node=root.current.querySelector<HTMLButtonElement>(`[data-world="${w.id}"]`)!
   node.style.left=lx+'px';node.style.top=ly+'px';node.style.visibility='visible';node.style.pointerEvents='auto';node.tabIndex=0;node.dataset.primary=String(close)
   placed.push({x:lx,y:ly})
  }
 })
 return <group ref={anchor}><Html key="experience-labels" onOcclude={()=>{}} calculatePosition={()=>[0,0]} zIndexRange={[40,30]} style={{pointerEvents:'none'}}><div ref={root} className="world-labels">{WORLDS.map(w=><button key={w.id} data-world={w.id} className="world-project" onClick={()=>useSpace.getState().openExperience(w.id)}><span>{pick(w.name,lang)}</span><small>{periodFor(w,lang)} · {lang==='zh'?'探索经历 ↗':'Explore ↗'}</small></button>)}</div></Html></group>
}
