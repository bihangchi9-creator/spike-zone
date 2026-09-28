// Shared by the room mesh builder and the live digital-human screen.
export function campusRoomOffset(x:number,cx:number,front:number){
 const radius=Math.hypot(cx,front)
 return Math.sqrt(Math.max(.1,radius*radius-x*x))-front
}

export function campusRoomPose(x:number,y:number,z:number,cx:number,front:number){
 const radius=Math.hypot(cx,front),dz=-x/Math.sqrt(Math.max(.1,radius*radius-x*x))
 return {position:[x,y,z+campusRoomOffset(x,cx,front)] as [number,number,number],yaw:-Math.atan(dz)}
}

// A rigid title plaque rests on short stand-offs against the curved theatre wall.
const theatreWall=campusRoomPose(4.4,-2.25,4.855,4.4,7.785)
const theatreFaceOffset=.065
export const THEATRE_SIGN={
 position:theatreWall.position.map((v,i)=>v+(i===0?Math.sin(theatreWall.yaw):i===2?Math.cos(theatreWall.yaw):0)*theatreFaceOffset) as [number,number,number],
 rotation:[0,theatreWall.yaw,0] as [number,number,number],
 size:[2.35,.5] as [number,number],plateSize:[2.45,.6,.04] as [number,number,number],faceGap:.012,
 wallRadius:Math.hypot(4.4,7.785),faceOffset:theatreFaceOffset,
}
export function theatreWallBehindSign(localX:number){return Math.sqrt(THEATRE_SIGN.wallRadius**2-localX**2)-THEATRE_SIGN.wallRadius-THEATRE_SIGN.faceOffset}
