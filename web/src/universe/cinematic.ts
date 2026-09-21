import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useSpace } from './state'
import { withJourneyOpacity } from './visualMath'
export type WorldMode = 'home' | 'launch' | 'space' | 'return'
export type Journey = { portrait: number; progress: number }
export function useReducedMotion() {
 const manual = useSpace(s=>s.reduced)
 const reduced = useRef(manual)
 useEffect(() => { const query=matchMedia('(prefers-reduced-motion: reduce)'); const update=()=>{reduced.current=query.matches||manual}; update(); query.addEventListener('change',update); return ()=>query.removeEventListener('change',update) },[manual])
 return reduced
}
// Restore the exact original material state when a transition ends.
const originals = new WeakMap<THREE.Material, {opacity:number;transparent:boolean;depthWrite:boolean}>()
export function fadeGroup(group:THREE.Group, opacity:number) {
 group.visible=opacity>.001
 group.traverse(object=>{
  if(!(object instanceof THREE.Mesh||object instanceof THREE.Points||object instanceof THREE.Sprite))return
  const materials=Array.isArray(object.material)?object.material:[object.material]
  for(const material of materials){
   if(!originals.has(material))originals.set(material,{opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite})
   const base=originals.get(material)!
   const transparent=opacity<.999||base.transparent
   if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true}
   material.opacity=base.opacity*opacity
   if(material instanceof THREE.ShaderMaterial){
    if(!material.uniforms.journeyOpacity)material.uniforms.journeyOpacity={value:opacity}
    if(!material.fragmentShader.includes('uniform float journeyOpacity;')){
     material.fragmentShader=withJourneyOpacity(material.fragmentShader)
     material.needsUpdate=true
    }
    material.uniforms.journeyOpacity.value=opacity
   }
   material.depthWrite=opacity<.999?false:base.depthWrite
  }
 })
}
