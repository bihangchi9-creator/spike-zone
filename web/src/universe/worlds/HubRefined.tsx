import {useEffect,useMemo,useRef} from 'react'
import {useGLTF,useTexture,useEnvironment} from '@react-three/drei'
import {useFrame} from '@react-three/fiber'
import * as T from 'three'
import {useSpace} from '../state'
import {STOPS} from './catalog'
import {useHubSurfaces,applyHubSurface} from './useHubSurfaces'
import {ProjectPath} from './WorldEffects'
import * as v1Motion from './hubMotion'
import * as v2Motion from './hubMotionV2'
const v2=!(import.meta.env.DEV&&new URLSearchParams(location.search).get('hub-version')==='v1')
const {approachAngle,hubRailPitch,hubRailPoint}=v2?v2Motion:v1Motion
function OfficialMark(){
 const source=useTexture(`${import.meta.env.BASE_URL}models/worlds/bytedance-official-header.png`)
 const map=useMemo(()=>{const texture=source.clone();texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture},[source])
 useEffect(()=>()=>map.dispose(),[map])
 return <mesh position={[0,v2?1.535:1.65,2.687]}><planeGeometry args={v2?[1.82,.467]:[1.12,.287]}/><meshStandardMaterial map={map} transparent alphaTest={.08} depthWrite={false} roughness={.5}/></mesh>
}
export default function HubRefined({near=true,paused=false,selected=null,inUniverse=false}:{near?:boolean;paused?:boolean;selected?:string|null;inUniverse?:boolean}){
 const low=useSpace(s=>s.low),reduced=useSpace(s=>s.reduced),surfaces=useHubSurfaces(),environment=useEnvironment({files:`${import.meta.env.BASE_URL}textures/env.hdr`})
 const {scene}=useGLTF(`${import.meta.env.BASE_URL}models/worlds/bytedance-refined-${v2?'v2':'v1'}${near&&!low?'':'-low'}.glb?rev=20260926b`)
 // Cached geometries stay owned by useGLTF; dispose only this instance's materials.
 const instance=useMemo(()=>{
  const model=scene.clone(true),materials=new Map<T.Material,T.Material>(),moving=new Map<string,T.Object3D>()
  model.traverse(o=>{if(o instanceof T.Mesh){const clone=(m:T.Material)=>{if(!materials.has(m)){const owned=m.clone();if(near&&!low)applyHubSurface(owned,surfaces,v2);if(owned instanceof T.MeshStandardMaterial){owned.envMap=environment;owned.envMapIntensity=v2?.75:.45
   // The main universe also has the portrait rig and a lower bloom threshold.
   // Restrict this response to owned hub materials; detail/review lighting stays unchanged.
   if(v2&&inUniverse&&owned.name==='hub_porcelain'){owned.color.multiplyScalar(.72);owned.roughness=.9;owned.metalness=.045;owned.envMapIntensity=.38}
   if(v2&&inUniverse&&owned.name==='hub_brushed_aluminum'){owned.roughness=Math.max(owned.roughness,.64);owned.envMapIntensity=.42}
  }materials.set(m,owned)}return materials.get(m)!};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);o.castShadow=!(Array.isArray(o.material)?o.material.some(m=>m.transparent):o.material.transparent);o.receiveShadow=true}if(/^hub_shuttle_|^hub_dispatch$/.test(o.name))moving.set(o.name,o)})
  return {model,materials,moving}
 },[scene,near,low,surfaces,environment,inUniverse])
 useEffect(()=>()=>instance.materials.forEach(m=>m.dispose()),[instance])
 const phase=useRef(0),time=useRef(0),stop=STOPS.bytedance.find(s=>s.id===selected)
 useFrame((_,dt)=>{
  const elapsed=paused||reduced||document.hidden?0:Math.min(dt,.05)*(near?1:.15);time.current+=elapsed
  phase.current=stop?approachAngle(phase.current,v2?v2Motion.hubTargetAngle(stop.position):Math.atan2(stop.position[0],stop.position[2]),elapsed*.3):phase.current+elapsed*.16
  for(let i=0;i<3;i++){
   const shuttle=instance.moving.get(`hub_shuttle_${i}`);if(!shuttle)continue
   const angle=phase.current+i*2.094,point=hubRailPoint(i%2,angle);shuttle.position.set(point[0],point[1]+.112,point[2]);shuttle.rotation.set(hubRailPitch(i%2,angle),v2?v2Motion.hubRailYaw(i%2,angle):angle+Math.PI/2,0,'YXZ')
  }
  const dispatch=instance.moving.get('hub_dispatch');if(dispatch)dispatch.rotation.y=time.current*.035
 })
 return <group><primitive object={instance.model}/><OfficialMark/>{v2&&near&&!low&&<group><pointLight position={[-5.5,1.95,3.35]} color="#ffda9c" intensity={3.5} distance={5} decay={2}/><pointLight position={[5.4,1.3,3.45]} color="#ffe4b5" intensity={2.8} distance={4.8} decay={2}/><pointLight position={[0,.92,0]} color="#ffe0aa" intensity={4} distance={5.2} decay={2}/></group>}<ProjectPath id="bytedance" stop={stop||null}/></group>
}
