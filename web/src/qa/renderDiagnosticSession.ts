import {diagnosticOptions} from './renderDiagnosticMath'
export const RENDER_DIAGNOSTIC_REVISION='blackframe-sizefix-v2-20260928'
export const renderDiagnostic=diagnosticOptions(location.search,import.meta.env.DEV)
type Event={ms:number;frame:number;type:string;data:unknown}
type Session={id:string;start:number;frame:number;events:Event[];pixels:unknown[];sizes:unknown[];deadline:number;screenshots:number;pending:Promise<unknown>[];ended:boolean}
let session:Session|null=null
let lastTimestamp=0
const observers=new Set<()=>void>()
let status='等待点击“录制 30 秒”开启有界诊断',summary={status,id:'',frames:0,events:0,pixelFrames:0}
export const diagnosticStatus=()=>summary
export const subscribeDiagnostic=(fn:()=>void)=>{observers.add(fn);return()=>{observers.delete(fn)}}
function publish(){summary={status,id:session?.id||'',frames:session?.frame||0,events:session?.events.length||0,pixelFrames:session?.pixels.length||0};observers.forEach(fn=>fn())}
export function recordDiagnostic(type:string,data:unknown){
 if(!session||session.ended||session.events.length>=2000)return
 session.events.push({ms:performance.now()-session.start,frame:session.frame,type,data})
}
export function diagnosticRunning(){return !!session&&!session.ended&&performance.now()<session.deadline}
export function diagnosticFrame(){if(session)session.frame++}
export function recordPixelSample(data:unknown){if(session&&session.pixels.length<10000)session.pixels.push({ms:performance.now()-session.start,frame:session.frame,data})}
export function recordSizeSample(data:unknown){if(session&&session.sizes.length<10000)session.sizes.push({ms:performance.now()-session.start,frame:session.frame,data})}
export function diagnosticTick(){if(session?.frame&&session.frame%30===0){status=`诊断中 · ${session.frame} 帧 · ${session.events.length} 条事件`;publish()}}
export function beginDiagnostic(meta:unknown){
 if(!renderDiagnostic.enabled)return null
 lastTimestamp=Math.max(Date.now(),lastTimestamp+1)
 const now=performance.now(),id=`blackframe-${renderDiagnostic.fixedDpr?'fixed':'adaptive'}-${renderDiagnostic.pixels?'pixels':'events'}-${lastTimestamp}`
 session={id,start:now,deadline:now+35000,frame:0,events:[],pixels:[],sizes:[],screenshots:0,pending:[],ended:false}
 status='正在录制并记录真实渲染状态';recordDiagnostic('record-click',{meta,options:renderDiagnostic,revision:RENDER_DIAGNOSTIC_REVISION,timeOrigin:performance.timeOrigin,performanceNow:now,userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,url:location.href});publish();return id
}
export function diagnosticScreenshot(makeBlob:()=>Promise<Blob>,meta:unknown){
 const s=session;if(!s||s.ended||s.screenshots>=6)return
 const name=`${s.id}-raw-${s.frame}-${++s.screenshots}.png`
 recordDiagnostic('raw-frame-request',{name,meta})
 const task=makeBlob().then(async body=>{const res=await fetch(`/__qa-artifact?name=${name}`,{method:'POST',body});if(!res.ok)throw Error('raw PNG upload '+res.status);recordDiagnostic('raw-frame-saved',{name})}).catch(error=>recordDiagnostic('raw-frame-error',{name,error:String(error)}))
 s.pending.push(task)
}
export async function finishDiagnostic(reason:string,id?:string|null){
 const s=session;if(!s||s.ended||id&&s.id!==id)return
 recordDiagnostic('record-ended',{reason});await Promise.allSettled(s.pending)
 if(session!==s)return
 s.ended=true
 const body={revision:RENDER_DIAGNOSTIC_REVISION,id:s.id,options:renderDiagnostic,durationMs:performance.now()-s.start,frames:s.frame,events:s.events,pixelSamples:s.pixels,sizeSamples:s.sizes,limits:{maxWindowMs:35000,maxEvents:2000,maxPixelSamples:10000,maxSizeSamples:10000,maxRawPNGs:6},note:'Local DEV diagnostics. Pixel readback adds stalls; this is not a performance baseline. Times relative to record-click; recorder-start event aligns media.'}
 const response=await fetch(`/__qa-artifact?name=${s.id}.json`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body,null,2)})
 status=response.ok?`已保存 ${s.id}.json`:'诊断 JSON 保存失败';publish()
}
