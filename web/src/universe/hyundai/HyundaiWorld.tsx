import { useMemo, useRef } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'
import { useSpace } from '../state'
import { positionOf, worldClock } from '../worldMotion'
import type { ExperienceWorld } from '../data'
import { HYUNDAI } from './pose'

const vertex=`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
export function HyundaiModel({low=false,onCabin}:{low?:boolean;onCabin?:()=>void}){
 const {scene}=useGLTF(`${import.meta.env.BASE_URL}models/hyundai/hyundai-world.glb?v=integrated-lights-1`)
 const logo=useTexture(`${import.meta.env.BASE_URL}models/hyundai/hyundai-ci.jpg`)
 const screen=useMemo(()=>({time:{value:0}}),[])
 const model=useMemo(()=>{const copy=scene.clone(true);const materials=new Map<T.Material,T.Material>();copy.traverse(o=>{if(o instanceof T.Mesh){const old=o.material as T.Material;if(!materials.has(old))materials.set(old,old.clone());o.material=materials.get(old)!;if(o.material.name==='Window_panels')o.renderOrder=1}});return copy},[scene])
 const cars=useMemo(()=>[0,1].map(i=>model.getObjectByName('test_car_'+i)),[model])
 const arms=useMemo(()=>[0,1,2,3].map(i=>model.getObjectByName('robot_joint_'+i)),[model])
 // Cropped UVs preserve the actual official logo's proportions without redrawing the mark.
 const logoGeometry=useMemo(()=>{const g=new T.PlaneGeometry(8.4,1.36);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,.06+uv.getX(i)*.88,.37+uv.getY(i)*.26);return g},[])
 useFrame(()=>{const t=worldClock.time;screen.time.value=t;cars.forEach((c,i)=>{if(!c)return;c.visible=!low||i===0;const a=t*.065+i*Math.PI;c.position.set(Math.sin(a)*8.65,.34,Math.cos(a)*8.65);c.rotation.y=a+Math.PI/2});arms.forEach((a,i)=>{if(a)a.rotation.y=Math.sin(t*.35+i*1.7)*.25})})
 return <group>
  <primitive object={model}/>
  <pointLight position={[0,3,1]} color="#3688ff" intensity={18} distance={12} decay={2}/>
  <pointLight position={[0,-4,2]} color="#2879ff" intensity={14} distance={10} decay={2}/>
  <mesh position={[0,4.55,2.409]} geometry={logoGeometry}><shaderMaterial transparent depthWrite={false} uniforms={{map:{value:logo}}} vertexShader={vertex} fragmentShader={`varying vec2 v;uniform sampler2D map;void main(){float mask=smoothstep(.18,.85,texture2D(map,v).r);gl_FragColor=vec4(vec3(.95),mask);}`} /></mesh>
  <mesh position={[.65,-3.65,.435]} onClick={onCabin?e=>{e.stopPropagation();onCabin()}:undefined}>
   <planeGeometry args={[5.12,.78]}/><shaderMaterial uniforms={screen} vertexShader={vertex} fragmentShader={`varying vec2 v;uniform float time;void main(){vec3 c=vec3(.004,.022,.067);float x=v.x;for(int i=0;i<4;i++){float f=float(i);float y=.5+sin(x*10.-time*.45+f*.55)*.15*sin(x*3.14159);float d=abs(v.y-y);c+=vec3(.11,.34,.7)*exp(-d*70.)*(1.-f*.16);}float bars=step(.72,fract(x*38.))*step(v.y,.14+sin(x*24.+time*.3)*.04)*step(.06,v.y);c+=vec3(.2,.53,.85)*bars;gl_FragColor=vec4(c,1.);}`} toneMapped={false}/>
  </mesh>
  {/* Two single-sided shells: rear reflections first, then front. Opaque cabin writes depth. */}
  {[T.BackSide,T.FrontSide].map((side,i)=><mesh key={side} renderOrder={2+i} onClick={onCabin?e=>{e.stopPropagation();onCabin()}:undefined}>
   <sphereGeometry args={[10.17,low?40:72,low?18:32,0,Math.PI*2,Math.PI/2,Math.PI/2]}/>
   <shaderMaterial transparent side={side} depthWrite={false} uniforms={{strength:{value:i===0?.24:.48}}} vertexShader={`varying vec3 n;varying vec3 eye;varying vec3 p;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);eye=normalize(-mv.xyz);p=position;gl_Position=projectionMatrix*mv;}`} fragmentShader={`varying vec3 n;varying vec3 eye;varying vec3 p;uniform float strength;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(eye))),3.);float streak=pow(max(0.,sin(p.x*.7+p.z*.25)),24.)*.10;gl_FragColor=vec4(mix(vec3(.13,.27,.39),vec3(.6,.8,.92),f),strength*(.025+f*.8+streak));}`}/>
  </mesh>)}
 </group>
}
export default function HyundaiWorld({planet,active}:{planet:ExperienceWorld;active:boolean}){
 const ref=useRef<T.Group>(null),low=useSpace(s=>s.low)
 useFrame(()=>{if(ref.current){ref.current.position.set(...positionOf(planet));ref.current.rotation.y=worldClock.time*HYUNDAI.rotationRate}})
 return <group ref={ref} position={positionOf(planet)} scale={HYUNDAI.scale}><HyundaiModel low={low} onCabin={active?()=>useSpace.getState().openProject(HYUNDAI.project):undefined}/></group>
}
