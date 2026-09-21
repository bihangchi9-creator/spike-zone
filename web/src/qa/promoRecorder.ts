// Local-only capture of the live WebGL canvas; no screen or microphone permissions.
export async function recordCanvas(source:HTMLCanvasElement,seconds:number,label:string,draw?:(ctx:CanvasRenderingContext2D,time:number)=>void,tick?:(t:number)=>void){
 await document.fonts.ready
 const out=document.createElement('canvas');out.width=1920;out.height=1080
 const ctx=out.getContext('2d')!,stream=out.captureStream(30),chunks:BlobPart[]=[]
 const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm'
 const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:9000000})
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
 let frame=0,start=performance.now()
 const paint=()=>{const t=(performance.now()-start)/1000;ctx.fillStyle='#081220';ctx.fillRect(0,0,1920,1080);const scale=Math.max(1920/source.width,1080/source.height),w=source.width*scale,h=source.height*scale;ctx.drawImage(source,(1920-w)/2,(1080-h)/2,w,h);draw?.(ctx,t);tick?.(t);if(t<seconds)frame=requestAnimationFrame(paint);else recorder.stop()}
 const saved=new Promise<string>((resolve,reject)=>{recorder.onerror=()=>reject(new Error('录制失败'));recorder.onstop=async()=>{cancelAnimationFrame(frame);stream.getTracks().forEach(t=>t.stop());try{const name=`promo-${label}-${Date.now()}.webm`,res=await fetch(`/__qa-artifact?name=${name}`,{method:'POST',body:new Blob(chunks,{type:mime})});if(!res.ok)throw new Error('保存失败');resolve(name)}catch(e){reject(e)}}})
 start=performance.now();recorder.start(1000);paint();return saved
}
export function filmOverlay(ctx:CanvasRenderingContext2D,t:number,duration:number,kicker:string,title:string,subtitle:string){
 ctx.fillStyle='#070c13';ctx.fillRect(0,0,1920,68);ctx.fillRect(0,1012,1920,68)
 ctx.fillStyle='#a9bfd2';ctx.font='18px system-ui';ctx.fillText('SPIKE  /  A PERSONAL UNIVERSE',86,42)
 ctx.textAlign='right';ctx.fillText('航驰星野 · 2026',1834,42);ctx.textAlign='left'
 const alpha=Math.min(1,t/1.1,(duration-t)/.8);ctx.save();ctx.globalAlpha=Math.max(0,alpha)
 const g=ctx.createLinearGradient(0,710,0,1012);g.addColorStop(0,'#07111c00');g.addColorStop(1,'#07111cdd');ctx.fillStyle=g;ctx.fillRect(0,710,1920,302)
 ctx.fillStyle='#9bbad8';ctx.font='20px system-ui';ctx.fillText(kicker,94,820)
 ctx.fillStyle='#f1f0e9';ctx.font='500 48px system-ui';ctx.fillText(title,90,887)
 ctx.fillStyle='#c3cbd4';ctx.font='24px system-ui';ctx.fillText(subtitle,94,936);ctx.restore()
}
