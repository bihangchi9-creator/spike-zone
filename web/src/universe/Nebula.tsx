import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useSpace } from './state'
import { useReducedMotion } from './cinematic'

const vertexShader = `
 varying vec2 screenUv;
 void main(){screenUv=uv;gl_Position=vec4(position.xy,1.,1.);}
`
const fragmentShader = `
 uniform sampler2D referenceMap;
 uniform float time;
 uniform float steps;
 uniform float expanse;
 uniform mat4 inverseProjection;
 uniform mat4 cameraWorld;
 varying vec2 screenUv;
 float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
 float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float fbm(vec3 p){return noise(p)*.57+noise(p*2.07+13.)*.28+noise(p*4.13+31.)*.10+noise(p*8.3+47.)*.05;}
 vec2 intersectBox(vec3 ro,vec3 rd){vec3 inv=1./(rd+vec3(.000001));vec3 a=(vec3(-1300,-700,-1500)-ro)*inv,b=(vec3(1300,800,-280)-ro)*inv;vec3 lo=min(a,b),hi=max(a,b);return vec2(max(max(lo.x,lo.y),lo.z),min(min(hi.x,hi.y),hi.z));}
 void main(){
  vec4 view=inverseProjection*vec4(screenUv*2.-1.,1.,1.);
  vec3 rd=normalize((cameraWorld*vec4(normalize(view.xyz/view.w),0.)).xyz);
  vec3 ro=cameraWorld[3].xyz;
  vec2 hit=intersectBox(ro,rd);
  float start=max(hit.x,0.),finish=hit.y;
  vec3 result=vec3(0.);float transmission=1.;
  float stride=max(0.,finish-start)/steps;
  float jitter=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
  for(int i=0;i<56;i++){
   if(float(i)>=steps||transmission<.035||finish<=start)break;
   vec3 p=ro+rd*(start+(float(i)+jitter)*stride);
   // Continuous 3D advection and deformation, rather than translating an image plane.
   vec3 q=p*.012+vec3(time*.027,-time*.016,time*.013);
   vec3 warp=vec3(sin(q.y*1.8+time*.06),cos(q.z*1.4-time*.045),sin(q.x*1.6+time*.035));
   float structure=fbm(q+warp*.48);
   float ridge=-80.+sin(p.x*.0036)*160.+sin(p.z*.0045)*100.;
   float envelope=exp(-pow((p.y-ridge)/85.,2.));
   float border=smoothstep(0.,150.,p.z+1500.)*smoothstep(0.,150.,-280.-p.z)*smoothstep(0.,200.,1300.-abs(p.x));
   // NASA image drives small-scale density through two projections, never a visible flat plate.
   vec2 uv1=fract((p.xy+warp.xy*35.)*.0007+vec2(.5,time*.001));
   vec2 uv2=fract((p.zy+warp.zy*35.)*.0008+vec2(.3,-time*.0013));
   vec3 sampleA=texture2D(referenceMap,uv1,2.5).rgb;
   vec3 sampleB=texture2D(referenceMap,uv2,2.5).rgb;
   float referenceDust=clamp((sampleA.r+sampleB.r)*1.5-(sampleA.b+sampleB.b)*.5,0.,1.);
   float density=smoothstep(.49,.76,structure+referenceDust*.28)*envelope*border;
   float opacity=1.-exp(-density*stride*.009);
   float light=exp(-length(p-vec3(-380,260,-780))*.0017);
   float filament=pow(max(0.,1.-density),3.);
   vec3 shade=mix(vec3(.030,.065,.145),vec3(.255,.375,.57),smoothstep(.25,.72,light));
   shade*=.24+light*1.65+filament*.48;
   shade*=.55+noise(q*12.)*.6;
   shade*=mix(vec3(1.),vec3(.93,1.12,1.34),expanse);
   result+=transmission*shade*opacity;
   transmission*=1.-opacity;
  }
  gl_FragColor=vec4(result,1.-transmission);
  // Premultiplied integration above is converted for normal alpha blending.
  if(gl_FragColor.a>.0001)gl_FragColor.rgb/=gl_FragColor.a;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }
`

// A ray-marched, evolving density field in world coordinates, shared by portrait and flight.
export default function Nebula({exploring=false}:{exploring?:boolean}) {
 const texture=useLoader(THREE.TextureLoader,`${import.meta.env.BASE_URL}textures/nebula/cosmic-cliffs.jpg`)
 const reduced=useReducedMotion()
 const elapsed=useRef(0)
 const low=useSpace(s=>s.low)
 const uniforms=useMemo(()=>({referenceMap:{value:texture},time:{value:0},expanse:{value:0},steps:{value:48},inverseProjection:{value:new THREE.Matrix4()},cameraWorld:{value:new THREE.Matrix4()}}),[texture])
 useEffect(()=>{
  texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true
 },[texture])
 useFrame(({camera,size},dt)=>{
  if(!reduced.current&&!document.hidden)elapsed.current+=Math.min(dt,.1)
  uniforms.time.value=elapsed.current
  uniforms.expanse.value=THREE.MathUtils.damp(uniforms.expanse.value,exploring?1:0,reduced.current?12:1.1,Math.min(dt,.1))
  uniforms.steps.value=low||size.width<700?32:48
  camera.updateMatrixWorld()
  uniforms.cameraWorld.value.copy(camera.matrixWorld)
  uniforms.inverseProjection.value.copy(camera.projectionMatrixInverse)
 })
 return <mesh frustumCulled={false} renderOrder={-90}>
  <planeGeometry args={[2,2]}/>
  <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false}/>
 </mesh>
}
