import {T} from './geometry-v2.mjs'
// Isosurface cleanup only: remove disconnected numeric fragments, never conceal them with effects.
export function retainConnectedSurface(mesh){
 const g=mesh.geometry,p=g.attributes.position,count=p.count/3,parent=Int32Array.from({length:count},(_,i)=>i),vertex=new Map(),find=x=>{while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x]}return x};
 for(let i=0;i<p.count;i++){const tri=Math.floor(i/3),key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*100000)).join(','),prior=vertex.get(key);if(prior===undefined)vertex.set(key,tri);else{const a=find(prior),b=find(tri);if(a!==b)parent[b]=a}}
 const sizes=new Map();for(let i=0;i<count;i++){const root=find(i);sizes.set(root,(sizes.get(root)||0)+1)}
 const ranked=[...sizes].sort((a,b)=>b[1]-a[1]),keep=ranked[0][0],next=new T.BufferGeometry();let removed=0;
 for(const [name,attribute]of Object.entries(g.attributes)){const values=[];for(let tri=0;tri<count;tri++){if(find(tri)!==keep)continue;for(let j=0;j<3*attribute.itemSize;j++)values.push(attribute.array[tri*3*attribute.itemSize+j])}next.setAttribute(name,new T.Float32BufferAttribute(values,attribute.itemSize))}
 removed=count-ranked[0][1];mesh.geometry=next;g.dispose();return {componentsBefore:sizes.size,componentTriangles:ranked.map(x=>x[1]),removedTriangles:removed,componentsAfter:1}
}
