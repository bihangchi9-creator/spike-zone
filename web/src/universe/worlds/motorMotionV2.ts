import type {V3} from '../worldConfig'
// Locally corrected coastal bends; the universe layout and world scale are unchanged.
export const motorRoadV2:V3[]=[[-4,.8,7.4],[-.5,-.2,8.08],[4.35,-1.2,7.15],[7.35,.7,4.0],[6.75,3.65,0],[3.9,6.3,-3],[0,6.9,-4.6],[-5,5.3,-3.9],[-7.7,2.7,-.6],[-7.4,.8,4.45]]
export const FACTORY_SCALE:V3=[.95,.98,.82]
export const FACTORY_YAW=-.16
export const COCKPIT_SCALE:V3=[.82,.82,.8]
export const factoryPoint=(p:readonly number[]):V3=>{
 const x=(p[0]+3.9)*FACTORY_SCALE[0],z=(p[2]-5)*FACTORY_SCALE[2],c=Math.cos(FACTORY_YAW),s=Math.sin(FACTORY_YAW)
 return [x*c+z*s-2.15,(p[1]-3.18)*FACTORY_SCALE[1]+2.75,-x*s+z*c+4.5]
}
export const factoryLocal=(p:readonly number[]):V3=>{
 const x=p[0]+2.15,z=p[2]-4.5,c=Math.cos(FACTORY_YAW),s=Math.sin(FACTORY_YAW)
 return [(x*c-z*s)/FACTORY_SCALE[0]-3.9,(p[1]-2.75)/FACTORY_SCALE[1]+3.18,(x*s+z*c)/FACTORY_SCALE[2]+5]
}
export const cockpitPoint=(p:readonly number[]):V3=>[(p[0]-3.25)*COCKPIT_SCALE[0]+2,(p[1]-7.62)*COCKPIT_SCALE[1]+7.35,(p[2]+.6)*COCKPIT_SCALE[2]-.55]
export const MOTOR_RIDE_HEIGHT=.05

// The rigid badge is in front of the complete curved roof, with two short rear brackets.
export const IONIQ_BADGE={center:[3.25,8.72,1.43] as V3,size:[2.1,.57,.07] as V3,letterSize:[1.95,.44] as [number,number],faceGap:.012}
export const ioniqBadgeFaceLocal:V3=[IONIQ_BADGE.center[0],IONIQ_BADGE.center[1]+.02,IONIQ_BADGE.center[2]+IONIQ_BADGE.size[2]/2+IONIQ_BADGE.faceGap]
export const FACTORY_SIGN_VIEW:V3=[17,12,26]

// Physical surfaces and their live overlays share these local-space definitions.
export const MUSIC_SCREEN={center:[3.25,7.45,-.913] as V3,size:[2.23,.4,.018] as V3,faceGap:.012}
export const musicOverlayLocal:V3=[MUSIC_SCREEN.center[0],MUSIC_SCREEN.center[1],MUSIC_SCREEN.center[2]+MUSIC_SCREEN.size[2]/2+MUSIC_SCREEN.faceGap]
export const FACTORY_HEADER={center:[-3.9,5.23,5.8] as V3,size:[6.62,.64,2.63] as V3}
export const FACTORY_LOGO={size:[4.3,.7] as [number,number],plateSize:[4.42,.78,.036] as V3,faceGap:.012}
export const factoryLogoPlateLocal:V3=[FACTORY_HEADER.center[0],FACTORY_HEADER.center[1],FACTORY_HEADER.center[2]+FACTORY_HEADER.size[2]/2+.01]
export const factoryLogoFaceLocal:V3=[factoryLogoPlateLocal[0],factoryLogoPlateLocal[1],factoryLogoPlateLocal[2]+FACTORY_LOGO.plateSize[2]/2+FACTORY_LOGO.faceGap]
export const FACTORY_OCCUPANCY={min:[-7.25,1.15,2.84] as V3,max:[-.55,5.56,7.9] as V3}
export function plantOverlapsFactory(root:readonly number[],crownRadius:number){
 const local=factoryLocal(root)
 return local.every((v,i)=>v+crownRadius/FACTORY_SCALE[i]>FACTORY_OCCUPANCY.min[i]&&v-crownRadius/FACTORY_SCALE[i]<FACTORY_OCCUPANCY.max[i])
}
