// Shared geometry/runtime path. Outer route follows the city behind the two front halls.
const cityRoute:readonly (readonly [number,number,number])[]=[
 [0,-.45,3.3],[2.13,.05,2.37],[3.8,.65,1.53],[8.45,1.35,.62],
 [9.15,2.08,-2.8],[7.6,2.55,-6.3],[4.65,3.02,-8.21],[.75,4.2,-8.85],
 [-3.4,3.45,-8.55],[-7.15,2.65,-6.7],[-9.1,2.34,-3.35],[-8.4,1.45,.53],[-3.8,.65,1.53],[-2.13,.05,2.37],
]
const tau=Math.PI*2
function cityPoint(angle:number):[number,number,number]{
 const t=((angle/tau)%1+1)%1*cityRoute.length,i=Math.floor(t),u=t-i,n=cityRoute.length
 const p0=cityRoute[(i+n-1)%n],p1=cityRoute[i],p2=cityRoute[(i+1)%n],p3=cityRoute[(i+2)%n]
 return [0,1,2].map(axis=>.5*((2*p1[axis])+(-p0[axis]+p2[axis])*u+(2*p0[axis]-5*p1[axis]+4*p2[axis]-p3[axis])*u*u+(-p0[axis]+3*p1[axis]-3*p2[axis]+p3[axis])*u*u*u)) as [number,number,number]
}
export function hubRailPoint(track:number,angle:number):[number,number,number]{
 return track%2?cityPoint(angle):[Math.sin(angle)*3.22,2.26,Math.cos(angle)*3.22]
}
function tangent(track:number,angle:number){const a=hubRailPoint(track,angle-.00001),b=hubRailPoint(track,angle+.00001);return b.map((v,i)=>v-a[i])}
export function hubRailPitch(track:number,angle:number){const [x,y,z]=tangent(track,angle);return -Math.atan2(y,Math.hypot(x,z))}
export function hubRailYaw(track:number,angle:number){const [x,,z]=tangent(track,angle);return Math.atan2(x,z)}
export function hubTargetAngle(position:readonly number[]){let best=0,distance=Infinity;for(let i=0;i<360;i++){const a=i/360*tau,p=cityPoint(a),d=(p[0]-position[0])**2+(p[2]-position[2])**2;if(d<distance){distance=d;best=a}}return best-2.094}
export {approachAngle} from './hubMotion'
