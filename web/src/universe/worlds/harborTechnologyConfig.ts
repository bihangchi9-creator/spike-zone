export const HARBOR_LIFT_ANCHORS: [number,number,number][] = [
 [-6.8,-2.76,4.35],[6.8,-2.76,4.35],[0,-2.76,-1.9],[-5.7,-2.76,-3.65],[5.7,-2.76,-3.65],
]
export const COURIER_SCALE = 1.25
export const COURIER_PERIOD = 34
export const COURIER_TIMING = {lift:1.5,depart:6.5,turn:12.5,return:16.5,land:23.5,docked:28.5}
export function advanceHarborClock(seconds:number,delta:number,state:{paused:boolean;reduced:boolean;reading:boolean;panelOpen:boolean;hidden:boolean}){
 if(state.paused||state.reduced||state.reading||state.panelOpen||state.hidden)return seconds
 return seconds+Math.max(0,Math.min(delta,.05))
}
const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10)}
const mix=(a:number,b:number,t:number)=>a+(b-a)*t
// A local demonstration: lift vertically before crossing the quay, then return above the same clear corridor.
// The complete craft stays inside the world's existing flight safety envelope.
export function courierPose(seconds:number){
 const t=((seconds%COURIER_PERIOD)+COURIER_PERIOD)%COURIER_PERIOD
 let x=0,y=.34,z=3.4,yaw=-.5,power=.76
 if(t>=COURIER_TIMING.lift&&t<COURIER_TIMING.depart){const a=ease((t-COURIER_TIMING.lift)/5);y=mix(.34,1.25,a);yaw=mix(-.5,0,a);power=mix(.76,1,a)}
 else if(t>=COURIER_TIMING.depart&&t<COURIER_TIMING.turn){const a=ease((t-COURIER_TIMING.depart)/6);x=.1*a;y=mix(1.25,2.05,a);z=mix(3.4,9.4,a);yaw=0;power=1}
 else if(t>=COURIER_TIMING.turn&&t<COURIER_TIMING.return){x=.1;y=2.05;z=9.4;yaw=Math.PI*ease((t-COURIER_TIMING.turn)/4);power=.85}
 else if(t>=COURIER_TIMING.return&&t<COURIER_TIMING.land){const a=ease((t-COURIER_TIMING.return)/7);x=.1*(1-a);y=mix(2.05,1.25,a);z=mix(9.4,3.4,a);yaw=Math.PI;power=.9}
 else if(t>=COURIER_TIMING.land&&t<COURIER_TIMING.docked){const a=ease((t-COURIER_TIMING.land)/5);y=mix(1.25,.34,a);yaw=mix(Math.PI,Math.PI*2-.5,a);power=mix(.9,.76,a)}
 return {position:[x,y,z] as [number,number,number],yaw,power}
}
