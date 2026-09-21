export type Vector = [number, number, number]

// Swept detection prevents a boosted vessel skipping a small target between frames.
export function segmentTouchesSphere(from: Vector, to: Vector, center: Vector, radius: number): boolean {
  const delta = to.map((v, i) => v - from[i])
  const lengthSq = delta.reduce((sum, value) => sum + value * value, 0)
  const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1,
    delta.reduce((sum, value, i) => sum + (center[i] - from[i]) * value, 0) / lengthSq))
  return from.reduce((sum, value, i) => sum + (value + delta[i] * t - center[i]) ** 2, 0) <= radius ** 2
}

// Push out of a solid planet and reflect only the velocity pointing into its surface.
export function sphereContact(position: Vector, velocity: Vector, center: Vector, radius: number): { position: Vector; velocity: Vector } | null {
  const normal = position.map((v, i) => v - center[i]) as Vector
  const distance = Math.hypot(...normal)
  if (distance >= radius) return null
  if (distance < 1e-8) normal.splice(0, 3, 0, 0, 1)
  else for (let i = 0; i < 3; i++) normal[i] /= distance
  const inward = velocity.reduce((sum, v, i) => sum + v * normal[i], 0)
  return {
    position: center.map((v, i) => v + normal[i] * radius) as Vector,
    velocity: velocity.map((v, i) => inward < 0 ? v - normal[i] * inward * 1.5 : v) as Vector,
  }
}

export type NavigationBody={position:Vector;radius:number}
// Visibility graph around expanded spheres. Only five bodies; replanned at a bounded cadence.
export function navigationPath(start:Vector,end:Vector,bodies:NavigationBody[]):Vector[]{
 const distance=(a:Vector,b:Vector)=>Math.hypot(...a.map((v,i)=>v-b[i]))
 const clear=(a:Vector,b:Vector)=>bodies.every(({position:c,radius:r})=>{
  const da=distance(a,c),db=distance(b,c),radius=r+12
  if(da<radius||db<radius){const from=da<db?a:b,to=da<db?b:a;return Math.min(da,db)>r+1.5&&to.reduce((sum,v,i)=>sum+(v-from[i])*(from[i]-c[i]),0)>=0&&!segmentTouchesSphere(a,b,c,r+1.5)}
  return !segmentTouchesSphere(a,b,c,radius)
 })
 if(clear(start,end))return [start,end]
 const dirs:Vector[]=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]
 for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])dirs.push([x/Math.sqrt(3),y/Math.sqrt(3),z/Math.sqrt(3)])
 const nodes=[start,end,...bodies.flatMap(b=>dirs.map(d=>b.position.map((v,i)=>v+d[i]*(b.radius+12)*1.7) as Vector))]
 const cost=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),done=new Set<number>();cost[0]=0
 for(let k=0;k<nodes.length;k++){
  let u=-1;for(let i=0;i<nodes.length;i++)if(!done.has(i)&&(u<0||cost[i]<cost[u]))u=i
  if(u<0||!Number.isFinite(cost[u]))break
  if(u===1){const path:Vector[]=[];for(let p=1;p>=0;p=prev[p])path.unshift(nodes[p]);return path}
  done.add(u)
  for(let v=0;v<nodes.length;v++){if(done.has(v)||v===u)continue;const next=cost[u]+distance(nodes[u],nodes[v]);if(next<cost[v]&&clear(nodes[u],nodes[v])){cost[v]=next;prev[v]=u}}
 }
 return [start] // Stop rather than drive into an obstructed path.
}
