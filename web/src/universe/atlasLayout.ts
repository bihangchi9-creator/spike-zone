export type AtlasLabel={id:string;x:number;y:number;lx:number;ly:number}
// Label boxes live in atlas units; leader lines keep a displaced label tied to its true position.
export function atlasLabels(points:{id:string;x:number;y:number}[]):AtlasLabel[]{
 const result:AtlasLabel[]=[]
 for(const p of points){
  const offsets=[[20,24],[-182,24],[20,-76],[-182,-76],[20,88],[-182,88],[20,-140],[-182,-140]]
  const slots=offsets.map(([dx,dy])=>({lx:Math.max(12,Math.min(818,p.x+dx)),ly:Math.max(65,Math.min(577,p.y+dy))}))
  const score=(slot:{lx:number;ly:number})=>result.reduce((sum,r)=>sum+(Math.abs((slot.lx+80)-(r.lx+80))<170&&Math.abs((slot.ly+24)-(r.ly+24))<57?1:0),0)+points.filter(q=>q.id!==p.id&&q.x>slot.lx-12&&q.x<slot.lx+172&&q.y>slot.ly-15&&q.y<slot.ly+65).length
  slots.sort((a,b)=>score(a)-score(b));result.push({...p,...slots[0]})
 }
 return result
}
