import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {NodeIO} from '@gltf-transform/core'
import {ALL_EXTENSIONS} from '@gltf-transform/extensions'
import ts from 'typescript'
import * as T from 'three'
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS)
const compile=path=>ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const {VESSEL_V2,vesselEnergy}=await import('data:text/javascript;base64,'+Buffer.from(compile('../src/universe/vesselDesignV2.ts')).toString('base64'))
const {navigationPath,sphereContact}=await import('data:text/javascript;base64,'+Buffer.from(compile('../src/universe/flightMath.ts')).toString('base64'))
const documents=await Promise.all(['detailed','light'].map(async quality=>({quality,doc:await io.read(new URL('../public/'+VESSEL_V2.assets[quality],import.meta.url).pathname)})))
function meshes(doc){const list=[];for(const node of doc.getRoot().listNodes())for(const prim of node.getMesh()?.listPrimitives()||[]){const geometry=new T.BufferGeometry(),p=prim.getAttribute('POSITION'),n=prim.getAttribute('NORMAL'),v=[],norm=[],a=[],b=[];for(let i=0;i<p.getCount();i++){p.getElement(i,a);n.getElement(i,b);v.push(...a);norm.push(...b)}geometry.setAttribute('position',new T.Float32BufferAttribute(v,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(norm,3));geometry.setIndex(Array.from(prim.getIndices().getArray()));const m=new T.Mesh(geometry,new T.MeshBasicMaterial({side:T.DoubleSide}));m.applyMatrix4(new T.Matrix4().fromArray(node.getWorldMatrix()));m.name=prim.getMaterial().getName();list.push(m)}const root=new T.Group();root.add(...list);root.updateMatrixWorld(true);return root}
test('both shipped vessel LODs fit the scaled collision envelope and have finite UV/normal data',()=>{
 for(const {doc} of documents){const root=meshes(doc),p=new T.Vector3();let radius=0;root.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);assert.ok(p.toArray().every(Number.isFinite));radius=Math.max(radius,p.length()*VESSEL_V2.scale)}});assert.ok(radius+.05<VESSEL_V2.collisionRadius)
  assert.ok(radius+.05<VESSEL_V2.navigationClearance)
  for(const mesh of doc.getRoot().listMeshes())for(const prim of mesh.listPrimitives())for(const semantic of ['NORMAL','TEXCOORD_0']){const attr=prim.getAttribute(semantic);assert.ok(attr);assert.ok(Array.from(attr.getArray()).every(Number.isFinite))}
 }
})
test('the two exported exhaust anchors clear the hull and lead into actual recessed engine geometry',()=>{
 for(const {doc} of documents){const root=meshes(doc),nodes=doc.getRoot().listNodes();for(const [index,name] of ['exhaust_port','exhaust_starboard'].entries()){
  const node=nodes.find(n=>n.getName()===name);assert.ok(node,name)
  const p=new T.Vector3().setFromMatrixPosition(new T.Matrix4().fromArray(node.getWorldMatrix()));assert.ok(Math.abs(p.x-VESSEL_V2.engines[index].position[0])<.001)
  assert.equal(new T.Raycaster(p,new T.Vector3(0,0,1),.001,3).intersectObject(root,true).length,0,'exhaust must not begin inside a rear hull plate')
  const hits=new T.Raycaster(p,new T.Vector3(0,0,-1),.001,.8).intersectObject(root,true);assert.ok(hits.length>0&&hits[0].distance>.10,'throat must have actual depth')
  for(const x of [-.31,0,.31])for(const y of [-.10,0,.10]){const near=p.clone().add(new T.Vector3(x,y,0)),inside=new T.Raycaster(near,new T.Vector3(0,0,-1),.001,.8).intersectObject(root,true);assert.ok(inside.length&&inside[0].distance>.12,'a side fairing must not cap the open throat')}
  assert.ok(nodes.some(n=>n.getMesh()?.listPrimitives().some(p=>p.getMaterial().getName()==='engine_core_'+index)))
 }}
})
test('name marks are real embedded exact-text assets, with outward surfaces on both shoulders and plaques',()=>{
 for(const {doc} of documents){
  for(const [name,file] of [['Spike_wordmark','spike-wordmark.png'],['BiHangChi_nameplate','bihangchi-nameplate.png']]){const material=doc.getRoot().listMaterials().find(m=>m.getName()===name);assert.ok(material);assert.equal(material.getAlphaMode(),'MASK');assert.deepEqual(Buffer.from(material.getBaseColorTexture().getImage()),readFileSync(new URL('../public/textures/explorer-v2/'+file,import.meta.url)))}
  const root=meshes(doc);for(const mesh of root.children.filter(m=>['Spike_wordmark','BiHangChi_nameplate'].includes(m.name))){const normals=mesh.geometry.attributes.normal,normalMatrix=new T.Matrix3().getNormalMatrix(mesh.matrixWorld),n=new T.Vector3();for(let i=0;i<normals.count;i++){n.fromBufferAttribute(normals,i).applyMatrix3(normalMatrix);assert.ok(n.y>0,'text faces must not point inside hull')}}
  const glass=doc.getRoot().listMaterials().find(m=>m.getName()==='smoked_blue_canopy');assert.equal(glass.getAlphaMode(),'BLEND');assert.ok(glass.getBaseColorFactor()[3]>.1&&glass.getBaseColorFactor()[3]<.5)
 }
})
test('propulsion response preserves pause phase and transitions smoothly between boost and reduced motion',()=>{
 let x=.16;const frame={boost:true,speed:45,reduced:false,paused:false};for(let i=0;i<120;i++)x=vesselEnergy(x,1/60,frame);assert.ok(x>.99)
 assert.equal(vesselEnergy(x,120,{...frame,paused:true}),x)
 const lowered=vesselEnergy(x,1/60,{...frame,reduced:true});assert.ok(lowered<x&&lowered>x-.1)
 for(let i=0;i<180;i++)x=vesselEnergy(x,1/60,{...frame,reduced:true});assert.ok(Math.abs(x-.24)<1e-6)
})
test('both side wordmarks and dedication plaques read forward rather than mirrored in their side views',()=>{
 for(const {doc} of documents)for(const node of doc.getRoot().listNodes())for(const prim of node.getMesh()?.listPrimitives()||[]){
  if(!['Spike_wordmark','BiHangChi_nameplate'].includes(prim.getMaterial().getName()))continue
  const position=prim.getAttribute('POSITION'),uv=prim.getAttribute('TEXCOORD_0'),indices=prim.getIndices(),matrix=new T.Matrix4().fromArray(node.getWorldMatrix())
  for(let i=0;i<indices.getCount();i+=3){const p=[],t=[];for(let j=0;j<3;j++){const a=[],b=[],id=indices.getScalar(i+j);position.getElement(id,a);uv.getElement(id,b);p.push(new T.Vector3(...a).applyMatrix4(matrix));t.push(b)}
   const e1=p[1].clone().sub(p[0]),e2=p[2].clone().sub(p[0]),du1=t[1][0]-t[0][0],dv1=t[1][1]-t[0][1],du2=t[2][0]-t[0][0],dv2=t[2][1]-t[0][1],det=du1*dv2-du2*dv1
   if(Math.abs(det)<1e-8)continue
   const textRight=e1.multiplyScalar(dv2).addScaledVector(e2,-dv1).multiplyScalar(1/det)
   assert.ok(textRight.dot(new T.Vector3(0,0,-Math.sign(p[0].x)))>0,'increasing text U must run rightward from that side of the ship')
  }
 }
})
test('navigation refuses an endpoint that fits the previous small clearance but intersects the new vessel',()=>{
 const bodies=[{position:[0,0,0],radius:10}],start=[0,0,30],end=[0,0,12]
 assert.deepEqual(navigationPath(start,end,bodies,VESSEL_V2.navigationClearance),[start])
 const contact=sphereContact(end,[0,0,-5],[0,0,0],10+VESSEL_V2.collisionRadius);assert.ok(contact.position[2]>=12.45)
 assert.deepEqual(navigationPath(start,[0,0,20],bodies,VESSEL_V2.navigationClearance),[start,[0,0,20]])
 assert.deepEqual(navigationPath(contact.position,start,bodies,VESSEL_V2.navigationClearance),[contact.position,start],'contact recovery must leave a safe outward route rather than trapping the ship on the shell')
})
test('both dedication plaques stand above their support and their exported-marker cameras have an unobstructed view',()=>{
 for(const {doc} of documents){
  const root=meshes(doc),solid=root.children.filter(m=>m.name!=='BiHangChi_nameplate')
  for(const name of ['nameplate_port','nameplate_starboard']){
   const marker=doc.getRoot().listNodes().find(n=>n.getName()===name);assert.ok(marker)
   const matrix=new T.Matrix4().fromArray(marker.getWorldMatrix()),normal=new T.Vector3(0,1,0).transformDirection(matrix)
   const center=new T.Vector3(0,.017,0).applyMatrix4(matrix),camera=center.clone().addScaledVector(normal,1)
   for(const x of [-.033,0,.033])for(const z of [-.135,0,.135]){
    const p=new T.Vector3(x,.017,z).applyMatrix4(matrix)
    const support=new T.Raycaster(p,normal.clone().negate(),.0001,.10).intersectObjects(solid,true)
    assert.ok(support.length&&support[0].object.name==='brushed_titanium'&&support[0].distance>.005&&support[0].distance<.011,'letters must sit above their plate, not intersect its tilt or the hull')
    const direction=p.clone().sub(camera),distance=direction.length()
    const obstruction=new T.Raycaster(camera,direction.normalize(),.001,distance-.003).intersectObjects(solid,true)
    assert.equal(obstruction.length,0,'the actual marker-derived close-up may not be hidden by the shoulder or canopy')
   }
  }
 }
})
test('canopy really encloses the seat with overhead clearance in each shipped LOD',()=>{
 for(const {doc} of documents){const root=meshes(doc),glass=root.children.filter(m=>m.name==='smoked_blue_canopy')
  for(const [x,z,seat] of [[0,.245,.633],[-.19,.1,.5],[.19,.1,.5],[0,-.35,.34]]){
   const top=new T.Raycaster(new T.Vector3(x,1.3,z),new T.Vector3(0,-1,0),0,1.5).intersectObjects(glass,true)
   assert.ok(top.length&&top[0].point.y>seat+.13,'the canopy should form a continuous arch above the interior')
  }
 }
})

test('the actual upper 比 and lower 十 strokes of the embedded PNG project upright on both dedication plaques',async()=>{
 const {vesselPlaqueMetrics}=await import('../../blender/explorer/inspect-vessel-joins.mjs')
 for(const {doc} of documents){const report=await vesselPlaqueMetrics(doc,VESSEL_V2.scale)
  assert.equal(report.pngSha256,'c71d4f03ef06e4299214c2e794a87c0f61281b11395afb0c009d3b91aedc7b8c','preserve the visually verified upright source glyphs')
  for(const plaque of report.plaques){assert.ok(plaque.glyphs.every(g=>g.alpha>220),'the semantic landmarks must fall on real strokes');assert.ok(plaque.upperAboveLower>.04,'比 must appear above 十 using the actual model camera');assert.ok(plaque.leftToRight>.05,'fixing V must not reverse the correct U direction')}
 }
})

test('shipped blue shoulder joins have no collapsed duplicate ring, reversed valley or detached canopy sill',async()=>{
 const {vesselJoinMetrics}=await import('../../blender/explorer/inspect-vessel-joins.mjs')
 for(const {quality,doc} of documents){const columns=quality==='light'?16:26,r=vesselJoinMetrics(doc,columns)
  assert.equal(r.seam.uniquePositions,2*(columns+1),'all transverse samples must reach the join')
  assert.equal(r.seam.vertices,r.seam.uniquePositions,'one shared longitudinal ring, not a collapsed duplicate with separate normals')
  assert.ok(r.seam.maxNormalSplitDegrees<.25)
  assert.ok(r.seam.facets.length===columns&&r.seam.maxFacetTurnDegrees<3,'local facet tangents should follow the repaired smooth bridge; preserve the polygonal transverse shoulder')
  assert.ok(r.profiles.length===columns-1&&r.maxValley<.0002,'no dip-and-rise larger than the 16-bit export quantization allowance')
  for(const join of r.canopyJoins){assert.ok(join.distance<.0002&&join.shoulderTargetError<.0002&&join.sillTargetError<.0002,'both LODs must contain the actual common canopy endpoint, within quantization error')}
 }
})

test('the canopy tail boundary has continuous position and tangent before its rear shoulder turn',async()=>{
 const {innerEdge}=await import('../../blender/explorer/hull-surfaces-v2.mjs'),h=.00001
 for(const z of [1.02,1.26]){const p=innerEdge(z),a=innerEdge(z-h),b=innerEdge(z+h),left=p.map((v,i)=>(v-a[i])/h),right=p.map((v,i)=>(b[i]-v)/h)
  assert.ok(Math.hypot(...p.map((v,i)=>v-a[i]))<.00003)
  assert.ok(Math.hypot(...left.map((v,i)=>v-right[i]))<.003,'independent one-sided derivatives must agree, not merely their positions')
 }
})
