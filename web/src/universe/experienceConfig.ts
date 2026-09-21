// Artistic controls in seconds, radians, screen pixels and world units.
export const EXPERIENCE={entry:{desktopCount:5,mobileCount:3,duration:11,spread:3,fadeScroll:.35},journey:{launchSeconds:5.2,returnSeconds:2,repeatSeconds:1.4},flight:{cruise:32,longCruise:42}}
export function entryParticleFrame(phase:number){const t=((phase%1)+1)%1;return {travel:1-(1-t)*(1-t),alpha:Math.pow(Math.sin(Math.PI*t),.7)}}

export function advanceTime(time:number,dt:number,paused:boolean){return paused?time:time+Math.min(Math.max(dt,0),.05)}
