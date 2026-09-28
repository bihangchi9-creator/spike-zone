import {useMemo,useRef} from 'react'
import {createPortal,useFrame} from '@react-three/fiber'
import * as T from 'three'
import {useSpace} from '../state'
import {HARBOR_LIFT_ANCHORS,courierPose,advanceHarborClock} from './harborTechnologyConfig'
import {useReducedMotion} from '../cinematic'
import HarborWaterField from './HarborWaterField'

const vertex=`varying vec2 vUv;varying vec3 vN;varying vec3 vEye;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vEye=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`
const plumeFragment=`varying vec2 vUv;varying vec3 vN;varying vec3 vEye;uniform float time;uniform float seed;
void main(){float along=1.-vUv.y;float fall=pow(1.-along,2.1);float stripe=.65+.35*sin(vUv.x*67.+sin(vUv.x*113.)+time*1.4+seed);float edge=pow(abs(dot(normalize(vN),normalize(vEye))),1.6);float alpha=fall*.26*stripe*edge*smoothstep(0.,.08,vUv.y);vec3 color=mix(vec3(.10,.63,.86),vec3(.58,1.,.94),pow(vUv.y,3.));gl_FragColor=vec4(color*1.9,alpha);}`
const poolFragment=`varying vec2 vUv;uniform float time;uniform float strength;
void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float edge=1.-smoothstep(.62,1.,r);float a=pow(max(0.,1.-r),3.);float ring=pow(.5+.5*cos(r*40.-time*1.7),18.)*edge*.28;gl_FragColor=vec4(.16,.82,.84,(a*.23+ring*.28)*strength);}`
function LiftPlume({position,radius,length,seed=0,clock}:{position:[number,number,number];radius:number;length:number;seed?:number;clock:{current:number}}){
 const material=useRef<T.ShaderMaterial>(null),uniforms=useMemo(()=>({time:{value:0},seed:{value:seed}}),[seed])
 useFrame(()=>{if(material.current)material.current.uniforms.time.value=clock.current})
 return <mesh position={[position[0],position[1]-length/2,position[2]]} raycast={()=>{}}>
  <cylinderGeometry args={[radius,radius*.55,length,20,1,true]}/>
  <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertex} fragmentShader={plumeFragment} transparent depthWrite={false} side={T.DoubleSide} blending={T.AdditiveBlending} toneMapped={false}/>
 </mesh>
}
export default function HarborTechnology({model,near,paused,diagnosticStage='world-detail'}:{model:T.Object3D;near:boolean;paused:boolean;diagnosticStage?:'main-space'|'world-detail'|'workbench'}){
 const clock=useRef(0),courier=model.getObjectByName('idea_courier'),low=useSpace(s=>s.low),water=useRef<T.ShaderMaterial>(null),reduced=useReducedMotion()
 const light=useRef<T.PointLight>(null),waterUniforms=useMemo(()=>({time:{value:0},strength:{value:.8}}),[])
 const lastDiagnostic=useRef(-Infinity)
 const diagnosticsEnabled=useMemo(()=>import.meta.env.DEV&&new URLSearchParams(location.search).get('qa-metrics')==='1',[])
 useFrame((_,dt)=>{
  const s=useSpace.getState();clock.current=advanceHarborClock(clock.current,dt,{paused,reduced:reduced.current||s.reduced,reading:!!s.project,panelOpen:!!s.panel,hidden:document.hidden})
  const pose=courierPose(clock.current)
  if(courier){courier.position.set(...pose.position);courier.rotation.y=pose.yaw}
  if(water.current){water.current.uniforms.time.value=clock.current;water.current.uniforms.strength.value=Math.max(0,1-(pose.position[2]-3.4)/2.5)*(.95-(pose.position[1]-.34)*.17)}
  if(light.current){light.current.position.set(pose.position[0],pose.position[1]-.12,pose.position[2]);light.current.intensity=2.2*pose.power}
  if(diagnosticsEnabled){
   const now=performance.now()
   if(now-lastDiagnostic.current>=500){
    const target=diagnosticStage==='main-space'?'frame-diagnostics':diagnosticStage==='workbench'?'refinement-performance':'world-performance'
    const output=document.getElementById(`${target}-harbor-motion`)
    if(output){
     const label=diagnosticStage==='main-space'?'主星空':diagnosticStage==='workbench'?'工作台':'世界近景'
     output.textContent=`scene: ${label} (${diagnosticStage})\nnear: ${near} | paused: ${paused} | reduced: ${reduced.current||s.reduced}\nseconds: ${clock.current.toFixed(3)} | local position: ${courier?'['+courier.position.toArray().map(v=>v.toFixed(3)).join(', ')+']':'中央艇节点缺失'}\nnearest: ${s.nearest??'null'} | reading: ${!!s.project} | panel: ${s.panel??'null'}`
     lastDiagnostic.current=now
    }
   }
  }
 })
 return <>
  <HarborWaterField clock={clock} near={near} low={low}/>
  {HARBOR_LIFT_ANCHORS.map((p,i)=><LiftPlume key={i} position={p} radius={.44} length={near?1.1:.88} seed={i} clock={clock}/>)}
  {near&&!low&&<><pointLight position={[-6.8,-2.71,4.8]} color="#55d6e2" intensity={4} distance={3.1} decay={2}/><pointLight position={[6.8,-2.71,4.8]} color="#55d6e2" intensity={4} distance={3.1} decay={2}/><pointLight position={[0,-2.68,-1.65]} color="#55d6e2" intensity={4} distance={3.1} decay={2}/><pointLight ref={light} color="#61e0ec" intensity={2.2} distance={3.5} decay={2}/></>}
  <mesh position={[0,-.626,3.4]} rotation={[-Math.PI/2,0,0]} raycast={()=>{}}><planeGeometry args={[3.1,3.1]}/><shaderMaterial ref={water} uniforms={waterUniforms} vertexShader={vertex} fragmentShader={poolFragment} transparent depthWrite={false} blending={T.AdditiveBlending} toneMapped={false}/></mesh>
  {courier&&createPortal(<>{[-1,1].flatMap(side=>[-.77,.59].map((z,i)=><LiftPlume key={`${side}-${z}`} position={[side*.53,-.127,z]} radius={.11} length={.64} seed={i+side} clock={clock}/>))}</>,courier)}
  {[1,2].map(i=>{const craft=model.getObjectByName('harbor_workboat_'+i);return craft?createPortal(<>{[-1,1].map(side=><LiftPlume key={side} position={[side*.33,-.072,.08]} radius={.085} length={.145} clock={clock}/>)}</>,craft):null})}
 </>
}
