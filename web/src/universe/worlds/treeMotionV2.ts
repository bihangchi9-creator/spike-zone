export const TREE_LIFT={x:.54,z:2.9,minY:-6.5,maxY:6} as const
export function treeLiftY(time:number){return TREE_LIFT.minY+(.5+.5*Math.sin(time*.16))*(TREE_LIFT.maxY-TREE_LIFT.minY)}
export function treePodPose(index:number,progress:number){
 const sign=index?-1:1,side=index?1:-1,start=[side*7.2,.38,5.65],end=index?[5.2,-.08,4.88]:[-4.9,-.08,5.58],control=[side*6.6,.56,6.45],t=Math.max(0,Math.min(1,progress)),u=1-t
 const position=start.map((v,i)=>u*u*v+2*u*t*control[i]+t*t*end[i]) as [number,number,number]
 const dx=2*u*(control[0]-start[0])+2*t*(end[0]-control[0]),dz=2*u*(control[2]-start[2])+2*t*(end[2]-control[2])
 return {position,yaw:Math.atan2(dx,dz),side:sign}
}
