import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { seeded } from './data'
import { useReducedMotion } from './cinematic'

export default function Stars({ low, exploring=false }: { low: boolean; exploring?: boolean }) {
 const reduced=useReducedMotion()
 const uniforms=useMemo(()=>({time:{value:0},pixelRatio:{value:1},expanse:{value:0}}),[])
 const geometry=useMemo(()=>{
  const random=seeded(91),count=low?2600:6600
  const positions=new Float32Array(count*3),colors=new Float32Array(count*3)
  const sizes=new Float32Array(count),tiers=new Float32Array(count),phases=new Float32Array(count)
  for(let i=0;i<count;i++){
   const a=random()*Math.PI*2,z=random()*2-1,d=850+random()*650
   positions.set([Math.sqrt(1-z*z)*Math.cos(a)*d,z*d,Math.sqrt(1-z*z)*Math.sin(a)*d],i*3)
   const choice=random(),tier=choice<.015?2:choice<.16?1:0
   const color=new THREE.Color().setHSL(.57+random()*.065,.12+random()*.18,.74+random()*.2)
   colors.set([color.r,color.g,color.b],i*3)
   sizes[i]=tier===2?11+random()*6:tier===1?2.7+random()*1.6:1+random()*.9
   tiers[i]=tier;phases[i]=random()*Math.PI*2
  }
  const g=new THREE.BufferGeometry()
  g.setAttribute('position',new THREE.BufferAttribute(positions,3))
  g.setAttribute('color',new THREE.BufferAttribute(colors,3))
  g.setAttribute('aSize',new THREE.BufferAttribute(sizes,1))
  g.setAttribute('tier',new THREE.BufferAttribute(tiers,1))
  g.setAttribute('phase',new THREE.BufferAttribute(phases,1))
  return g
 },[low])
 useEffect(()=>()=>geometry.dispose(),[geometry])
 useFrame(({gl},dt)=>{
  uniforms.expanse.value=THREE.MathUtils.damp(uniforms.expanse.value,exploring?1:0,reduced.current?12:1.1,Math.min(dt,.1))
  uniforms.pixelRatio.value=Math.min(gl.getPixelRatio(),1.5)
  if(!reduced.current&&!document.hidden)uniforms.time.value+=Math.min(dt,.1)
 })
 return <points geometry={geometry} frustumCulled={false} renderOrder={-80}>
  <shaderMaterial uniforms={uniforms} transparent depthWrite={false} vertexColors blending={THREE.AdditiveBlending}
   vertexShader={`attribute float aSize;attribute float tier;attribute float phase;uniform float time;uniform float pixelRatio;uniform float expanse;varying vec3 c;varying float level;varying float pulse;
   void main(){c=color*mix(1.,1.38,expanse);level=tier;pulse=tier>1.5?.88+.12*sin(time*.55+phase):1.;gl_PointSize=aSize*pixelRatio*mix(1.,1.18,expanse);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
   fragmentShader={`varying vec3 c;varying float level;varying float pulse;
   void main(){vec2 p=gl_PointCoord-.5;float r=length(p);if(r>.5)discard;float alpha;
   if(level>1.5){float core=exp(-r*r*360.);float halo=exp(-r*r*24.)*.13;alpha=(core+halo)*pulse;}
   else{alpha=(1.-smoothstep(.06,.5,r))*(level>.5?.86:.47);}
   gl_FragColor=vec4(c*(level>1.5?1.5:1.),alpha);}`}/>
 </points>
}
