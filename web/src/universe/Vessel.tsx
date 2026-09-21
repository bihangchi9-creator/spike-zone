import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useReducedMotion } from './cinematic'
import { useSpace } from './state'
import { VESSEL_DESIGN } from './vesselModel'
export default function Vessel({boost}:{boost:MutableRefObject<boolean>}){
 const {scene}=useGLTF(`${import.meta.env.BASE_URL}models/explorer/spike-explorer.glb`)
 const model=useMemo(()=>{const copy=scene.clone(true);copy.traverse(o=>{if(o instanceof THREE.Mesh)o.material=(o.material as THREE.Material).clone()});return copy},[scene])
 useEffect(()=>()=>model.traverse(o=>{if(o instanceof THREE.Mesh)(o.material as THREE.Material).dispose()}),[model])
 const flame=useRef<THREE.Group>(null),energy=useRef(.15),reduced=useReducedMotion()
 useFrame((_,dt)=>{const s=useSpace.getState(),target=boost.current?1.7:.15+s.speed/45;energy.current=THREE.MathUtils.damp(energy.current,target,6,Math.min(dt,.05));if(flame.current){flame.current.scale.z=energy.current;flame.current.visible=!s.project}const core=model.getObjectByName('engine_core') as THREE.Mesh|undefined;if(core){const m=core.material as THREE.MeshStandardMaterial;m.emissiveIntensity=.3+energy.current*.48}if(reduced.current&&flame.current)flame.current.scale.z=Math.min(.6,energy.current)})
 return <group scale={VESSEL_DESIGN.scale}><primitive object={model} dispose={null}/><group ref={flame} position={[0,VESSEL_DESIGN.engineY,1.96]}>{[-1,1].map(side=><group key={side} position={[side*VESSEL_DESIGN.engineX,0,0]}><mesh position={[0,0,.4]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[.12,.8,12]}/><meshBasicMaterial color="#7bb6ce" transparent opacity={.26} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh><mesh position={[0,0,.09]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[.075,.18,10]}/><meshBasicMaterial color="#c9d9d5" transparent opacity={.7} depthWrite={false}/></mesh></group>)}</group></group>
}
useGLTF.preload(`${import.meta.env.BASE_URL}models/explorer/spike-explorer.glb`)
