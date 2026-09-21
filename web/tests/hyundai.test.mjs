import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const src=fs.readFileSync(new URL('../src/universe/hyundai/pose.ts',import.meta.url),'utf8')
const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText
const {HYUNDAI,hyundaiAnchor,cabinOffset}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
test('Hyundai rotating dock stays outside collision shell and cabin anchor stays inside',()=>{
 const center=[-350,85,-200]
 for(let t=0;t<10000;t+=17){
  const dock=hyundaiAnchor(center,t,HYUNDAI.dock),cabin=hyundaiAnchor(center,t,cabinOffset)
  assert.ok(Math.hypot(...dock.map((v,i)=>v-center[i]))>HYUNDAI.radius+1.8)
  assert.ok(Math.hypot(...cabin.map((v,i)=>v-center[i]))<HYUNDAI.radius)
  assert.ok(Math.abs(Math.hypot(...dock.map((v,i)=>v-center[i]))-Math.hypot(...HYUNDAI.dock))<1e-9)
 }
 assert.deepEqual(hyundaiAnchor(center,0,HYUNDAI.dock),[-334,89,-152])
})
test('Hyundai GLB contains real geometry, moving assemblies and official palette',()=>{
 const buf=fs.readFileSync(new URL('../public/models/hyundai/hyundai-world.glb',import.meta.url))
 assert.equal(buf.toString('ascii',0,4),'glTF');assert.ok(buf.length<4*1024*1024)
 const length=buf.readUInt32LE(12),gltf=JSON.parse(buf.toString('utf8',20,20+length))
 assert.ok(gltf.meshes.length>=20)
 for(const name of ['test_car_0','test_car_1','robot_joint_0','robot_joint_3'])assert.ok(gltf.nodes.some(n=>n.name===name))
 const white=gltf.materials.find(m=>m.name==='White_FFFFFF');assert.deepEqual(white.pbrMetallicRoughness.baseColorFactor??[1,1,1,1],[1,1,1,1])
 assert.ok(gltf.materials.some(m=>m.name==='Hyundai_Blue_002C5F'))
 // Evaluate the exported vertex bounds, including named assembly transforms.
 const binStart=20+length+8
 const transform=(p,n)=>{const s=n.scale||[1,1,1],q=n.rotation||[0,0,0,1],v=p.map((x,i)=>x*s[i]),[x,y,z]=v,[qx,qy,qz,qw]=q;const tx=2*(qy*z-qz*y),ty=2*(qz*x-qx*z),tz=2*(qx*y-qy*x);return [x+qw*tx+qy*tz-qz*ty,y+qw*ty+qz*tx-qx*tz,z+qw*tz+qx*ty-qy*tx].map((v,i)=>v+(n.translation?.[i]||0))}
 const parents=new Map();gltf.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents.set(c,i)))
 let max=0
 gltf.nodes.forEach((n,ni)=>{if(n.mesh===undefined)return;for(const primitive of gltf.meshes[n.mesh].primitives){const a=gltf.accessors[primitive.attributes.POSITION],v=gltf.bufferViews[a.bufferView];for(let i=0;i<a.count;i++){const offset=binStart+(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||12);let p=[0,4,8].map(d=>buf.readFloatLE(offset+d)),id=ni;while(id!==undefined){p=transform(p,gltf.nodes[id]);id=parents.get(id)}max=Math.max(max,Math.hypot(...p)*HYUNDAI.scale)}}})
 assert.ok(max<HYUNDAI.radius,`geometry radius ${max} exceeds collision radius`)
})
