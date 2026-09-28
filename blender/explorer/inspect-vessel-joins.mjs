// Read-only analysis of decoded shipped geometry. No browser or beauty-render claims.
import {T} from '../five-worlds/geometry-v2.mjs'
export function vesselJoinMetrics(doc,columns){
 const blue=[],silver=[]
 for(const node of doc.getRoot().listNodes())for(const prim of node.getMesh()?.listPrimitives()||[]){
  const name=prim.getMaterial().getName();if(!['cobalt_automotive_paint','brushed_titanium'].includes(name))continue
  const matrix=new T.Matrix4().fromArray(node.getWorldMatrix()),nm=new T.Matrix3().getNormalMatrix(matrix),pos=prim.getAttribute('POSITION'),norm=prim.getAttribute('NORMAL'),uv=prim.getAttribute('TEXCOORD_0')
  for(let i=0;i<pos.getCount();i++){const a=[],b=[],c=[];pos.getElement(i,a);norm.getElement(i,b);uv.getElement(i,c);const item={p:new T.Vector3(...a).applyMatrix4(matrix),n:new T.Vector3(...b).applyMatrix3(nm).normalize(),uv:c};(name==='brushed_titanium'?silver:blue).push(item)}
 }
 const edge=blue.filter(v=>Math.abs(v.p.z-1.55)<.0002&&Math.abs(v.p.x)>.65),clusters=[]
 for(const v of edge){let cluster=clusters.find(c=>c[0].p.distanceTo(v.p)<.0001);if(!cluster){cluster=[];clusters.push(cluster)}cluster.push(v)}
 let split=0;for(const c of clusters)for(const a of c)for(const b of c)split=Math.max(split,T.MathUtils.radToDeg(a.n.angleTo(b.n)))
 const section=(z,j)=>blue.filter(v=>v.p.x>.5&&v.p.x<1.69&&Math.abs(v.p.z-z)<.0002&&Math.abs(v.uv[0]-j/columns)<.0002)[0]?.p
 const zs=[...new Set(blue.filter(v=>v.p.x>.5&&v.p.x<1.69&&v.p.z>1.12&&v.p.z<1.81).map(v=>Math.round(v.p.z*10000)/10000))].sort((a,b)=>a-b),before=zs.filter(z=>z<1.549).at(-1),after=zs.find(z=>z>1.551)
 const facets=[]
 for(let j=0;j<columns;j++){
  const a=section(1.55,j),b=section(1.55,j+1),la=section(before,j),lb=section(before,j+1),ra=section(after,j),rb=section(after,j+1);if(!a||!b||!la||!lb||!ra||!rb)continue
  const transverse=b.clone().sub(a),longLeft=a.clone().add(b).sub(la).sub(lb),longRight=ra.clone().add(rb).sub(a).sub(b)
  facets.push({q:(j+.5)/columns,degrees:T.MathUtils.radToDeg(transverse.clone().cross(longLeft).angleTo(transverse.clone().cross(longRight)))})
 }
 const profiles=[]
 for(let j=1;j<columns;j++){
  const candidates=blue.filter(v=>v.p.x>.5&&v.p.x<1.69&&v.p.z>=1.2998&&v.p.z<=1.5502&&Math.abs(v.uv[0]-j/columns)<.0002)
  const pts=[...new Map(candidates.map(v=>[Math.round(v.p.z*10000),v.p])).values()].sort((a,b)=>a.z-b.z)
  if(pts.length>2)profiles.push({q:j/columns,points:pts.map(p=>[p.z,p.y]),valley:Math.max(0,Math.min(pts[0].y,pts.at(-1).y)-Math.min(...pts.map(p=>p.y)))})
 }
 const joins=[]
 for(const sign of [-1,1]){
  const target=new T.Vector3(sign*.094,.486,1.02),p=blue.reduce((a,b)=>a.p.distanceTo(target)<b.p.distanceTo(target)?a:b).p,other=silver.reduce((a,b)=>a.p.distanceTo(target)<b.p.distanceTo(target)?a:b).p
  joins.push({side:sign,shoulder:p.toArray(),sill:other.toArray(),distance:p.distanceTo(other),shoulderTargetError:p.distanceTo(target),sillTargetError:other.distanceTo(target)})
 }
 return {seam:{vertices:edge.length,uniquePositions:clusters.length,maxNormalSplitDegrees:split,leftSection:before,rightSection:after,facets,maxFacetTurnDegrees:Math.max(...facets.map(f=>f.degrees))},profiles,maxValley:Math.max(...profiles.map(p=>p.valley)),canopyJoins:joins}
}

export async function vesselPlaqueMetrics(doc,scale=.76){
 const {createRequire}=await import('node:module'),{createHash}=await import('node:crypto'),kit=createRequire(new URL('../../web/package.json',import.meta.url)),sharp=kit('sharp')
 const material=doc.getRoot().listMaterials().find(m=>m.getName()==='BiHangChi_nameplate'),png=Buffer.from(material.getBaseColorTexture().getImage()),{data,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true})
 // Upright PNG semantics verified against the actual alpha strokes of 毕:
 // x=245,y=70 is the upper 比 vertical; same x,y=170 is the lower 十 horizontal.
 const landmarks=[{part:'upper 比 stem',pixel:[245,70]},{part:'lower 十 crossbar',pixel:[245,170]}]
 const triangles=[]
 for(const node of doc.getRoot().listNodes())for(const prim of node.getMesh()?.listPrimitives()||[]){
  if(prim.getMaterial()!==material)continue
  const p=prim.getAttribute('POSITION'),uv=prim.getAttribute('TEXCOORD_0'),ids=prim.getIndices(),matrix=new T.Matrix4().fromArray(node.getWorldMatrix())
  for(let i=0;i<ids.getCount();i+=3){const points=[],coords=[];for(let j=0;j<3;j++){const a=[],b=[],id=ids.getScalar(i+j);p.getElement(id,a);uv.getElement(id,b);points.push(new T.Vector3(...a).applyMatrix4(matrix));coords.push(b)}triangles.push({points,coords})}
 }
 const imagePoint=(side,u,v)=>{
  for(const {points:p,coords:t} of triangles){if(Math.sign(p[0].x)!==side)continue
   const ax=t[1][0]-t[0][0],ay=t[1][1]-t[0][1],bx=t[2][0]-t[0][0],by=t[2][1]-t[0][1],px=u-t[0][0],py=v-t[0][1],d=ax*by-ay*bx,a=(px*by-py*bx)/d,b=(ax*py-ay*px)/d
   if(a<-.0001||b<-.0001||a+b>1.0001)continue
   return p[0].clone().multiplyScalar(1-a-b).addScaledVector(p[1],a).addScaledVector(p[2],b)
  }
  throw new Error('No plaque triangle covers the semantic glyph landmark')
 }
 const plaques=[]
 for(const side of [-1,1]){
  const marker=doc.getRoot().listNodes().find(n=>n.getName()==='nameplate_'+(side<0?'port':'starboard')),matrix=new T.Matrix4().fromArray(marker.getWorldMatrix()),normal=new T.Vector3(0,1,0).transformDirection(matrix),target=new T.Vector3(0,.017,0).applyMatrix4(matrix).multiplyScalar(scale)
  const camera=new T.PerspectiveCamera(35,1280/720,.025,100);camera.position.copy(target).addScaledVector(normal,.76);camera.lookAt(target);camera.updateMatrixWorld(true)
  const glyphs=landmarks.map(({part,pixel:[x,y]})=>({part,pixel:[x,y],alpha:data[(y*info.width+x)*info.channels+3],ndc:imagePoint(side,x/info.width,y/info.height).multiplyScalar(scale).project(camera).toArray()}))
  const left=imagePoint(side,.22,.5).multiplyScalar(scale).project(camera),right=imagePoint(side,.78,.5).multiplyScalar(scale).project(camera)
  plaques.push({side,glyphs,upperAboveLower:glyphs[0].ndc[1]-glyphs[1].ndc[1],leftToRight:right.x-left.x})
 }
 return {pngSha256:createHash('sha256').update(png).digest('hex'),dimensions:[info.width,info.height],plaques}
}
