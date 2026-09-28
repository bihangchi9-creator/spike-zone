import {Suspense,useEffect,useRef,useState} from 'react'
import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {OrbitControls,Html} from '@react-three/drei'
import {EffectComposer,Bloom,SMAA,N8AO} from '@react-three/postprocessing'
import * as T from 'three'
import HarborRefined from '../universe/worlds/HarborRefined'
import WorldSigns from '../universe/worlds/WorldSigns'
import HarborLighting from '../universe/worlds/HarborLighting'
import {useSpace} from '../universe/state'
import './harbor-review.css'
const shots=[
 {id:'overview',name:'整体斜视',camera:[19,14,26],target:[.3,1.3,.6]},
 {id:'reference',name:'近看全景',camera:[9,6.5,23],target:[.3,1.3,.8]},
 {id:'front',name:'正面',camera:[0,8.2,28],target:[0,1.3,.4]},
 {id:'side',name:'右侧',camera:[25,10,7],target:[.7,1,0]},
 {id:'back',name:'背面',camera:[16,11,-25],target:[0,1,0]},
 {id:'under',name:'底部',camera:[16,-11,22],target:[0,-.5,0]},
 {id:'meeting',name:'交流室近景',camera:[.3,2.8,5.3],target:[0,1.8,-2.4]},
 {id:'prototype',name:'设计工作间',camera:[-6.2,3.1,7.3],target:[-5.45,1.5,.15]},
 {id:'fabrication',name:'制作工作间',camera:[6.1,3.05,7.6],target:[5.45,1.5,.1]},
 {id:'berth',name:'灵感艇泊位',camera:[13.9,3.8,9],target:[8.65,.52,4.25]},
 {id:'boat',name:'灵感艇细节',camera:[4.8,2.9,9.9],target:[0,.65,3.4]},
 {id:'bay',name:'开放水湾',camera:[1.5,2.4,11.4],target:[0,-.25,6.1]},
 {id:'propulsion',name:'悬浮动力舱',camera:[7,-3.1,12.5],target:[0,-1.85,6.8]},
 {id:'roof',name:'屋顶通信设备',camera:[12,8,7],target:[4.6,4.1,-1.8]},
]
function PerformanceSample({version,low}:{version:string;low:boolean}){
 const sample=useRef({elapsed:0,frames:[] as number[],done:false}),{gl,size}=useThree()
 useEffect(()=>{sample.current={elapsed:0,frames:[],done:false}},[version,low,size.width,size.height])
 useFrame((_,dt)=>{
  const s=sample.current;if(s.done)return
  if(document.hidden){s.elapsed=0;s.frames=[];return}
  s.elapsed+=dt;if(s.elapsed<4)return;s.frames.push(dt*1000)
  if(s.elapsed>=14){s.done=true;const frames=s.frames,sorted=[...frames].sort((a,b)=>a-b),mean=frames.reduce((a,b)=>a+b,0)/frames.length;const out=document.getElementById('harbor-performance');if(out)out.textContent=JSON.stringify({version,quality:low?'light':'detailed',width:size.width,height:size.height,dpr:gl.getPixelRatio(),frames:frames.length,seconds:+(frames.reduce((a,b)=>a+b,0)/1000).toFixed(2),fps:+(1000/mean).toFixed(1),p95ms:+sorted[Math.floor(sorted.length*.95)].toFixed(1),visibility:document.visibilityState})}
 })
 return null
}
function Stage({index,legacy,reset,motion}:{index:number;legacy:boolean;reset:number;motion:boolean}){
 const {camera,size}=useThree(),controls=useRef<any>(null),low=useSpace(s=>s.low)
 useEffect(()=>{const target=new T.Vector3(...shots[index].target as [number,number,number]),distanceScale=Math.max(1,1.3/(size.width/size.height));camera.position.set(...shots[index].camera as [number,number,number]).sub(target).multiplyScalar(distanceScale).add(target);controls.current?.target.copy(target);controls.current?.update()},[camera,index,reset,size.width,size.height])
 return <>
  <color attach="background" args={['#142735']}/>
  <HarborLighting/>
  <Suspense fallback={<Html center>正在加载模型…</Html>}>
   <HarborRefined version={legacy?'v2':'v3'} near paused={!motion}/><WorldSigns id="chongzhen-refined"/>
  </Suspense>
  <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.12} minDistance={2} maxDistance={100}/>
  {!low&&<EffectComposer multisampling={0}><N8AO aoRadius={.65} intensity={1.1} distanceFalloff={1} quality="medium"/><Bloom intensity={.12} luminanceThreshold={1.4} mipmapBlur/><SMAA/></EffectComposer>}
  <PerformanceSample version={legacy?'v2':'v3'} low={low}/>
 </>
}
export default function HarborReview(){
 const [index,setIndex]=useState(1),[legacy,setLegacy]=useState(false),[saved,setSaved]=useState(''),[low,setLow]=useState(false),[reset,setReset]=useState(0),[motion,setMotion]=useState(false),root=useRef<HTMLDivElement>(null)
 useEffect(()=>{useSpace.getState().update({low,reduced:!motion,project:null,panel:null})},[low,motion])
 const save=()=>{root.current?.querySelector('canvas')?.toBlob(async b=>{if(!b)return;const name=`harbor-field-${legacy?'before':'after'}-${shots[index].id}.png`;const res=await fetch('/__qa-artifact?name='+name,{method:'POST',body:b});setSaved(res.ok?'已保存 '+name:'保存失败')})}
 return <main className="harbor-review">
  <div ref={root} className="harbor-review-canvas"><Canvas shadows dpr={low?1:[1,1.5]} camera={{position:[19,14,26],fov:42,near:.05,far:180}} gl={{antialias:true,preserveDrawingBuffer:true,toneMapping:T.ACESFilmicToneMapping}}><Stage index={index} legacy={legacy} reset={reset} motion={motion}/></Canvas></div>
  <section className="harbor-review-controls">
   <div className="harbor-review-title"><strong>崇振悬浮水湾 · 待验收</strong><span>{legacy?'上一轮 v2':'悬浮水湾 v3.2'} · 拖动旋转 · 滚轮缩放 · 右键平移</span></div>
   <nav aria-label="模型视角">{shots.map((s,i)=><button key={s.id} aria-pressed={index===i} onClick={()=>{setIndex(i);setReset(n=>n+1)}}>{s.name}</button>)}</nav>
   <div className="harbor-review-actions"><button onClick={()=>setLegacy(v=>!v)}>{legacy?'查看悬浮水湾 v3.2':'对比上一轮 v2'}</button><button onClick={()=>setLow(v=>!v)}>{low?'切换精细模型':'切换轻量模型'}</button><button onClick={()=>setMotion(v=>!v)} aria-pressed={motion}>{motion?'暂停起降演示':'播放起降演示'}</button><button onClick={save}>保存当前机位</button><a href="/?world=chongzhen&diagnostics=1">常规旋转查看 ↗</a><a href="/">返回个人网站 ↗</a><span>{saved||'草图和画作均为场景道具。'}</span></div>
   <details className="harbor-performance-details"><summary>本机性能采样</summary><output id="harbor-performance">正在采样，保持页面可见约 14 秒…</output></details>
  </section>
 </main>
}
