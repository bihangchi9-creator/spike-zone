import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import { HyundaiModel } from '../universe/hyundai/HyundaiWorld'
import { worldClock } from '../universe/worldMotion'
import Capture from './Capture'
import Env from '../scene/Env'
const views:Record<string,{p:[number,number,number];target:[number,number,number]}>={front:{p:[15,7,34],target:[0,-1.8,0]},rear:{p:[-22,9,-30],target:[0,-1.8,0]},side:{p:[35,3,2],target:[0,-2,0]},cabin:{p:[9,-.5,24],target:[0,-4,0]}}
function Stage({view,reduced,low}:{view:string;reduced:boolean;low:boolean}){
 const {camera,size}=useThree(),v=views[view]||views.front
 useEffect(()=>{const factor=Math.max(1,1.25/(size.width/size.height));camera.position.set(...v.p.map((n,i)=>v.target[i]+(n-v.target[i])*factor) as [number,number,number]);camera.lookAt(...v.target)},[camera,v,size.width,size.height])
 useFrame((_,dt)=>{if(!reduced&&!document.hidden)worldClock.time+=Math.min(dt,.05)})
 return <><HyundaiModel low={low}/><OrbitControls key={view} target={v.target} minDistance={12} maxDistance={180}/></>
}
export default function HyundaiShowcase(){
 const [view,setView]=useState(new URLSearchParams(location.search).get('hyundai')||'front'),[reduced,setReduced]=useState(false),[low,setLow]=useState(false)
 return <div style={{position:'fixed',inset:0,background:'#08111d'}}><Canvas gl={{preserveDrawingBuffer:true}} dpr={1} camera={{fov:40,position:views.front.p}}><color attach="background" args={['#08111d']}/><hemisphereLight args={['#b7c8dd','#404040',.55]}/><directionalLight position={[5,8,5]} intensity={1.85} color="#e7d9c9"/><directionalLight position={[-5,4,-4]} intensity={1.15} color="#a6b6cc"/><directionalLight position={[-7,9,-8]} intensity={.55} color="#a8b8d0"/><Suspense fallback={null}><Env intensity={.48} rotationX={0} rotationY={0} rotationZ={0} asBackground={false} bgIntensity={.4} bgBlur={0}/><Stage view={view} reduced={reduced} low={low}/></Suspense></Canvas><div style={{position:'absolute',top:20,left:24,color:'#c6d2de',fontSize:12}}>HYUNDAI / 蓝白主星球 · 拖动环绕<p>{Object.entries({front:'全景',rear:'背面',side:'侧面',cabin:'智能座舱'}).map(([v,label])=><button style={{marginRight:12}} key={v} onClick={()=>{setView(v);history.replaceState(null,'',`?hyundai=${v}&label=hyundai-${v}`)}}>{label}</button>)}</p><button onClick={()=>setReduced(!reduced)}>{reduced?'恢复动态':'暂停动态'}</button> <button onClick={()=>setLow(!low)}>{low?'精细画质':'轻量画质'}</button></div><Capture/></div>
}
