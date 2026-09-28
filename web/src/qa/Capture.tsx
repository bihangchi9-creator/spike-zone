import { useEffect, useRef, useState } from 'react'
import {beginDiagnostic,finishDiagnostic,recordDiagnostic} from './renderDiagnosticSession'
export default function Capture(){
 const [status,setStatus]=useState(''),[recording,setRecording]=useState(false),recorder=useRef<MediaRecorder|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null)
 const label=()=>new URLSearchParams(location.search).get('label')||'capture'
 const save=async(blob:Blob,ext:string,id?:string|null)=>{const name=(id||label()+'-'+Date.now())+'.'+ext;const r=await fetch(`/__qa-artifact?name=${encodeURIComponent(name)}`,{method:'POST',body:blob});setStatus(r.ok?'已保存 '+await r.text():'保存失败');recordDiagnostic('artifact-save',{name,status:r.status})}
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);if(recorder.current?.state==='recording')recorder.current.stop()},[])
 const record=()=>{
  const canvas=document.querySelector('canvas');if(!canvas)return
  const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm'
  const id=beginDiagnostic({canvas:[canvas.width,canvas.height],captureFps:30,mime,videoBitsPerSecond:6000000})
  let stream:MediaStream|null=null
  try{
  stream=canvas.captureStream(30);const ownedStream=stream,chunks:BlobPart[]=[]
  const r=new MediaRecorder(ownedStream,{mimeType:mime,videoBitsPerSecond:6000000});recorder.current=r
  r.onstart=()=>recordDiagnostic('recorder-start',{mime:r.mimeType,tracks:ownedStream.getVideoTracks().map(t=>t.getSettings())})
  r.ondataavailable=e=>{chunks.push(e.data);recordDiagnostic('recorder-chunk',{bytes:e.data.size,timecode:e.timecode})}
  r.onstop=()=>{
   if(timer.current){clearTimeout(timer.current);timer.current=null}
   recordDiagnostic('recorder-stop',{chunks:chunks.length});setStatus('正在保存录制和诊断…');ownedStream.getTracks().forEach(t=>t.stop())
   void save(new Blob(chunks,{type:mime}),'webm',id).finally(()=>finishDiagnostic('recorder stopped',id)).catch(e=>setStatus(String(e))).finally(()=>setRecording(false))
  }
  r.onerror=()=>{recordDiagnostic('recorder-error',{state:r.state});setStatus('录制失败');if(r.state==='recording')r.stop();else{ownedStream.getTracks().forEach(t=>t.stop());if(timer.current)clearTimeout(timer.current);setRecording(false);void finishDiagnostic('recorder error',id)}}
  r.start(1000);setRecording(true);setStatus('录制中 · 30 秒 · 仅 3D 画面');timer.current=setTimeout(()=>{if(r.state==='recording')r.stop()},30000)
  }catch(error){stream?.getTracks().forEach(t=>t.stop());recordDiagnostic('recorder-start-error',{error:String(error)});setRecording(false);setStatus(String(error));void finishDiagnostic('recorder startup failed',id)}
 }
 return <div style={{position:'fixed',bottom:22,left:12,zIndex:20000,background:'#07121fee',padding:8,fontSize:11,color:'white',maxWidth:'90vw'}}><button onClick={()=>document.querySelector('canvas')?.toBlob(b=>{if(b)void save(b,'png')})}>保存画面</button> <button onClick={record} disabled={recording}>录制 30 秒</button>{recording&&<button onClick={()=>recorder.current?.stop()}>结束录制</button>}<button onClick={()=>{sessionStorage.removeItem('spike-intro-seen');location.reload()}}>重放完整入场</button><output style={{display:'block'}}>{status}</output></div>
}
