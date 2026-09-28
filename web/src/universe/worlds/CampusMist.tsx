import {useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as T from 'three'
import {useSpace} from '../state'

// Two terrain-following veils occupy the established rear third. They do not face the camera.
export default function CampusMist({paused=false,near=true}:{paused?:boolean;near?:boolean}){
 const low=useSpace(s=>s.low),reduced=useSpace(s=>s.reduced),clock=useRef(0)
 const uniforms=useMemo(()=>({drift:{value:0}}),[])
 const geometries=useMemo(()=>[0,1].map(layer=>{
  const columns=low?32:48,rows=low?18:28,positions=[],uv=[],indices=[]
  for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++){
   const u=col/columns,v=row/rows,angle=Math.PI+(u-.5)*2.32,latitude=-1.09+v*2.31
   const radius=9.47+layer*.24+.11*Math.sin(angle*7+latitude*4)+.065*Math.sin(latitude*11-angle*3)
   const y=Math.min(radius*Math.sin(latitude),4.66+layer*.17+.075*Math.sin(angle*9+latitude*3))
   positions.push(Math.sin(angle)*Math.cos(latitude)*radius,y,Math.cos(angle)*Math.cos(latitude)*radius);uv.push(u,v)
  }
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){const a=row*(columns+1)+col,b=a+columns+1;indices.push(a,b,a+1,a+1,b,b+1)}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeBoundingSphere();return geometry
 }),[low])
 useEffect(()=>()=>geometries.forEach(g=>g.dispose()),[geometries])
 useFrame((_,dt)=>{if(!paused&&!reduced&&!document.hidden)clock.current+=Math.min(dt,.05)*(near?1:.15);uniforms.drift.value=clock.current*.009})
 return <group>{geometries.map((geometry,i)=><mesh key={i} geometry={geometry} raycast={()=>{}}>
  <shaderMaterial uniforms={uniforms} transparent depthWrite={false} side={T.DoubleSide}
   vertexShader={`varying vec2 veilUV;varying vec3 veilPosition;void main(){veilUV=uv;veilPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
   fragmentShader={`varying vec2 veilUV;varying vec3 veilPosition;uniform float drift;
    float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    void main(){
     float broad=noise3(veilPosition*.53+vec3(drift,0.,-drift*.4));
     float fine=noise3(veilPosition*1.67+vec3(2.,-drift*.25,1.));
     float cloud=.7*broad+.3*fine;
     float edge=smoothstep(0.,.15,veilUV.x)*smoothstep(0.,.15,1.-veilUV.x)*smoothstep(0.,.15,veilUV.y)*smoothstep(0.,.12,1.-veilUV.y);
     float rear=1.-smoothstep(-3.7,-2.8,veilPosition.z);
     float alpha=edge*rear*(.11+.22*smoothstep(.16,.8,cloud));
     gl_FragColor=vec4(mix(vec3(.53,.64,.70),vec3(.69,.77,.80),cloud),alpha);
    }`}/>
 </mesh>)}</group>
}
