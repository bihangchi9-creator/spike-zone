export type SpinState = {angle:number;speed:number}
/** Integrate orientation, rather than multiplying a changing rate by global time. */
export function stepSpin(state:SpinState,dt:number,rate:number,distance:number,radius:number,paused:boolean):SpinState {
 if(paused)return {angle:state.angle,speed:0}
 const delta=Math.min(Math.max(dt,0),.05)
 const t=Math.min(1,Math.max(0,(distance-radius*1.5)/(radius*3)))
 const target=rate*(.12+.88*t*t*(3-2*t))
 const speed=target+(state.speed-target)*Math.exp(-delta*1.4)
 return {angle:state.angle+(state.speed+speed)*.5*delta,speed}
}
