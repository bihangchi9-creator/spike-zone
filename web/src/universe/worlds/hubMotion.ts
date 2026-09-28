// Geometry export and runtime share these centerlines. Position is the rail running surface.
export const REFINED_HUB_TRACKS = [[3.55,1.1],[4.25,3.35]] as const
export function hubRailPoint(track:number,angle:number):[number,number,number]{
 const [radius,height]=REFINED_HUB_TRACKS[track%2]
 return [Math.sin(angle)*radius,height+Math.sin(angle)*.35,Math.cos(angle)*radius]
}
export function hubRailPitch(track:number,angle:number){
 return -Math.atan2(Math.cos(angle)*.35,REFINED_HUB_TRACKS[track%2][0])
}
export function approachAngle(current:number,target:number,maxStep:number){
 const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current))
 return current+Math.sign(delta)*Math.min(Math.abs(delta),maxStep)
}
