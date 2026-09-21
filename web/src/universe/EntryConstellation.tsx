import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EXPERIENCE, entryParticleFrame } from './experienceConfig'
import { useReducedMotion, type Journey, type WorldMode } from './cinematic'
export default function EntryConstellation({mode,journey}:{mode:WorldMode;journey:React.MutableRefObject<Journey>}){
 const group=useRef<THREE.Group>(null),clock=useRef(0),read=useRef(0),target=useRef({x:0,y:0,hover:false}),reduced=useReducedMotion()
 const v=useMemo(()=>new THREE.Vector3(),[]),direction=useMemo(()=>new THREE.Vector3(),[])
 useFrame(({camera,size},dt)=>{
  const root=group.current;if(!root)return
  const eligible=(mode==='home'||mode==='launch')&&window.scrollY<size.height*EXPERIENCE.entry.fadeScroll&&!document.hidden
  root.visible=eligible;if(!eligible)return
  if(!reduced.current)clock.current+=Math.min(dt,.05)
  read.current+=dt
  if(read.current>.15){read.current=0;const el=document.querySelector('.explore-entry');if(el){const r=el.getBoundingClientRect();target.current={x:Math.min(size.width-22,r.right+14),y:r.top+r.height*.45,hover:el.matches(':hover,:focus-visible')}}}
  const count=size.width<700?EXPERIENCE.entry.mobileCount:EXPERIENCE.entry.desktopCount
  root.children.forEach((o,i)=>{
   const mesh=o as THREE.Sprite;mesh.visible=i<count;if(!mesh.visible)return
   const phase=reduced.current?(i+.5)/count:(clock.current/(EXPERIENCE.entry.duration+i*.7)+i*.217)%1,{travel,alpha}=entryParticleFrame(phase)
   const t=travel,startX=Math.min(size.width-9,Math.max(target.current.x+8,size.width-28-(i%3)*10)),startY=target.current.y+75+i*24
   const x=Math.min(size.width-9,Math.max(target.current.x-4,THREE.MathUtils.lerp(startX,target.current.x,t)+Math.sin(t*Math.PI)*(i%2?12:-8))),y=THREE.MathUtils.lerp(startY,target.current.y-9,t)-Math.sin(t*Math.PI)*(22+i*3)
   const depth=5+i*1.4;v.set(x/size.width*2-1,1-y/size.height*2,.5).unproject(camera);direction.copy(v).sub(camera.position).normalize();mesh.position.copy(camera.position).addScaledVector(direction,depth)
   const fov=camera instanceof THREE.PerspectiveCamera?camera.fov:39,unit=2*depth*Math.tan(fov*Math.PI/360)/size.height,pixels=(size.width<700?3.2:4.5)-i*.38
   mesh.scale.setScalar(unit*pixels*4);mesh.rotation.z=0
   const mat=mesh.material as unknown as THREE.ShaderMaterial;mat.uniforms.alpha.value=(reduced.current?.55:alpha*.78)*(target.current.hover?1:.78)*(mode==='launch'?Math.max(0,1-journey.current.progress*4):1)
  })
 })
 return <group ref={group}>{Array.from({length:EXPERIENCE.entry.desktopCount},(_,i)=><sprite key={i} renderOrder={5}><shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={{alpha:{value:0},tint:{value:new THREE.Color(i===0?'#f4d2a1':'#b9d8f4')}}} vertexShader={`varying vec2 v;void main(){v=uv;vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.);mv.xy+=position.xy*vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));gl_Position=projectionMatrix*mv;}`} fragmentShader={`varying vec2 v;uniform float alpha;uniform vec3 tint;void main(){float r=length(v-.5)*2.;float core=exp(-r*r*150.);float glow=exp(-r*r*9.)*.23;gl_FragColor=vec4(mix(tint,vec3(1.),core),alpha*(core+glow));}`}/></sprite>)}</group>
}
