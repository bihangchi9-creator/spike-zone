import {useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as T from 'three'

const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
const edgeFragment=`varying vec2 vUv;uniform float time;
void main(){
 float x=vUv.x, y=vUv.y, edge=smoothstep(0.,.02,x)*smoothstep(0.,.02,1.-x);
 float core=exp(-pow((y-.63)*62.,2.));
 float lower=exp(-pow((y-.21)*85.,2.))*.14;
 float halo=exp(-pow((y-.63)*9.,2.))*.055;
 float pulse=pow(.5+.5*cos(abs(x-.5)*22.+time*.82),20.);
 float threads=pow(.5+.5*cos(x*134.+sin(y*15.-time*.65)*.5),28.);
 float veil=threads*.028*exp(-pow((y-.42)*4.,2.));
 float alpha=(core*(.55+.24*pulse)+lower+halo+veil)*edge;
 gl_FragColor=vec4(mix(vec3(.08,.48,1.),vec3(.48,.94,1.),core)*2.,alpha);
}`
const surfaceFragment=`varying vec2 vUv;uniform float time;
void main(){
 float edge=smoothstep(0.,.06,vUv.x)*smoothstep(0.,.06,1.-vUv.x);
 float fade=pow(vUv.y,2.)*(1.-smoothstep(.9,1.,vUv.y));
 float line=pow(.5+.5*cos(vUv.y*53.-time*.8+sin(vUv.x*12.)*.5),24.);
 gl_FragColor=vec4(.16,.62,1.,line*fade*edge*.09);
}`
// Both effects use the harbor clock, so project reading, reduced motion and review pause freeze them together.
export default function HarborWaterField({clock,near,low}:{clock:{current:number};near:boolean;low:boolean}){
 const uniforms=useMemo(()=>({time:{value:0}}),[]),drops=useRef<T.InstancedMesh>(null),dummy=useMemo(()=>new T.Object3D(),[])
 useFrame(()=>{
  uniforms.time.value=clock.current
  if(drops.current){
   for(let i=0;i<6;i++){
    const x=[-1.73,-1.03,-.52,.36,1.12,1.68][i],t=clock.current*.37+i*2.17;
    dummy.position.set(x+Math.sin(t*.7)*.018,-.565+Math.sin(t)*.034,7.59+(i%3)*.035);
    const r=.017+(i%3)*.006;dummy.scale.set(r,r*(1.1+.12*Math.sin(t)),r);dummy.updateMatrix();drops.current.setMatrixAt(i,dummy.matrix);
   }
   drops.current.instanceMatrix.needsUpdate=true
  }
 })
 return <group>
  <mesh position={[0,-.685,7.527]} raycast={()=>{}}>
   <planeGeometry args={[4.12,.23]}/>
   <shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={edgeFragment} transparent depthWrite={false} side={T.DoubleSide} blending={T.AdditiveBlending} toneMapped={false}/>
  </mesh>
  {near&&!low&&<>
   <mesh position={[0,-.622,7.2]} rotation={[-Math.PI/2,0,0]} raycast={()=>{}}>
    <planeGeometry args={[4.1,.59]}/>
    <shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={surfaceFragment} transparent depthWrite={false} blending={T.AdditiveBlending} toneMapped={false}/>
   </mesh>
   <instancedMesh ref={drops} args={[undefined,undefined,6]} frustumCulled={false} raycast={()=>{}}>
    <sphereGeometry args={[1,10,8]}/>
    <meshStandardMaterial color="#b7eaf3" metalness={.25} roughness={.14} emissive="#559fbf" emissiveIntensity={.55}/>
   </instancedMesh>
  </>}
 </group>
}
