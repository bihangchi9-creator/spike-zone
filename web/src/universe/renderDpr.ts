type Origin = 'adaptive' | 'diagnostic'
type Snapshot = { dpr:number; low:boolean; epoch:number }
/** One owner for the numeric Canvas prop. Only an explicit quality change resets it. */
export function createRenderDpr(low:boolean, deviceDpr:number, fixedDpr:number|null, report:(type:string,data:unknown)=>void=()=>{}) {
 const maximum=fixedDpr??Math.max(1,Math.min(1.5,deviceDpr||1))
 let state:Snapshot={dpr:low?1:maximum,low,epoch:0}
 const listeners=new Set<()=>void>()
 const publish=(next:Snapshot)=>{state=next;listeners.forEach(fn=>fn())}
 return {
  getSnapshot:()=>state,
  subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn)}},
  fixed:fixedDpr!==null,
  setQuality(nextLow:boolean){
   if(nextLow===state.low)return
   const next={dpr:nextLow?1:maximum,low:nextLow,epoch:state.epoch+1}
   report('dpr-quality-reset',{before:state,...next});publish(next)
  },
  request(target:number,origin:Origin,detail:unknown={}){
   if(state.low||fixedDpr!==null||!Number.isFinite(target))return false
   const dpr=Math.max(1,Math.min(maximum,target))
   if(origin==='adaptive'&&dpr>=state.dpr)return false
   report('dpr-owner-request',{origin,before:state.dpr,target:dpr,detail})
   if(dpr!==state.dpr||origin==='diagnostic')publish({...state,dpr,epoch:state.epoch+(origin==='diagnostic'?1:0)})
   return true
  },
 }
}
export type RenderDprOwner=ReturnType<typeof createRenderDpr>
