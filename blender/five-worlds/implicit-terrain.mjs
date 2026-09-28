import {T} from './geometry.mjs'
export const sdBox=(x,y,z,bx,by,bz)=>{const qx=Math.abs(x)-bx,qy=Math.abs(y)-by,qz=Math.abs(z)-bz;return Math.hypot(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0)}
export const smoothMax=(a,b,k=.2)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.max(a,b)+h*h*k*.25}
// Closed isosurface of signed-distance solids. The extraction cuts real openings and avoids
// dragging a sphere's sparse triangles across room cavities / road switchbacks.
export function implicitTerrain(k,name,material,field,colorAt,{extent=10.2,resolution=k.low?68:108}={}){
 const n=resolution,side=n+1,plane=side*side,step=extent*2/n,fieldValues=new Float32Array(side**3),offsets=[0,1,side,side+1,plane,plane+1,plane+side,plane+side+1],tetra=[[0,1,3,7],[0,3,2,7],[0,2,6,7],[0,6,4,7],[0,4,5,7],[0,5,1,7]],edges=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]
 const index=(x,y,z)=>x+side*y+plane*z
 for(let z=0;z<=n;z++)for(let y=0;y<=n;y++)for(let x=0;x<=n;x++)fieldValues[index(x,y,z)]=field(-extent+x*step,-extent+y*step,-extent+z*step)
 const position=[],normal=[],uv=[],colors=[]
 const gradient=(x,y,z)=>{const dx=(fieldValues[index(Math.min(n,x+1),y,z)]-fieldValues[index(Math.max(0,x-1),y,z)]),dy=(fieldValues[index(x,Math.min(n,y+1),z)]-fieldValues[index(x,Math.max(0,y-1),z)]),dz=(fieldValues[index(x,y,Math.min(n,z+1))]-fieldValues[index(x,y,Math.max(0,z-1))]);return new T.Vector3(dx,dy,dz).normalize()}
 const corner=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]]
 const emit=(a,b,c)=>{const face=b.p.clone().sub(a.p).cross(c.p.clone().sub(a.p)),expected=a.n.clone().add(b.n).add(c.n);if(face.dot(expected)<0)[b,c]=[c,b];for(const q of [a,b,c]){position.push(...q.p.toArray());normal.push(...q.n.toArray());const ab=q.n.toArray().map(Math.abs),axis=ab.indexOf(Math.max(...ab));uv.push(axis===0?q.p.z:q.p.x,axis===1?q.p.z:q.p.y);colors.push(...colorAt(q.p.x,q.p.y,q.p.z,q.n).toArray())}}
 for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const start=index(x,y,z),values=offsets.map(o=>fieldValues[start+o]);if(values.every(v=>v>=0)||values.every(v=>v<0))continue
  const cp=corner.map(c=>new T.Vector3(-extent+(x+c[0])*step,-extent+(y+c[1])*step,-extent+(z+c[2])*step)),gn=corner.map(c=>gradient(x+c[0],y+c[1],z+c[2]))
  for(const t of tetra){const verts=[];for(const [e0,e1]of edges){const a=t[e0],b=t[e1];if((values[a]<0)===(values[b]<0))continue;const f=values[a]/(values[a]-values[b]);verts.push({p:cp[a].clone().lerp(cp[b],f),n:gn[a].clone().lerp(gn[b],f).normalize()})}if(verts.length===3)emit(...verts);else if(verts.length===4){const center=verts.reduce((a,v)=>a.add(v.p),new T.Vector3()).multiplyScalar(.25),axis=verts[0].p.clone().sub(center).normalize(),norm=verts.reduce((a,v)=>a.add(v.n),new T.Vector3()).normalize(),second=norm.clone().cross(axis);verts.sort((a,b)=>Math.atan2(a.p.clone().sub(center).dot(second),a.p.clone().sub(center).dot(axis))-Math.atan2(b.p.clone().sub(center).dot(second),b.p.clone().sub(center).dot(axis)));emit(verts[0],verts[1],verts[2]);emit(verts[0],verts[2],verts[3])}}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(position,3));g.setAttribute('normal',new T.Float32BufferAttribute(normal,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));material.vertexColors=true;return k.mesh(name,g,material)
}
