import {useEffect,useMemo,useRef,type MutableRefObject} from 'react'
import {useFrame} from '@react-three/fiber'
import {useGLTF,useEnvironment} from '@react-three/drei'
import * as T from 'three'
import {useReducedMotion} from './cinematic'
import {useSpace} from './state'
import {VESSEL_DESIGN} from './vesselModel'
import {VESSEL_V2,vesselEnergy} from './vesselDesignV2'

export default function Vessel({boost,version='v2',previewSpeed,paused=false,onModelReady}:{boost:MutableRefObject<boolean>;version?:'v2'|'original';previewSpeed?:number;paused?:boolean;onModelReady?:(root:T.Group)=>void}){
 const low=useSpace(s=>s.low),legacy=version==='original'
 const {scene}=useGLTF(`${import.meta.env.BASE_URL}${legacy?'models/explorer/spike-explorer.glb':VESSEL_V2.assets[low?'light':'detailed']+'?rev='+VESSEL_V2.revision}`)
 const environment=useEnvironment({files:`${import.meta.env.BASE_URL}textures/env.hdr`})
 const model=useMemo(()=>{
  const copy=scene.clone(true),materials=new Map<T.Material,T.MeshStandardMaterial>(),cores=new Set<T.MeshStandardMaterial>()
  copy.traverse(o=>{
   if(!(o instanceof T.Mesh))return
   const clone=(source:T.MeshStandardMaterial)=>{
    let m=materials.get(source)
    if(!m){m=source.clone();materials.set(source,m);if(!legacy){m.envMap=environment;m.envMapIntensity=m.name==='smoked_blue_canopy'?.55:m.name==='cobalt_automotive_paint'?.36:m.name==='warm_neutral_upholstery'?.15:.5}if(m.name.startsWith('engine_core'))cores.add(m)}
    return m
   }
   o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material)
   o.castShadow=(Array.isArray(o.material)?o.material:[o.material]).every(m=>!m.transparent);o.receiveShadow=true
   if((o.material as T.Material).name==='smoked_blue_canopy')o.renderOrder=3
  })
  const anchors=legacy?[-1,1].map(s=>new T.Vector3(s*VESSEL_DESIGN.engineX,VESSEL_DESIGN.engineY,VESSEL_DESIGN.engineZ+.16)):
   ['exhaust_port','exhaust_starboard'].map(name=>{const anchor=copy.getObjectByName(name);if(!anchor)throw new Error('Missing vessel nozzle anchor: '+name);return anchor.position.clone()})
  return {copy,materials,cores,anchors}
 },[scene,environment,legacy])
 useEffect(()=>{onModelReady?.(model.copy)},[model,onModelReady])
 // Own only cloned materials. Loader geometry, image textures and HDR stay shared.
 useEffect(()=>()=>model.materials.forEach(m=>m.dispose()),[model])
 const flames=useRef<(T.Group|null)[]>([]),energy=useRef(.16),reduced=useReducedMotion()
 useFrame((_,dt)=>{
  const s=useSpace.getState(),frozen=paused||document.hidden||!!s.project||!!s.panel||!!s.exploring
  energy.current=vesselEnergy(energy.current,dt,{boost:boost.current,speed:previewSpeed??s.speed,reduced:reduced.current||s.reduced,paused:frozen})
  model.cores.forEach(m=>{m.emissiveIntensity=.35+energy.current*.52})
  for(const flame of flames.current)if(flame){flame.scale.z=.34+energy.current*.55;flame.visible=!s.exploring}
 })
 return <group scale={legacy?VESSEL_DESIGN.scale:VESSEL_V2.scale}>
  <primitive object={model.copy} dispose={null}/>
  {model.anchors.map((p,i)=><group key={i} position={p} ref={el=>{flames.current[i]=el}}>
   <mesh position={[0,0,.22]} rotation={[Math.PI/2,0,0]} scale={[1.45,1,.5]} raycast={()=>{}}>
    <coneGeometry args={[.19,.44,low?12:24,1,true]}/>
    <meshBasicMaterial color="#66bcf1" transparent opacity={.13} depthWrite={false} blending={T.AdditiveBlending} side={T.DoubleSide} toneMapped={false}/>
   </mesh>
  </group>)}
 </group>
}
useGLTF.preload(`${import.meta.env.BASE_URL}${VESSEL_V2.assets.light}?rev=${VESSEL_V2.revision}`)
