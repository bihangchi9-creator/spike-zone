import {stepSpin} from './worldSpin'
import {IdeaCourier} from './worlds/WorldEffects'
import DesignedModel from './worlds/DesignedModel'
import {WORLD_SCALE} from './worlds/catalog'
import { SYSTEM, orbitAt } from './worldConfig'
import { advanceWorld, positionOf } from './worldMotion'
import { useMemo, useRef, useEffect, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { WORLDS, RACE, SHARDS, SECRET, type ExperienceWorld, type Lang } from './data'
import { useSpace } from './state'
import Nebula from './Nebula'
import Stars from './Stars'
import { fadeGroup, type Journey, useReducedMotion } from './cinematic'
import WorldLabels from './WorldLabels'

const noiseGLSL=`
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.;float a=.5;for(int i=0;i<4;i++){v+=noise(p)*a;p=p*2.03+vec3(3.7,7.1,1.2);a*=.5;}return v;}
`
export function DeepSky(){
 const mesh=useRef<THREE.Mesh>(null)
 useFrame(({camera})=>{mesh.current?.position.copy(camera.position)})
 return <mesh ref={mesh} renderOrder={-100}><sphereGeometry args={[1800,32,24]}/><shaderMaterial side={THREE.BackSide} depthWrite={false} vertexShader={`varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`varying vec3 v;${noiseGLSL}
 void main(){vec3 d=normalize(v);float n=fbm(d*5.);float fine=fbm(d*18.+n*3.);float band=exp(-pow((d.y-.2+sin(d.x*3.)*.16)*3.8,2.));float cloud=pow(n,2.)*band;vec3 col=vec3(.011,.020,.041);col+=vec3(.044,.079,.151)*cloud*.65;col+=vec3(.067,.073,.13)*pow(fine,3.)*band;col+=vec3(.056,.06,.105)*pow(n,4.);gl_FragColor=vec4(col,1.);}`}/></mesh>
}
function Glow({color,scale}:{color:string;scale:number}){
 const uniforms=useMemo(()=>({tint:{value:new THREE.Color(color)}}),[color])
 return <sprite scale={[scale,scale,1]}><shaderMaterial uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} vertexShader={`varying vec2 v;void main(){v=uv;vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.);mv.xy+=position.xy*vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));gl_Position=projectionMatrix*mv;}`} fragmentShader={`varying vec2 v;uniform vec3 tint;void main(){float r=length(v-.5)*2.;float a=pow(max(0.,1.-r),3.);gl_FragColor=vec4(tint,a*.7);}`}/></sprite>
}
function WorldBody({world,active}:{world:ExperienceWorld;active:boolean}){
 const spin=useRef({angle:-.25,speed:0}),ref=useRef<THREE.Group>(null),near=useSpace(s=>s.nearest===world.id),paused=useSpace(s=>!!s.panel||!!s.project||!!s.exploring||s.reduced)
 useFrame((_,dt)=>{if(ref.current){const p=positionOf(world),ship=useSpace.getState().position,d=Math.hypot(p[0]-ship[0],p[1]-ship[1],p[2]-ship[2]);spin.current=stepSpin(spin.current,dt,.004+world.spin*.35,d,world.radius,paused||!active||document.hidden);ref.current.position.set(...p);ref.current.rotation.y=spin.current.angle;ref.current.rotation.x=.22}})
 return <group ref={ref} position={positionOf(world)} scale={WORLD_SCALE[world.id]} onClick={active?e=>{if(e.delta>5)return;e.stopPropagation();useSpace.getState().openExperience(world.id)}:undefined}><Suspense fallback={<mesh><icosahedronGeometry args={[3,1]}/><meshStandardMaterial color={world.color}/></mesh>}><DesignedModel id={world.id} near={near} paused={paused}/></Suspense></group>
}
function SharedOrbits(){
 const lines=useMemo(()=>WORLDS.map(w=>{const points=Array.from({length:181},(_,i)=>new THREE.Vector3(...orbitAt(w.orbit,w.orbit.period*i/180)));return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#8ca9bb',transparent:true,opacity:.075,depthWrite:false}))}),[])
 useEffect(()=>()=>lines.forEach(l=>{l.geometry.dispose();l.material.dispose()}),[lines])
 return <group>{lines.map((l,i)=><primitive key={WORLDS[i].id} object={l}/>)}<group position={SYSTEM.center}><mesh><octahedronGeometry args={[1.4,0]}/><meshBasicMaterial color="#b5a389"/></mesh><Glow color="#b5a389" scale={9}/></group></group>
}

function Collectible({position,index}:{position:[number,number,number];index:number}){
 const ref=useRef<THREE.Group>(null)
 const reduced=useReducedMotion()
 const collected=useSpace(s=>s.progress.shards.includes(index))
 useFrame((_,dt)=>{if(ref.current&&!reduced.current){ref.current.rotation.y+=dt*.6;ref.current.rotation.z+=dt*.25}})
 if(collected)return null
 return <group position={position} ref={ref}><mesh><octahedronGeometry args={[.28]}/><meshBasicMaterial color="#efcf99" toneMapped={false}/></mesh><mesh scale={1.7}><octahedronGeometry args={[.28]}/><meshBasicMaterial color="#b5dcf1" wireframe transparent opacity={.5}/></mesh><Glow color="#e4be8d" scale={2}/></group>
}
function RaceRings(){
 const active=useSpace(s=>s.race),checkpoint=useSpace(s=>s.checkpoint)
 return <group>{RACE.map((p,i)=>{if(!active)return null;const target=i===checkpoint;const next=RACE[(i+1)%RACE.length];const quat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(next[0]-p[0],next[1]-p[1],next[2]-p[2]).normalize());return <group key={i} position={p} quaternion={quat}><mesh><torusGeometry args={[5.5,target?.13:.055,8,64]}/><meshBasicMaterial color={target?'#f2d0a1':'#8daabb'} transparent opacity={i<checkpoint?.12:.7} toneMapped={false}/></mesh>{target&&<mesh><torusGeometry args={[6,.02,6,64]}/><meshBasicMaterial color="#c7d7e8"/></mesh>}</group>})}</group>
}
export default function Universe({active=false,portrait=false,lang='zh',journey}:{active?:boolean;portrait?:boolean;lang?:Lang;journey:React.MutableRefObject<Journey>}){
 const systems=useRef<THREE.Group>(null),reduced=useReducedMotion()
 useFrame((_,dt)=>{const s=useSpace.getState();advanceWorld(dt,!active||reduced.current||s.reduced||document.hidden||!!s.panel||!!s.project||!!s.exploring)},-100)
 useFrame(()=>{if(systems.current)fadeGroup(systems.current,THREE.MathUtils.smoothstep(journey.current.progress,.30,.85))})
 const low=useSpace(s=>s.low),found=useSpace(s=>s.progress.secret)
 const {gl}=useThree()
 useEffect(()=>{gl.setClearColor('#080f1e')},[gl])
 return <>{active&&<><hemisphereLight args={['#e2efff','#8b7659',.5]}/><directionalLight position={[100,180,180]} color="#fff0d5" intensity={1.3}/><directionalLight position={[-160,70,-90]} color="#a9d1ef" intensity={.65}/></>}<DeepSky/><Stars low={low} exploring={!portrait}/><Nebula exploring={!portrait}/><group ref={systems}>{active&&<><SharedOrbits/><IdeaCourier/></>}{WORLDS.map(w=><WorldBody key={w.id} world={w} active={active}/>)}</group>{active&&<><WorldLabels lang={lang}/><RaceRings/>{SHARDS.map((p,i)=><Collectible key={i} position={p} index={i}/>)}<group position={SECRET}><mesh rotation={[.6,0,.3]}><torusGeometry args={[5,.1,12,90]}/><meshBasicMaterial color={found?'#f7c98c':'#9fa9e1'}/></mesh><Glow color="#9b90cc" scale={20}/></group></>}</>
}
