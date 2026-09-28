import {T,mat,vec} from './geometry-v2.mjs'
import {retainConnectedSurface} from './mesh-connectivity.mjs'
import {implicitTerrain} from './implicit-terrain.mjs'
// Smooth-union living timber: roots, stem and supporting branches are one closed surface.
export function growTree(k,m,platforms){
 const segments=[];
 function limb(points,radii,flatten=1){
  const curve=new T.CatmullRomCurve3(points.map(vec)),count=Math.max(8,Math.ceil(curve.getLength()*2));
  for(let i=0;i<count;i++){
   const a=curve.getPoint(i/count),b=curve.getPoint((i+1)/count),radius=t=>{const u=t*(radii.length-1),j=Math.min(radii.length-2,Math.floor(u));return T.MathUtils.lerp(radii[j],radii[j+1],u-j)},r0=radius(i/count),r1=radius((i+1)/count),dx=b.x-a.x,dy=(b.y-a.y)/flatten,dz=b.z-a.z;
   segments.push({x:a.x,y:a.y,z:a.z,dx,dy,dz,l2:dx*dx+dy*dy+dz*dz,r0,r1,flatten,min:[Math.min(a.x,b.x)-Math.max(r0,r1)-.32,Math.min(a.y,b.y)-Math.max(r0,r1)-.32,Math.min(a.z,b.z)-Math.max(r0,r1)-.32],max:[Math.max(a.x,b.x)+Math.max(r0,r1)+.32,Math.max(a.y,b.y)+Math.max(r0,r1)+.32,Math.max(a.z,b.z)+Math.max(r0,r1)+.32]})
  }
 }
 // Root surfaces rest on the inner boundary, turn along it and taper into living groundcover.
 for(let i=0;i<9;i++){
  const a=i*Math.PI*2/9,pts=[],radii=[];
  for(let j=0;j<8;j++){const t=j/7,r=.25+t*3.8,angle=a+.14*Math.sin(t*Math.PI)+(t>.6?(t-.6)*.55:0),rr=.72*(1-t*.7)**1.1+.012;pts.push([Math.sin(angle)*r,-Math.sqrt(9.94**2-r*r)+rr*.5,Math.cos(angle)*r]);radii.push(rr)}
  limb(pts,radii,.67);

 }
 limb([[0,-9.6,0],[-.4,-7,.1],[.27,-4.3,-.2],[-.16,-1.4,-.2],[.22,1.4,-.2],[.3,4.5,0],[.15,7.5,.1]],[1.08,1.13,.98,.86,.67,.41,.035]);
 for(const side of [-1,1])limb([[0,-9.25,0],[side*.65,-7.3,-.4],[side*.84,-4.4,-.23],[side*.55,-1.7,.2],[side*.8,1.2,.28],[side*.5,3.55,.23],[side*.35,5.1,.1]],[.58,.55,.44,.39,.31,.2,.02]);
 for(const {id,p,r}of platforms){
  limb([[.15,p[1]-3.3,0],[p[0]*.17,p[1]-2.15,p[2]*.2],[p[0]*.56,p[1]-1.1,p[2]*.53],[p[0]*.9,p[1]-.37,p[2]*.88],[p[0],p[1]-.11,p[2]]],[.64,.56,.42,.24,.1]);
  for(const side of [-1,1])limb([[p[0]*.65,p[1]-.99,p[2]*.64],[p[0]+side*r*.37,p[1]-.53,p[2]*.94],[p[0]+side*r*.73,p[1]-.12,p[2]+.12]],[.26,.19,.035]);
 }
 const field=(x,y,z)=>{
  let result=3;
  for(const s of segments){if(x<s.min[0]||x>s.max[0]||y<s.min[1]||y>s.max[1]||z<s.min[2]||z>s.max[2])continue;const px=x-s.x,py=(y-s.y)/s.flatten,pz=z-s.z,t=T.MathUtils.clamp((px*s.dx+py*s.dy+pz*s.dz)/s.l2,0,1),d=Math.hypot(px-t*s.dx,py-t*s.dy,pz-t*s.dz)-(s.r0+(s.r1-s.r0)*t),blend=.22,h=Math.max(blend-Math.abs(result-d),0)/blend;result=Math.min(result,d)-h*h*blend*.25;}
  // Subtle longitudinal cambium ridges, kept much smaller than the structural silhouette.
  result+=.025*Math.sin(Math.atan2(z,x)*13+y*.8)*Math.sin(y*1.2+.5);
  return Math.max(result,Math.hypot(x,y,z)-9.94);
 }
 const wood=mat('tree_growing_wood','#ffffff',.8),base=new T.Color('#b89a70'),pale=new T.Color('#d2bd94'),shade=new T.Color('#8c7659');
 const mesh=implicitTerrain(k,'continuous_roots_trunk_and_branches',wood,field,(x,y,z,n)=>{
  const grain=.5+.5*Math.sin(Math.atan2(z,x)*17+y*.7+.8*Math.sin(y*.9));return base.clone().lerp(pale,.2+grain*.25).lerp(shade,Math.max(0,-n.y)*.12);
 },{extent:10.02,resolution:k.low?86:136});
 const connectivity=retainConnectedSurface(mesh);
 const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,z);uv.setXY(i,y< -6?r:y,Math.atan2(z,x)*Math.max(.7,Math.min(r,1.2)))}
 return {field,mesh,connectivity}
}

// Roots follow the spherical inner surface analytically; fine tips do not depend on voxel size.
export function groundRoots(k,m){
 const lengths=[5.7,7.1,4.9,7.3,6.2,6.8,5.35,6.45,5.9],plantings=[];
 function contactRoot(name,point,width){
  const rows=k.low?36:88,sides=k.low?10:18,pos=[],uv=[],idx=[];
  for(let i=0;i<=rows;i++){
   const t=i/rows,[x0,z0]=point(t),[xn,zn]=point(Math.min(1,t+.001)),[xp,zp]=point(Math.max(0,t-.001)),dx=xn-xp,dz=zn-zp,len=Math.hypot(dx,dz)||1,w=width(t),h=w*.73;
   for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,x=x0+dz/len*w*Math.cos(a),z=z0-dx/len*w*Math.cos(a),y=-Math.sqrt(Math.max(.01,9.94**2-x*x-z*z))+h*(1+Math.sin(a));pos.push(x,y,z);uv.push(t*8,j/sides*w*2);if(i<rows&&j<sides){const q=i*(sides+1)+j;idx.push(q,q+1,q+sides+1,q+1,q+sides+2,q+sides+1)}}
  }
  for(const end of [0,rows]){const center=pos.length/3,p=[0,0,0];for(let j=0;j<sides;j++)for(let a=0;a<3;a++)p[a]+=pos[(end*(sides+1)+j)*3+a]/sides;pos.push(...p);uv.push(0,0);for(let j=0;j<sides;j++){const q=end*(sides+1)+j;idx.push(...(end?[center,q,q+1]:[center,q+1,q]))}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();k.mesh(name,g,m.wood)
 }
 for(let root=0;root<9;root++){
  const base=root*Math.PI*2/9,length=lengths[root],polar=(r,a)=>new T.Vector2(Math.sin(a)*r,Math.cos(a)*r),rootCurve=new T.CubicBezierCurve(polar(.5,base),polar(length*.74,base-.08),polar(length*1.26,base+.24),polar(3.7+(root%3)*.18,base+Math.PI*2/9+.09)),point=t=>rootCurve.getPoint(t).toArray();
  const width=t=>.58*(1-t*.57)+.065;contactRoot('rounded_surface_root',point,width);
  for(const t of [.3,.47,.63,.8]){const [x,z]=point(t),y=-Math.sqrt(9.94**2-x*x-z*z)+width(t)*1.46;plantings.push([x,y+.02,z]);}
  if(root%2===0){const p0=point(.37),next=(root+1)*Math.PI*2/9,p1=[Math.sin(next)*length*.82,Math.cos(next)*length*.82],curve=new T.QuadraticBezierCurve(new T.Vector2(...p0),new T.Vector2(Math.sin(base+.47)*length*.65,Math.cos(base+.47)*length*.65),new T.Vector2(...p1));contactRoot('cross_linking_secondary_root',t=>curve.getPoint(t).toArray(),t=>.065+.17*Math.sin(Math.PI*t)**.6)}
 }
 return {plantings}
}
