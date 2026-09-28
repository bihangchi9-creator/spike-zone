import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {addAfterEffect,useFrame,useThree} from '@react-three/fiber'

const WARMUP_MS=3000,SAMPLE_MS=10000,PUBLISH_MS=250
type Phase='warming'|'settling'|'sampling'|'complete'|'hidden'|'capturing'
type Totals={last:number;sum:number;max:number}
type Sample={phase:Phase;reason:string;warmStart:number|null;sampleStart:number|null;lastTime:number|null;elapsed:number;frames:number[];calls:Totals;triangles:Totals;renderFrames:number;invalidRenderFrames:number;renderIssue:string|null;autoResetCorrections:number;published:number;camera:number[]|null;resources:string|null;rendered:boolean}
type Props={
 stage:string;model:string;revision?:string;quality:string;view:string
 paused:boolean;reduced:boolean;resetKey?:string|number;sampleToken?:number
 /** Moving cameras (flight/auto-orbit) are intentional workloads, not unsettled views. */
 cameraMotion?:boolean;outputId?:string
}
const totals=():Totals=>({last:0,sum:0,max:0})
const blank=(reason:string):Sample=>({phase:document.hidden?'hidden':'warming',reason,warmStart:null,sampleStart:null,lastTime:null,elapsed:0,frames:[],calls:totals(),triangles:totals(),renderFrames:0,invalidRenderFrames:0,renderIssue:null,autoResetCorrections:0,published:0,camera:null,resources:null,rendered:false})
const rounded=(value:number)=>Math.round(value*100)/100
const add=(target:Totals,value:number)=>{target.last=value;target.sum+=value;target.max=Math.max(target.max,value)}
type CaptureResult={path:string;url:string}
// Component-private ownership: an output always captures its own live renderer,
// never the first Canvas in the DOM (which may be the inactive background).
const captureTargets=new Map<string,()=>Promise<CaptureResult>>()
let captureTimestamp=0
const filenamePart=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'scene'

/** DEV-only; mount exactly one probe per Canvas, beside the loaded model inside Suspense. */
export default function FrameProbe({stage,model,revision,quality,view,paused,reduced,resetKey,sampleToken=0,cameraMotion=false,outputId='frame-probe-performance'}:Props){
 const {gl,camera,size,invalidate}=useThree(),sample=useRef<Sample>(blank('mounted')),active=useRef(false)
 const [systemReduced,setSystemReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)
 const effectiveReduced=reduced||systemReduced
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setSystemReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[])
 useLayoutEffect(()=>{
  if(!import.meta.env.DEV)return
  const previousAutoReset=gl.info.autoReset
  gl.info.autoReset=false
  active.current=true
  const current=blank('configuration or resample changed')
  sample.current=current
  const publish=(now:number,force=false)=>{
   const s=sample.current
   if(!force&&now-s.published<PUBLISH_MS)return
   s.published=now
   const out=document.getElementById(outputId)
   if(!out)return
   const count=s.frames.length,sorted=[...s.frames].sort((a,b)=>a-b)
   const renderValid=s.renderFrames>0&&s.invalidRenderFrames===0
   const metric=(v:Totals)=>({last:renderValid?v.last:null,mean:renderValid?rounded(v.sum/s.renderFrames):null,max:renderValid?v.max:null})
   out.textContent=JSON.stringify({phase:s.phase,reason:s.reason,stage,id:model,model,revision,quality,view,paused,reduced:effectiveReduced,manualReduced:reduced,systemReduced,cameraMotion,viewport:[size.width,size.height],dpr:gl.getPixelRatio(),warmupSeconds:3,targetSampleSeconds:10,sampleSeconds:rounded(s.elapsed/1000),frames:count,fps:count&&s.elapsed?rounded(count*1000/s.elapsed):null,p95ms:count?rounded(sorted[Math.ceil(count*.95)-1]):null,calls:renderValid?s.calls.last:null,triangles:renderValid?s.triangles.last:null,render:{valid:renderValid,validFrames:s.renderFrames,rejectedFrames:s.invalidRenderFrames,issue:s.renderIssue,autoReset:gl.info.autoReset,autoResetCorrectedFrames:s.autoResetCorrections,scope:'all WebGL render passes of this Canvas, including shadows and postprocessing',calls:metric(s.calls),triangles:metric(s.triangles)},geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,camera:{position:camera.position.toArray().map(rounded),quaternion:camera.quaternion.toArray().map(rounded)},sampleToken},null,2)
  }
  const reset=(reason:string)=>{sample.current=blank(reason);publish(performance.now(),true)}
  let pendingCapture:{resolve:(result:CaptureResult)=>void;reject:(error:Error)=>void}|null=null
  let saving=false,disposed=false
  const requestCapture=()=>new Promise<CaptureResult>((resolve,reject)=>{
   if(document.hidden){reject(new Error('页面当前不可见，请回到画布后重试。'));return}
   if(pendingCapture||saving){reject(new Error('当前截图仍在保存，请稍候。'));return}
   pendingCapture={resolve,reject}
   sample.current=blank('canvas capture requested; performance sample discarded')
   sample.current.phase='capturing';publish(performance.now(),true)
   invalidate()
  })
  captureTargets.set(outputId,requestCapture)
  const captureFrame=()=>{
   const request=pendingCapture
   if(!request)return
   pendingCapture=null;saving=true
   captureTimestamp=Math.max(Date.now(),captureTimestamp+1)
   const name=`main-${[stage,model,view,quality].map(filenamePart).join('-')}-${captureTimestamp}.png`
   const finish=()=>{saving=false;if(!disposed)reset('canvas capture finished; warmup restarted')}
   try{
    // Called in the same rendering turn, after the composer, so this also works
    // for the main Canvas when preserveDrawingBuffer is false.
    gl.domElement.toBlob(async blob=>{
     try{
      if(!blob)throw new Error('画布未能生成 PNG，请重试。')
      const response=await fetch(`/__qa-artifact?name=${encodeURIComponent(name)}`,{method:'POST',headers:{'Content-Type':'image/png'},body:blob})
      if(!response.ok||await response.text()!==name)throw new Error('本机截图保存失败，请确认开发服务仍在运行。')
      request.resolve({path:`交付物/explorer-upgrade-20260920/media/${name}`,url:`/__qa-review/media/${name}`})
     }catch(error){request.reject(error instanceof Error?error:new Error('截图保存失败。'))}
     finally{finish()}
    },'image/png')
   }catch(error){request.reject(error instanceof Error?error:new Error('画布截图失败。'));finish()}
  }
  const visibility=()=>{
   if(document.hidden&&pendingCapture){pendingCapture.reject(new Error('页面已隐藏，本次截图已取消。'));pendingCapture=null}
   reset(document.hidden?'document hidden; sample discarded':'document visible; warmup restarted')
  }
  document.addEventListener('visibilitychange',visibility)
  publish(performance.now(),true)
  // R3F runs this after every root and its composer. Unlike a positive-priority
  // useFrame, it never takes ownership of rendering or suppresses the default pass.
  const unsubscribe=addAfterEffect(now=>{
   let s=sample.current
   if(!s.rendered)return // Another Canvas may have rendered while this one did not.
   s.rendered=false
   if(document.hidden)return
   if(pendingCapture){captureFrame();return}
   if(saving)return
   const pose=[...camera.matrixWorld.elements,...camera.projectionMatrix.elements]
   const resources=`${gl.info.memory.geometries}:${gl.info.memory.textures}:${gl.getPixelRatio()}`
   const moved=!cameraMotion&&s.camera?.some((value,index)=>Math.abs(value-pose[index])>1e-5)
   const reloaded=s.resources!==null&&s.resources!==resources
   if(moved||reloaded){
    const published=s.published
    s=blank(reloaded?'render resources or DPR changed':'camera changed; waiting for it to settle')
    s.phase=moved?'settling':'warming';s.published=published
    sample.current=s
   }
   s.camera=pose;s.resources=resources
   if(s.phase==='complete')return
   if(moved){publish(now);return}
   if(s.warmStart===null){s.warmStart=now;s.phase='warming'}
   if(now-s.warmStart<WARMUP_MS){publish(now);return}
   if(s.sampleStart===null){s.sampleStart=now;s.lastTime=now;s.phase='sampling';publish(now,true);return}
   const elapsed=now-s.lastTime!
   s.lastTime=now
   if(elapsed<=0)return
   s.elapsed=now-s.sampleStart;s.frames.push(elapsed)
   const render=gl.info.render
   // These loaded portfolio worlds cannot consist of a single fullscreen
   // triangle. Reject truncated counts, but retain the independent frame timing.
   if(gl.info.autoReset||render.calls<=1&&render.triangles<=1){
    s.invalidRenderFrames++
    s.renderIssue=gl.info.autoReset?'renderer autoReset changed during the frame':'only a fullscreen pass was counted; render statistics invalid'
   }else{s.renderFrames++;add(s.calls,render.calls);add(s.triangles,render.triangles)}
   if(s.elapsed>=SAMPLE_MS)s.phase='complete'
   publish(now,s.phase==='complete')
  })
  return()=>{active.current=false;disposed=true;unsubscribe();document.removeEventListener('visibilitychange',visibility);if(captureTargets.get(outputId)===requestCapture)captureTargets.delete(outputId);pendingCapture?.reject(new Error('场景已切换，请在新画布载入后截图。'));gl.info.autoReset=previousAutoReset;gl.info.reset()}
 },[gl,camera,size.width,size.height,invalidate,stage,model,revision,quality,view,paused,reduced,effectiveReduced,systemReduced,resetKey,sampleToken,cameraMotion,outputId])
 // Negative priority runs before scene updates without taking over the render loop.
 // One reset covers the complete frame, even when the composer renders many passes.
 useFrame(()=>{
  if(!import.meta.env.DEV||!active.current)return
  // Reassert this every frame: effect/HMR/context lifecycle changes must not
  // allow a later render pass to reset the counts accumulated by earlier passes.
  if(gl.info.autoReset)sample.current.autoResetCorrections++
  gl.info.autoReset=false
  gl.info.reset();sample.current.rendered=true
 },-10000)
 return null
}

/** Normal visible DOM: metrics are local, with no window API or remote telemetry. */
export function FrameProbePanel({onResample,outputId='frame-probe-performance',resetKey='initial',floating=false}:{onResample:()=>void;outputId?:string;resetKey?:string|number;floating?:boolean}){
 const [captureState,setCaptureState]=useState<{busy:boolean;message:string;url?:string}>({busy:false,message:''})
 useEffect(()=>{
  if(!import.meta.env.DEV||new URLSearchParams(location.search).get('qa-metrics')!=='1')return
  const output=document.getElementById(`${outputId}-harbor-motion`)
  if(output)output.textContent='等待当前场景崇振中央艇的实际回调…'
 },[outputId,resetKey])
 if(!import.meta.env.DEV)return null
 const saveCanvas=async()=>{
  const capture=captureTargets.get(outputId)
  if(!capture){setCaptureState({busy:false,message:'活动画布尚未载入，请稍候再试。'});return}
  setCaptureState({busy:true,message:'正在保存当前画布…'})
  try{const result=await capture();setCaptureState({busy:false,message:`已保存：${result.path}`,url:result.url})}
  catch(error){setCaptureState({busy:false,message:error instanceof Error?error.message:'截图保存失败。'})}
 }
 return <section aria-label="本机帧率与渲染统计" style={floating?{position:'fixed',left:12,bottom:104,zIndex:10000,width:'min(360px, calc(100vw - 24px))',maxHeight:'30vh',overflow:'auto',boxSizing:'border-box',padding:10,background:'#071322ed',color:'#d7e6ee',border:'1px solid #6b92aa',font:'11px/1.45 system-ui',pointerEvents:'auto'}:undefined}>{new URLSearchParams(location.search).get('qa-metrics')==='1'&&<output id={`${outputId}-harbor-motion`} aria-label="崇振中央艇实时运行诊断" style={{display:'block',whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:11,marginBottom:8}}>等待当前场景崇振中央艇的实际回调…</output>}<button type="button" onClick={onResample}>重新采样 10 秒</button><button type="button" disabled={captureState.busy} onClick={()=>void saveCanvas()}>保存当前画布截图</button><small style={{display:'block'}}>截图仅含当前 3D 画布，不含网页界面。保存后重新暖机，避免截图耗时混入帧率样本。</small><small role="status" style={{display:'block',overflowWrap:'anywhere'}}>{captureState.url?<a href={captureState.url} target="_blank" rel="noreferrer" style={{color:'inherit'}}>{captureState.message}</a>:captureState.message}</small><small style={{display:'block'}}>机位稳定后暖机 3 秒，再采样 10 秒。切换窗口、画质或动态状态会重新开始。统计包含这个画布的全部渲染过程；不代表 GPU 耗时。</small><output id={outputId} style={{display:'block',position:'static',background:'transparent',pointerEvents:'auto',whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:10}}>{JSON.stringify({phase:'waiting for loaded scene',resetKey})}</output></section>
}
