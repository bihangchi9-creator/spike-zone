import {T} from './geometry-v2.mjs'
import {branch} from './organic-v2.mjs'
// Thin curved leaves preserve canopy density without thousands of hidden sphere triangles.
export function leaf(k,name,material,p,size,angle){
 material.side=T.DoubleSide;const pos=[],uv=[],idx=[];for(let row=0;row<=4;row++)for(const side of [-1,1]){const t=row/4;pos.push((t-.5)*size,.11*size*Math.sin(t*Math.PI),side*.26*size*Math.sin(t*Math.PI));uv.push(t,(side+1)/2);if(row<4&&side<0){const q=row*2;idx.push(q,q+1,q+2,q+1,q+3,q+2)}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return k.mesh(name,g,material,p,angle);
}
export function shrub(k,m,p,size=1,seed=0){return k.group('rooted_native_shrub',p,()=>{
 const count=k.low?22:52;
 for(let stem=0;stem<3;stem++){const a=stem*2.399+seed,x=Math.sin(a)*size*.23,z=Math.cos(a)*size*.23;k.beam('shrub_stem',m.wood||m.stone,[0,0,0],[x,size*.43,z],size*.021)}
 for(let j=0;j<count;j++){
  const u=(j+.5)/count,a=j*2.399+seed,h=size*(.25+.48*u),r=size*.42*Math.sqrt(1-(u*.9)**2),x=Math.sin(a)*r,z=Math.cos(a)*r,pos=[],uv=[],idx=[];
  for(let row=0;row<=2;row++)for(const side of [-1,1]){const t=row/2;pos.push((t-.5)*size*.49,.05*size*Math.sin(t*Math.PI),side*size*.17*Math.sin(t*Math.PI));uv.push(t,(side+1)/2);if(row<2&&side<0){const q=row*2;idx.push(q,q+1,q+2,q+1,q+3,q+2)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const material=j%4?m.green||m.leaf:m.darkGreen||m.leaf2;material.side=T.DoubleSide;k.mesh('clustered_native_leaves',g,material,[x,h,z],[.22+Math.sin(j)*.36,a,.12]);
 }
})}
