export type LabelPoint = { id: string; x: number; y: number; z: number }
export function arrangeLabels(points: LabelPoint[], width: number, height: number): LabelPoint[] {
 const mobile=width<700,w=mobile?216:230,h=72
 const selected:LabelPoint[]=[]
 for(const point of points){
  const {x,y,z}=point
  if(selected.length>=(mobile?1:3))break
  if(z< -1||z>1||x<w/2+24||x>width-w/2-24||y<190||y>height-(mobile?235:125))continue
  if(!mobile&&x<330&&y<340)continue
  if(!mobile&&x>width-270&&y<255)continue
  if(selected.some(other=>Math.abs(other.x-x)<w+12&&Math.abs(other.y-y)<h+12))continue
  selected.push(point)
 }
 return selected
}
// Material uniforms can be replaced by React while the shader source survives.
export function withJourneyOpacity(source:string):string {
 if(source.includes('uniform float journeyOpacity;'))return source
 const end=source.lastIndexOf('}')
 return 'uniform float journeyOpacity;\n'+source.slice(0,end)+'gl_FragColor.a *= journeyOpacity;\n'+source.slice(end)
}
export function smoothProgress(value:number):number {
 const x=Math.max(0,Math.min(1,value))
 return x*x*(3-2*x)
}
export function launchFrame(t:number){
 return {pull:smoothProgress(t/.56),settle:smoothProgress((t-.48)/.52),portrait:1-smoothProgress((t-.24)/.3),ship:smoothProgress((t-.5)/.26)}
}
