// Shared authoring/runtime contract. Nose -Z, up +Y, thrust exhaust +Z.
// Navigation keeps 0.05 below the contact shell so a pushed-out vessel can depart.
// Both shells still exceed the measured 2.235 world-space model radius.
export const VESSEL_V2={scale:.76,collisionRadius:2.45,navigationClearance:2.40,revision:'spike-v2-20260928-c4-review1',
 engines:[{name:'engine_port',position:[-1.16,.10,2.06] as [number,number,number]},
          {name:'engine_starboard',position:[1.16,.10,2.06] as [number,number,number]}],
 assets:{detailed:'models/explorer/spike-explorer-v2.glb',light:'models/explorer/spike-explorer-v2-low.glb'}}

export function vesselEnergy(current:number,delta:number,{boost,speed,reduced,paused}:{boost:boolean;speed:number;reduced:boolean;paused:boolean}){
 if(paused)return current
 const target=reduced?.24:boost?1:.16+Math.min(1,Math.max(0,speed)/45)*.46
 return current+(target-current)*(1-Math.exp(-6*Math.max(0,Math.min(delta,.05))))
}
