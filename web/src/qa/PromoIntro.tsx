import {useState} from 'react'
import {recordCanvas,filmOverlay} from './promoRecorder'
export default function PromoIntro({launch}:{launch:()=>void}){
 const [status,setStatus]=useState('准备就绪后开始'),[busy,setBusy]=useState(false)
 return <div style={{position:'fixed',left:20,bottom:20,zIndex:30000,background:'#101b2cee',padding:16,color:'white'}}><button disabled={busy} onClick={async()=>{
  const canvas=document.querySelector('canvas');if(!canvas)return
  setBusy(true);setStatus('录制人物介绍、网站介绍与真实转场 · 25 秒');let launched=false
  try{const clean=new URLSearchParams(location.search).has('promo-voice');const name=await recordCanvas(canvas,25,clean?'clean-intro':'intro-v2',(ctx,t)=>{
   if(clean)return
   if(t<6)filmOverlay(ctx,t,6,'BIHANGCHI / SPIKE','我是毕航驰 Spike','关注 AI 产品、模型运营与开源实践。')
   else if(t<12)filmOverlay(ctx,t-6,6,'ABOUT THIS WEBSITE','这里，是我的经历宇宙','向下阅读履历与作品，进入星空探索每一段经历。')
   else filmOverlay(ctx,t-12,13,'BEYOND THE PORTRAIT','每一段经历，都有一个世界','从故事的起点，飞向下一种可能。')
  },t=>{if(t>=12&&!launched){launched=true;launch()}});setStatus('已保存 '+name)}catch(e){setStatus(String(e))}finally{setBusy(false)}
 }}>录制新版宣传片开场</button><p>{status}</p></div>
}
