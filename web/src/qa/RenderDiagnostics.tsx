import {useContext,useLayoutEffect,useRef,useSyncExternalStore} from 'react'
import {addAfterEffect,useFrame,useThree} from '@react-three/fiber'
import {EffectComposerContext} from '@react-three/postprocessing'
import {Vector2,Vector4,type WebGLRenderer} from 'three'
import {classifyScanlines} from './renderDiagnosticMath'
import {diagnosticFrame,diagnosticRunning,diagnosticScreenshot,diagnosticStatus,diagnosticTick,recordDiagnostic,recordPixelSample,recordSizeSample,renderDiagnostic,RENDER_DIAGNOSTIC_REVISION,subscribeDiagnostic} from './renderDiagnosticSession'
import type {RenderDprOwner} from '../universe/renderDpr'
import {readDefaultFramebuffer} from './readDefaultFramebuffer'
const composers=new WeakMap<WebGLRenderer,any>()
/** Observe existing composer buffers; never resize or take render ownership here. */
export function ComposerDiagnostic(){
 const context=useContext(EffectComposerContext),gl=useThree(s=>s.gl)
 useLayoutEffect(()=>{if(!renderDiagnostic.enabled||!context?.composer)return;composers.set(gl,context.composer);recordDiagnostic('composer-mounted',{});return()=>{if(composers.get(gl)===context.composer)composers.delete(gl);recordDiagnostic('composer-unmounted',{})}},[gl,context?.composer])
 return null
}
function rawFrame(context:WebGL2RenderingContext,width:number,height:number){
 const data=readDefaultFramebuffer(context,0,width,height)
 const topDown=new Uint8ClampedArray(data.length),stride=width*4
 for(let y=0;y<height;y++)topDown.set(data.subarray((height-y-1)*stride,(height-y)*stride),y*stride)
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.putImageData(new ImageData(topDown,width,height),0,0)
 return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('raw PNG encoding failed')),'image/png'))
}
export default function RenderDiagnostics({owner}:{owner:RenderDprOwner}){
 const {gl,get}=useThree(),rendered=useRef(false),lastState=useRef(''),lastSession=useRef('')
 const observe=(phase:string)=>{
  const c=gl.getContext(),state=get(),buffer=gl.getDrawingBufferSize(new Vector2()),composer=composers.get(gl),target=gl.getRenderTarget()
  const value={dpr:gl.getPixelRatio(),r3fDpr:state.viewport.dpr,css:[state.size.width,state.size.height],canvas:[gl.domElement.width,gl.domElement.height],drawingBuffer:[c.drawingBufferWidth,c.drawingBufferHeight],rendererDrawingBuffer:buffer.toArray(),viewport:gl.getViewport(new Vector4()).toArray(),currentViewport:gl.getCurrentViewport(new Vector4()).toArray(),nativeViewport:Array.from(c.getParameter(c.VIEWPORT)||[]),scissor:gl.getScissor(new Vector4()).toArray(),scissorTest:gl.getScissorTest(),nativeScissor:Array.from(c.getParameter(c.SCISSOR_BOX)||[]),nativeScissorTest:c.isEnabled(c.SCISSOR_TEST),contextLost:c.isContextLost(),renderTarget:target?{width:target.width,height:target.height}:null,defaultFramebuffer:c.getParameter(c.FRAMEBUFFER_BINDING)===null,composer:composer?{input:[composer.inputBuffer.width,composer.inputBuffer.height],output:[composer.outputBuffer.width,composer.outputBuffer.height],passes:composer.passes.map((p:any)=>({name:p.name||p.constructor.name,enabled:p.enabled,renderToScreen:p.renderToScreen}))}:null}
  const encoded=JSON.stringify(value)
  if(encoded!==lastState.current){recordDiagnostic('render-state',{phase,...value});lastState.current=encoded}
  return value
 }
 useLayoutEffect(()=>{
  if(!renderDiagnostic.enabled)return
  const lost=(event:Event)=>recordDiagnostic('webgl-context-lost',{type:event.type}),restored=()=>recordDiagnostic('webgl-context-restored',{})
  gl.domElement.addEventListener('webglcontextlost',lost);gl.domElement.addEventListener('webglcontextrestored',restored)
  const unsubscribe=addAfterEffect(()=>{
   if(!rendered.current)return;rendered.current=false
   if(!diagnosticRunning())return
   const state=observe('after-render')
   const expected=state.drawingBuffer,dimensions=[state.canvas,state.rendererDrawingBuffer,...(state.composer?[state.composer.input,state.composer.output]:[])]
   recordSizeSample({ownedDpr:owner.getSnapshot().dpr,ownerApplied:owner.getSnapshot().dpr===state.dpr,dpr:state.dpr,r3fDpr:state.r3fDpr,css:state.css,canvas:state.canvas,drawingBuffer:expected,rendererDrawingBuffer:state.rendererDrawingBuffer,composer:state.composer?{input:state.composer.input,output:state.composer.output}:null,consistent:!state.contextLost&&state.dpr===state.r3fDpr&&dimensions.every(a=>a[0]===expected[0]&&a[1]===expected[1]),contextLost:state.contextLost})
   if(renderDiagnostic.pixels&&!state.contextLost&&state.defaultFramebuffer&&state.renderTarget===null){
    const context=gl.getContext() as WebGL2RenderingContext,width=context.drawingBufferWidth,height=context.drawingBufferHeight,start=performance.now()
    if(width>0&&height>0&&!context.getParameter(context.PIXEL_PACK_BUFFER_BINDING)){
     try{
      const rows=[.25,.5,.75].map(f=>readDefaultFramebuffer(context,Math.floor((height-1)*f),width,1))
      const result=classifyScanlines(rows,width);recordPixelSample({...result,valid:true,readMs:performance.now()-start,width,height})
      if(result.suspect){recordDiagnostic('suspect-raw-frame',{...result,width,height});diagnosticScreenshot(()=>rawFrame(context,width,height),{width,height,source:'default WebGL framebuffer; lossless vertical origin conversion only'})}
     }catch(error){recordPixelSample({valid:false,error:String(error),width,height,readMs:performance.now()-start});recordDiagnostic('pixel-read-error',{error:String(error)})}
    }
   }
   diagnosticTick()
  })
  return()=>{unsubscribe();gl.domElement.removeEventListener('webglcontextlost',lost);gl.domElement.removeEventListener('webglcontextrestored',restored)}
 // Observe getter always reads live R3F/renderer state, not predicted sizes.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[gl,get,owner])
 useFrame(()=>{
  if(!renderDiagnostic.enabled||!diagnosticRunning())return
  rendered.current=true
  const id=diagnosticStatus().id;if(id!==lastSession.current){lastSession.current=id;lastState.current=''}
  diagnosticFrame();observe('before-updates')
 },-9000)
 return null
}
export function RenderDiagnosticPanel({owner,onParentUpdate}:{owner:RenderDprOwner;onParentUpdate:()=>void}){
 const state=useSyncExternalStore(subscribeDiagnostic,diagnosticStatus)
 const budget=useSyncExternalStore(owner.subscribe,owner.getSnapshot)
 const link=(fixed:boolean)=>{const q=new URLSearchParams(location.search);if(fixed)q.set('fixed-dpr','1.5');else q.delete('fixed-dpr');return '?'+q.toString()}
 return <aside style={{position:'fixed',right:12,top:12,zIndex:25000,width:260,maxHeight:'80vh',overflow:'auto',padding:10,background:'#091a2eee',color:'#e3edf7',font:'11px/1.5 system-ui'}} aria-label="瞬时黑帧诊断"><strong>{RENDER_DIAGNOSTIC_REVISION}</strong><div>{renderDiagnostic.fixedDpr?'B · 固定 DPR 1.5':'A · 自适应 DPR'} · {renderDiagnostic.pixels?'像素读回开启（有额外开销）':'仅状态事件，无像素读回'}</div><a href={link(false)} style={{color:'inherit'}}>重新载入 A</a> · <a href={link(true)} style={{color:'inherit'}}>重新载入 B</a><p>诊断控制 · 当前 DPR 预算 {budget.dpr}（实际缓冲见日志）。</p><div>{[1.5,1.25,1].map(dpr=><button key={dpr} type="button" disabled={owner.fixed||budget.low} onClick={()=>owner.request(dpr,'diagnostic')}>诊断 DPR {dpr}</button>)}</div><button type="button" onClick={()=>{recordDiagnostic('diagnostic-parent-update',{});onParentUpdate()}}>触发父组件更新</button><p>尺寸检查：先录制，再逐级点 1.5 → 1.25 → 1，穿插父组件更新和领航。黑帧对照：重新载入 A，原航路录制，不动诊断按钮。每次最长 35 秒，逐帧尺寸随 JSON 保存。</p><output style={{overflowWrap:'anywhere'}}>{state.status}</output></aside>
}
