import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as T from 'three'
import ts from 'typescript'
const loadSource=async path=>{const js=ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))}
const {WORLD_CONFIG}=await loadSource('../src/universe/worldConfig.ts')
const {WORLD_SCALE}=await loadSource('../src/universe/worlds/catalog.ts')
const model=(low=false,version='v2')=>{
 const file=new URL(`../public/models/worlds/chongzhen-refined-${version}${low?'-low':''}.glb`,import.meta.url),buf=fs.readFileSync(file)
 assert.equal(buf.toString('ascii',0,4),'glTF');assert.equal(buf.readUInt32LE(8),buf.length)
 const length=buf.readUInt32LE(12),gltf=JSON.parse(buf.toString('utf8',20,20+length)),bin=28+length
 const widths={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}
 const read=(a,i,j)=>{const v=gltf.bufferViews[a.bufferView],w=widths[a.componentType],offset=bin+(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||w*components[a.type])+j*w;const value={5120:'readInt8',5121:'readUInt8',5122:'readInt16LE',5123:'readUInt16LE',5125:'readUInt32LE',5126:'readFloatLE'};let n=buf[value[a.componentType]](offset);if(a.normalized)n=a.componentType===5120?Math.max(n/127,-1):a.componentType===5121?n/255:a.componentType===5122?Math.max(n/32767,-1):n/65535;return n}
 const parents=new Map();gltf.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents.set(c,i)))
 const cache=new Map(),matrix=i=>{if(cache.has(i))return cache.get(i);const n=gltf.nodes[i],m=n.matrix?new T.Matrix4().fromArray(n.matrix):new T.Matrix4().compose(new T.Vector3(...(n.translation||[0,0,0])),new T.Quaternion(...(n.rotation||[0,0,0,1])),new T.Vector3(...(n.scale||[1,1,1])));if(parents.has(i))m.premultiply(matrix(parents.get(i)));cache.set(i,m);return m}
 let radius=0,triangles=0,courierRadius=0;const courierBounds=new T.Box3(),courierCenter=new T.Vector3(0,.34,3.4);const bounds=new T.Box3(),point=new T.Vector3()
 gltf.nodes.forEach((n,ni)=>{if(n.mesh===undefined)return;for(const p of gltf.meshes[n.mesh].primitives){for(const attr of ['POSITION','NORMAL','TEXCOORD_0','COLOR_0'])assert.notEqual(p.attributes[attr],undefined,`${attr} lost on ${n.name}`);const a=gltf.accessors[p.attributes.POSITION];triangles+=(p.indices!==undefined?gltf.accessors[p.indices].count:a.count)/3;for(let i=0;i<a.count;i++){point.set(read(a,i,0),read(a,i,1),read(a,i,2)).applyMatrix4(matrix(ni));assert.ok(point.toArray().every(Number.isFinite));radius=Math.max(radius,point.length());bounds.expandByPoint(point);let rootIndex=ni;while(parents.has(rootIndex)&&!['idea_courier','architecture_and_props','levitation_chassis'].includes(gltf.nodes[rootIndex].name))rootIndex=parents.get(rootIndex);if(gltf.nodes[rootIndex].name==='idea_courier'){courierBounds.expandByPoint(point);courierRadius=Math.max(courierRadius,point.distanceTo(courierCenter))}}}})
 return {buf,gltf,radius,triangles,bounds,courierBounds,courierRadius}
}
const detailed=model(),light=model(true)
test('harbor has finite textured 3D geometry, retained boat assemblies and bounded asset budgets',()=>{
 for(const m of [detailed,light]){
  for(const name of ['architecture_and_props','harbor_workboat_1','harbor_workboat_2','idea_courier_static'])assert.ok(m.gltf.nodes.some(n=>n.name===name),`${name} missing`)
  assert.ok(m.gltf.meshes.length<=60,'material batching regressed')
  for(let i=0;i<6;i++)assert.ok(m.gltf.materials.some(material=>material.name===`harbor_art_${i}`),'optimization merged distinct runtime illustration slots')
  assert.ok((m.gltf.extensionsRequired||[]).every(e=>e==='KHR_mesh_quantization'),'model must load without a remote decoder')
 }
 assert.ok(detailed.buf.length<13*1024*1024);assert.ok(light.buf.length<6*1024*1024)
 assert.ok(detailed.triangles>300000&&detailed.triangles<500000);assert.ok(light.triangles<160000)
})
test('both harbor LODs keep the same silhouette and fit the navigation safety envelope',()=>{
 const world=WORLD_CONFIG.find(w=>w.id==='chongzhen')
 for(const m of [detailed,light])assert.ok(m.radius*WORLD_SCALE.chongzhen+1<world.radius,`radius ${m.radius*WORLD_SCALE.chongzhen} exceeds ${world.radius}`)
 assert.ok(detailed.bounds.min.distanceTo(light.bounds.min)<.04)
 assert.ok(detailed.bounds.max.distanceTo(light.bounds.max)<.04)
})
test('all runtime harbor surface and illustration maps are shipped',()=>{
 const names=[...['plaster','stone','wood','slate','metal'].flatMap(f=>[`${f}-color.jpg`,`${f}-rough.jpg`,`${f}-normal.png`]),...Array.from({length:6},(_,i)=>`art-${i}.jpg`),'pool-color.jpg','pool-normal.png']
 for(const name of names){const b=fs.readFileSync(new URL(`../public/textures/harbor-v2/${name}`,import.meta.url));assert.ok(b.length>500);assert.ok(name.endsWith('.png')?b.subarray(1,4).toString()==='PNG':b[0]===255&&b[1]===216)}
})

const v3Detailed=model(false,'v3'),v3Light=model(true,'v3')
const {courierPose,COURIER_PERIOD,COURIER_TIMING}=await loadSource('../src/universe/worlds/harborTechnologyConfig.ts')
test('space-town LODs retain complete propulsion and courier assemblies with bounded resource costs',()=>{
 for(const m of [v3Detailed,v3Light]){
  for(const name of ['architecture_and_props','levitation_chassis','harbor_workboat_1','harbor_workboat_2','idea_courier'])assert.ok(m.gltf.nodes.some(n=>n.name===name),name)
  for(const name of ['harbor_power_core','harbor_alloy_armor','harbor_ceramic'])assert.ok(m.gltf.materials.some(n=>n.name===name),name)
  for(let i=0;i<6;i++)assert.ok(m.gltf.materials.some(n=>n.name===`harbor_art_${i}`))
  assert.ok(m.gltf.meshes.length<=85)
  assert.ok(m.radius*WORLD_SCALE.chongzhen+1<WORLD_CONFIG.find(w=>w.id==='chongzhen').radius)
  assert.ok((m.gltf.extensionsRequired||[]).every(e=>e==='KHR_mesh_quantization'))
 }
 assert.ok(v3Detailed.buf.length<14*1024*1024);assert.ok(v3Light.buf.length<7*1024*1024)
 assert.ok(v3Detailed.triangles<510000);assert.ok(v3Light.triangles<180000)
 assert.ok(v3Detailed.bounds.min.distanceTo(v3Light.bounds.min)<.04)
 assert.ok(v3Detailed.bounds.max.distanceTo(v3Light.bounds.max)<.04)
})
test('courier leaves from the central pool, clears the quay and stays in the existing flight envelope',()=>{
 const safeRadius=WORLD_CONFIG.find(w=>w.id==='chongzhen').radius/WORLD_SCALE.chongzhen
 assert.deepEqual(courierPose(0).position,[0,.34,3.4])
 assert.ok(courierPose(18).position[2]>7.5,'courier must actually fly beyond the front quay')
 assert.ok(v3Detailed.courierRadius>1)
 const keelOffset=v3Detailed.courierBounds.min.y-.34
 for(let t=0;t<COURIER_PERIOD;t+=.05){const p=courierPose(t);assert.ok(p.position.every(Number.isFinite));assert.ok(Math.hypot(...p.position)+v3Detailed.courierRadius+.2<safeRadius,'craft crosses player safety envelope');if(p.position[2]+v3Detailed.courierRadius>6.78)assert.ok(p.position[1]+keelOffset>.3,'keel hits front coping')}
})
test('courier loop returns without position, orientation or velocity jumps',()=>{
 for(const t of [0,...Object.values(COURIER_TIMING),COURIER_PERIOD]){const a=courierPose(t-1e-3),b=courierPose(t+1e-3);assert.ok(new T.Vector3(...a.position).distanceTo(new T.Vector3(...b.position))<.001);assert.ok(Math.abs(Math.sin(a.yaw)-Math.sin(b.yaw))<.001);assert.ok(Math.abs(Math.cos(a.yaw)-Math.cos(b.yaw))<.001)}
})
