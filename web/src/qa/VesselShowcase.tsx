import {Canvas,useThree} from '@react-three/fiber'
import {OrbitControls} from '@react-three/drei'
import {EffectComposer,Bloom,SMAA} from '@react-three/postprocessing'
import {ACESFilmicToneMapping,Vector3,type Group} from 'three'
import {Suspense,useCallback,useRef,useState} from 'react'
import Vessel from '../universe/Vessel'
import {useSpace} from '../universe/state'
import {VESSEL_V2} from '../universe/vesselDesignV2'
import Capture from './Capture'
import FrameProbe,{FrameProbePanel} from './FrameProbe'
import Env from '../scene/Env'
const views:Record<string,{name:string;position:[number,number,number];target?:[number,number,number]}>= {
 rear:{name:'后侧',position:[4,2.8,5.8]},front:{name:'前侧',position:[4,2.8,-5.8]},
 side:{name:'右侧',position:[7,.9,0]},left:{name:'左侧',position:[-7,.9,0]},
 top:{name:'俯视',position:[0,7,.01]},under:{name:'底部',position:[4,-3,5]},pilot:{name:'驾驶背面',position:[0,2.8,7]},cabin:{name:'座舱',position:[1.8,2,-2.2]},plaque:{name:'右侧铭牌',position:[2,2,-.7]},plaqueLeft:{name:'左侧铭牌',position:[-2,2,-.7]}}
function Stage({view,version,drive,paused,sampleToken}:{view:string;version:'v2'|'original';drive:string;paused:boolean;sampleToken:number}){
 const boost=useRef(false),controls=useRef<any>(null),{camera}=useThree(),low=useSpace(s=>s.low),reduced=useSpace(s=>s.reduced)
 boost.current=drive==='boost'
 const setModelCamera=useCallback((root:Group)=>{
  const plaque=view==='plaque'||view==='plaqueLeft'?root.getObjectByName(view==='plaque'?'nameplate_starboard':'nameplate_port'):null
  if(plaque){
   // Use the exported model marker, never a separately maintained guessed coordinate.
   const normal=new Vector3(0,1,0).applyQuaternion(plaque.quaternion)
   const target=plaque.position.clone().addScaledVector(normal,.017).multiplyScalar(VESSEL_V2.scale)
   camera.position.copy(target).addScaledVector(normal,.76)
   controls.current?.target.copy(target)
  }else{camera.position.set(...views[view].position);controls.current?.target.set(...(views[view].target||[0,.1,-.25]))}
  camera.near=.025;camera.updateProjectionMatrix();controls.current?.update()
 },[camera,view])

 return <><Vessel boost={boost} version={version} previewSpeed={drive==='idle'?0:drive==='cruise'?23:45} paused={paused} onModelReady={setModelCamera}/>
 <OrbitControls ref={controls} makeDefault minDistance={.45} maxDistance={16} enableDamping target={views[view].target||[0,.1,-.25]}/>
  <FrameProbe stage="vessel-showcase" model="Spike" revision={version} view={view+':'+drive} quality={low?'light':'detailed'} paused={paused} reduced={reduced} sampleToken={sampleToken} outputId="vessel-performance"/>
 {!low&&<EffectComposer multisampling={0} stencilBuffer={false} depthBuffer><Bloom mipmapBlur intensity={.6} luminanceThreshold={.82} luminanceSmoothing={.3}/><SMAA/></EffectComposer>}
 </>
}
export default function VesselShowcase(){
 const initial=new URLSearchParams(location.search).get('vessel')||'rear'
 const [view,setView]=useState(views[initial]?initial:'rear'),[version,setVersion]=useState<'v2'|'original'>('v2'),[drive,setDrive]=useState('idle'),[paused,setPaused]=useState(false),[sampleToken,setSampleToken]=useState(0)
 const low=useSpace(s=>s.low),reduced=useSpace(s=>s.reduced)
 return <main style={{position:'fixed',inset:0,background:'#08111d',color:'#d6e2ed'}}>
  <Canvas gl={{preserveDrawingBuffer:true,antialias:false,stencil:false,toneMapping:ACESFilmicToneMapping}} dpr={1} camera={{fov:35,position:views[view].position}}>
   <color attach="background" args={['#08111d']}/>
   {/* Match existing Scene + active Universe lights/post, without changing either. */}
   <Suspense fallback={null}><Env intensity={.48} rotationX={0} rotationY={0} rotationZ={0} asBackground={false} bgIntensity={.4} bgBlur={0}/></Suspense>
   <hemisphereLight args={['#b7c8dd','#404040',.55]}/><hemisphereLight args={['#e2efff','#8b7659',.5]}/>
   <directionalLight position={[5,8,5]} intensity={1.85} color="#e7d9c9"/><directionalLight position={[-5,4,-4]} intensity={1.15} color="#a6b6cc"/><directionalLight position={[-7,9,-8]} intensity={.55} color="#a8b8d0"/>
   <directionalLight position={[100,180,180]} intensity={1.3} color="#fff0d5"/><directionalLight position={[-160,70,-90]} intensity={.65} color="#a9d1ef"/>
   <Suspense fallback={null}><Stage view={view} version={version} drive={drive} paused={paused} sampleToken={sampleToken}/></Suspense>
  </Canvas>
  <aside style={{position:'absolute',top:18,left:18,width:'min(310px,calc(100vw - 36px))',maxHeight:'70vh',overflow:'auto',background:'#07121fe8',padding:14,font:'12px/1.55 system-ui',border:'1px solid #486078'}}>
   <a href="/" style={{color:'inherit'}}>返回主页</a><h1 style={{fontSize:19}}>Spike · 毕航驰</h1><p>主飞船 v2 建模候选 · 可拖动旋转</p><output style={{display:'block'}}>{version==='v2'?VESSEL_V2.revision:'original-v1'}</output><small>复现主站灯组与高低档后处理；近景镜头用于查结构，驾驶效果仍以主站为准。</small>
   <nav>{Object.entries(views).map(([id,v])=><button key={id} aria-pressed={view===id} onClick={()=>setView(id)}>{v.name}</button>)}</nav>
   <p><button onClick={()=>setVersion(v=>v==='v2'?'original':'v2')}>{version==='v2'?'当前新船 · 查看旧船':'当前旧船 · 查看新船'}</button> <button onClick={()=>useSpace.getState().update({low:!low})}>{low?'轻量档':'精细档'}</button></p>
   <p>{[['idle','怠速'],['cruise','巡航'],['boost','加速']].map(([id,label])=><button key={id} aria-pressed={drive===id} onClick={()=>setDrive(id)}>{label}</button>)}</p>
   <button onClick={()=>setPaused(p=>!p)}>{paused?'恢复推进动态':'暂停推进动态'}</button> <button onClick={()=>useSpace.getState().update({reduced:!reduced})}>{reduced?'减少动态：开':'减少动态：关'}</button>
   <details><summary>开发采样</summary><FrameProbePanel outputId="vessel-performance" resetKey={`${version}:${view}:${drive}:${low}:${paused}:${reduced}:${sampleToken}`} onResample={()=>setSampleToken(n=>n+1)}/></details>
  </aside><Capture/>
 </main>
}
