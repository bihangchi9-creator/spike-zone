// Shared model proportions and rotated anchors. All offsets are world units except cabinLocal.
export const HYUNDAI={scale:3.05,radius:33.5,project:'ai-music-wallpaper',rotationRate:.004,
 dock:[16,4,48] as [number,number,number],cabinLocal:[0,-4,5] as [number,number,number]}
export function hyundaiAnchor(center:readonly number[],time:number,offset:readonly number[]):[number,number,number]{
 const a=time*HYUNDAI.rotationRate,c=Math.cos(a),s=Math.sin(a)
 return [center[0]+offset[0]*c+offset[2]*s,center[1]+offset[1],center[2]-offset[0]*s+offset[2]*c]
}
export const cabinOffset=HYUNDAI.cabinLocal.map(v=>v*HYUNDAI.scale)
