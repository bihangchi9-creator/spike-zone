import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import ts from 'typescript'
import * as T from 'three'
const load=async file=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("export { approachAngle } from './hubMotion';",'')).toString('base64'))
const {hubRailPoint,hubRailPitch,hubRailYaw}=await load('../src/universe/worlds/hubMotionV2.ts')
const {approachAngle}=await load('../src/universe/worlds/hubMotion.ts')
const asset=low=>{const bytes=fs.readFileSync(new URL(`../public/models/worlds/bytedance-refined-v2${low?'-low':''}.glb`,import.meta.url));assert.equal(bytes.readUInt32LE(8),bytes.length);return {bytes,doc:JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)))}}
const high=asset(false),low=asset(true)
test('shuttle heading and pitch follow both closed tracks including elevation changes',()=>{
 for(let track=0;track<2;track++)for(let step=0;step<200;step++){
  const a=step/200*Math.PI*2,p=new T.Vector3(...hubRailPoint(track,a)),next=new T.Vector3(...hubRailPoint(track,a+.00001)),tangent=next.sub(p).normalize(),forward=new T.Vector3(0,0,1).applyEuler(new T.Euler(hubRailPitch(track,a),hubRailYaw(track,a),0,'YXZ'))
  assert.ok(tangent.dot(forward)>.99999,'shuttle drifts from rail direction')
  assert.ok(new T.Vector3(...hubRailPoint(track,a+Math.PI*2)).distanceTo(p)<1e-10,'rail seam is open')
 }
})
test('project dispatch approaches an angular stop continuously across the wrap boundary',()=>{
 let angle=6.2;const target=.12
 for(let frame=0;frame<200;frame++){const next=approachAngle(angle,target,.01);assert.ok(Math.abs(next-angle)<=.010001);angle=next}
 assert.ok(Math.abs(Math.atan2(Math.sin(target-angle),Math.cos(target-angle)))<1e-10)
 assert.equal(approachAngle(angle,target,0),angle,'paused dispatch moved')
})
test('both LODs retain UVs, normals, true transparent glazing and independently animated vehicles',()=>{
 for(const {doc}of [high,low]){
  for(const name of ['hub_shuttle_0','hub_shuttle_1','hub_shuttle_2','hub_dispatch'])assert.ok(doc.nodes.some(n=>n.name===name))
  for(const mesh of doc.meshes)for(const p of mesh.primitives){assert.notEqual(p.attributes.NORMAL,undefined);assert.notEqual(p.attributes.TEXCOORD_0,undefined)}
  assert.ok(doc.materials.some(m=>m.name==='hub_glazing'&&m.alphaMode==='BLEND'&&m.pbrMetallicRoughness.baseColorFactor[3]<.3))
  assert.ok((doc.extensionsRequired||[]).every(e=>e==='KHR_mesh_quantization'))
 }
 assert.ok(high.bytes.length<16*1024*1024);assert.ok(low.bytes.length<5*1024*1024)
})
test('microstructure maps and authentic archived header logo are shipped',()=>{
 for(const name of ['coating','aluminum','mineral','wood'])for(const ext of ['rough.jpg','normal.png'])assert.ok(fs.statSync(new URL(`../public/textures/worlds-refined-v1/${name}-${ext}`,import.meta.url)).size>1000)
 const record=JSON.parse(fs.readFileSync(new URL('../public/models/worlds/bytedance-official-header.json',import.meta.url),'utf8'));const logo=fs.readFileSync(new URL('../public/models/worlds/bytedance-official-header.png',import.meta.url));assert.equal(createHash('sha256').update(logo).digest('hex'),record.sha256)
})

test('detailed and light hub retain the same navigation envelope',()=>{
 const reports=JSON.parse(fs.readFileSync(new URL('../public/models/worlds/bytedance-refined-v2.json',import.meta.url),'utf8'))
 const min=reports.map(r=>new T.Vector3(...r.bounds.min)),max=reports.map(r=>new T.Vector3(...r.bounds.max))
 assert.ok(min[0].distanceTo(min[1])<.025);assert.ok(max[0].distanceTo(max[1])<.025)
 for(const {bytes,doc}of [high,low]){
  const parents=new Map();doc.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents.set(c,i)))
  const matrices=new Map(),matrix=i=>{if(matrices.has(i))return matrices.get(i);const n=doc.nodes[i],m=n.matrix?new T.Matrix4().fromArray(n.matrix):new T.Matrix4().compose(new T.Vector3(...(n.translation||[0,0,0])),new T.Quaternion(...(n.rotation||[0,0,0,1])),new T.Vector3(...(n.scale||[1,1,1])));if(parents.has(i))m.premultiply(matrix(parents.get(i)));matrices.set(i,m);return m}
  const binary=28+bytes.readUInt32LE(12),widths={5120:1,5121:1,5122:2,5123:2,5126:4},methods={5120:'readInt8',5121:'readUInt8',5122:'readInt16LE',5123:'readUInt16LE',5126:'readFloatLE'},point=new T.Vector3();let radius=0
  doc.nodes.forEach((node,ni)=>{if(node.mesh===undefined)return;for(const p of doc.meshes[node.mesh].primitives){const a=doc.accessors[p.attributes.POSITION],v=doc.bufferViews[a.bufferView],width=widths[a.componentType];for(let i=0;i<a.count;i++){const values=[];for(let axis=0;axis<3;axis++){const offset=binary+(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||width*3)+axis*width;let value=bytes[methods[a.componentType]](offset);if(a.normalized)value=a.componentType===5122?Math.max(-1,value/32767):a.componentType===5123?value/65535:a.componentType===5120?Math.max(-1,value/127):value/255;values.push(value)}point.set(...values).applyMatrix4(matrix(ni));radius=Math.max(radius,point.length())}}})
  assert.ok(radius*4.6+1<52,`exported hub exceeds the star-world navigation envelope: ${radius}`)
 }

})
