import {T,vec} from './geometry-v2.mjs'
// Continuous tapered swept surface with an oval, slightly ridged cross section and arc-length UVs.
export function branch(k,name,material,points,radii){
 const curve=new T.CatmullRomCurve3(points.map(vec)),n=Math.max(k.low?5:8,Math.min(k.low?28:64,Math.ceil(curve.getLength()*(k.low?2:5)))),sides=k.low?9:16,frames=curve.computeFrenetFrames(n,false),pos=[],uv=[],idx=[],length=curve.getLength()
 for(let i=0;i<=n;i++){const t=i/n,p=curve.getPoint(t),u=t*(radii.length-1),j=Math.min(radii.length-2,Math.floor(u)),r=T.MathUtils.lerp(radii[j],radii[j+1],u-j)
  for(let s=0;s<=sides;s++){const a=s/sides*Math.PI*2,f=1+.06*Math.sin(a*5+t*4)+.035*Math.cos(a*3-t*5),v=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*r*f).addScaledVector(frames.binormals[i],Math.sin(a)*r*.89*f);pos.push(...v.toArray());uv.push(t*length,s/sides*2*Math.PI*r);if(i<n&&s<sides){const q=i*(sides+1)+s;idx.push(q,q+1,q+sides+1,q+1,q+sides+2,q+sides+1)}}
 }
 for(const end of [0,n]){const center=pos.length/3;pos.push(...curve.getPoint(end/n).toArray());uv.push(0,end/n*length);for(let s=0;s<sides;s++){const q=end*(sides+1)+s;idx.push(...(end?[center,q,q+1]:[center,q+1,q]))}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return k.mesh(name,g,material)
}
export function leafCanopy(k,m,frame,p,length,width,rotation=0){
 return k.group('leaf_canopy',p,()=>{
  const frameTube=(name,points,r,steps,sides)=>k.mesh(name,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(vec)),steps,r,sides),frame)
  const rows=k.low?12:28,cols=k.low?6:12,pos=[],uv=[],idx=[]
  const point=(t,s)=>[(s*2-1)*width*Math.pow(Math.sin(Math.PI*t),.8),.32*Math.sin(Math.PI*t)-.18*(s*2-1)**2,-length/2+t*length]
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){pos.push(...point(i/rows,j/cols));uv.push(j/cols,i/rows);if(i<rows&&j<cols){const q=i*(cols+1)+j;idx.push(q,q+cols+1,q+1,q+1,q+cols+1,q+cols+2)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();k.mesh('leaf_glass_surface',g,m)
  frameTube('leaf_spine',Array.from({length:16},(_,j)=>point(j/15,.5)),.04,k.low?16:40,k.low?5:8)
  for(const side of [0,1])frameTube('leaf_thick_rim',Array.from({length:32},(_,j)=>point(j/31,side)),.035,k.low?24:56,k.low?5:8)
  for(let r=1;r<7;r++)for(const side of [0,1])frameTube('leaf_support_vein',Array.from({length:7},(_,j)=>point(r/8+j/6*.08,.5+(side-.5)*j/6)),.017,k.low?8:20,k.low?4:6)
 },[0,rotation,0])
}
