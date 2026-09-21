import {Suspense,useEffect,useRef,useState} from 'react'
import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {useProgress} from '@react-three/drei'
import {EffectComposer,Bloom,SMAA} from '@react-three/postprocessing'
import * as T from 'three'
import DesignedModel from '../universe/worlds/DesignedModel'
import {STOPS} from '../universe/worlds/catalog'
import Universe,{DeepSky} from '../universe/Universe'
import Nebula from '../universe/Nebula'
import Stars from '../universe/Stars'
import {useSpace} from '../universe/state'
import {recordCanvas,filmOverlay} from './promoRecorder'
const clean = new URLSearchParams(location.search).has('promo-voice')
const shots=[
 {id:'university',kicker:'01 / 学习与好奇',title:'故事，从校园开始',sub:'大连理工 · 自动化 · 数字人实验室',seconds:9},
 {id:'chongzhen',kicker:'02 / 从想法到产品',title:'让想法，有落地的地方',sub:'崇振时代 · 多 Agent 内容产品与 AI 辅助设计',seconds:9},
 {id:'hyundai',kicker:'03 / 体验与感知',title:'让音乐，成为看得见的体验',sub:'现代汽车 · 智能座舱 · AI 音乐壁纸',seconds:9},
 {id:'bytedance',kicker:'04 / 系统与交付',title:'把复杂需求，变成可运行的系统',sub:'字节跳动 · 模型运营 · 生成、判断与质量治理',seconds:9},
 {id:'opensource',kicker:'05 / 持续生长',title:'把连接，留给更多人',sub:'开源探索 · dsh-lark-bridge · trae-to-lark',seconds:9},
 {id:'outro',kicker:'THE NEXT CHAPTER',title:'毕航驰 Spike',sub:'重复是最好的老师。行动起来。',seconds:11},
]
function Shot({id,clock,onReady}:{id:string;clock:React.MutableRefObject<number>;onReady:()=>void}){
 const {camera}=useThree(),journey=useRef({portrait:0,progress:1}),selected=STOPS[id]?.[0],target=new T.Vector3(),from=new T.Vector3(),to=new T.Vector3()
 useEffect(()=>{onReady()},[id,onReady])
 useFrame(()=>{const t=clock.current;if(id==='outro'){camera.position.set(-110+Math.sin(t*.018)*70,600,-600+1650-t*8);camera.lookAt(0,30,-600)}else{const f=T.MathUtils.smootherstep(t,2.2,8.8),a=.49-t*.014;from.set(Math.sin(a)*31,12.5,Math.cos(a)*31);to.set(...(selected?.camera||[16,12,22])).multiplyScalar(1.08);camera.position.lerpVectors(from,to,f*.62);target.set(...(selected?.position||[0,0,0])).multiplyScalar(f*.6);camera.lookAt(target)}},-1)
 return <><hemisphereLight args={['#e6f0ff','#746b5b',.65]}/><directionalLight position={[8,16,15]} color="#fff0d8" intensity={1.9} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-normalBias={.04}/><directionalLight position={[-12,7,-8]} color="#89b6ec" intensity={.75}/>
 {id==='outro'?<Universe journey={journey} active/>:<><DeepSky/><Stars low exploring/><Nebula exploring/><DesignedModel id={id} near paused={false}/></>}
 <EffectComposer multisampling={0}><Bloom intensity={.27} luminanceThreshold={1.1} mipmapBlur/><SMAA/></EffectComposer></>
}
export default function PromoStudio(){const [index,setIndex]=useState(0),[busy,setBusy]=useState(false),[status,setStatus]=useState('等待模型载入'),clock=useRef(0),root=useRef<HTMLDivElement>(null),ready=useRef<(()=>void)|null>(null),{active}=useProgress();const shot=shots[index]
 useEffect(()=>{useSpace.getState().update({project:null,panel:null,exploring:null,reduced:false,low:false})},[])
 const report=useRef(()=>{ready.current?.();ready.current=null}).current
 const start=async()=>{setBusy(true);try{for(let i=0;i<shots.length;i++){clock.current=0;if(i!==index){await new Promise<void>(resolve=>{ready.current=resolve;setIndex(i)})}await new Promise(r=>setTimeout(r,1800));setStatus(`录制 ${i+1}/6 · ${shots[i].title}`);const c=root.current!.querySelector('canvas')!;const q=shots[i];await recordCanvas(c,clean?16:q.seconds,clean?`clean-${q.id}`:q.id,(ctx,t)=>{if(clean)return;filmOverlay(ctx,t,q.seconds,q.kicker,q.title,q.sub);if(q.id==='outro'){ctx.fillStyle='#b4c8dc';ctx.font='26px system-ui';ctx.fillText('bihangchi9@163.com',96,976);ctx.textAlign='right';ctx.font='19px system-ui';ctx.fillText('github.com/bihangchi9-creator',1828,936);ctx.font='16px system-ui';ctx.fillText('Music: “Aurora” by Scott Buckley · CC BY 4.0 · www.scottbuckley.com.au',1828,1051);ctx.textAlign='left'}},t=>{clock.current=t})}setStatus('全部 6 段镜头已录制并保存')}catch(e){setStatus(String(e))}finally{setBusy(false)}}
 return <div style={{background:'#081321',minHeight:'100vh',color:'#e7edf3'}}><div ref={root} style={{width:1280,height:720,position:'relative'}}><Canvas shadows dpr={1.25} camera={{position:[16,12,22],fov:43,near:.1,far:4000}} gl={{antialias:false,preserveDrawingBuffer:true}}><Suspense fallback={null}><Shot key={shot.id} id={shot.id} clock={clock} onReady={report}/></Suspense></Canvas></div><div style={{position:'fixed',bottom:12,left:12,zIndex:10000,padding:14,background:'#0b1427e8'}}><button disabled={busy||active} onClick={start}>开始录制五个世界与片尾</button><p>{active?'载入素材…':status}</p></div></div>
}
