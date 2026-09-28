import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
import * as T from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
const load=async file=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'))
const motor=await load('../src/universe/worlds/motorMotionV2.ts'),campus=await load('../src/universe/worlds/campusSurfaceV2.ts')
test('factory geometry and official sign use an invertible rigid placement after local scaling',()=>{
 for(const p of [[-7,1.2,7.1],[-3.9,5.23,7.11],[-1.2,3.3,4.7]]){
  const restored=motor.factoryLocal(motor.factoryPoint(p));assert.ok(Math.hypot(...restored.map((v,i)=>v-p[i]))<1e-10)
 }
 const pose=campus.campusRoomPose(-4.4,.15,5.3,-3.6,7.91),normal=new T.Vector3(0,0,1).applyEuler(new T.Euler(0,pose.yaw,0)),right=new T.Vector3(1,0,0).applyEuler(new T.Euler(0,pose.yaw,0));assert.ok(Math.abs(normal.dot(right))<1e-12);assert.ok(Math.abs(normal.length()-1)<1e-12)
 const e=.0001,derivative=(campus.campusRoomOffset(-4.4+e,-3.6,7.91)-campus.campusRoomOffset(-4.4-e,-3.6,7.91))/(2*e);assert.ok(right.dot(new T.Vector3(1,0,derivative).normalize())>.999999)
})
for(const [id,scale,radius,names]of [
 ['opensource',4.65,50,['tree_lift','tree_pod_0','tree_pod_1']],
 ['university',4.5,54,['campus_ball']],
 ['hyundai',3.4,33.5,['motor_car_0','motor_car_1','motor_car_2','motor_arm_-1','motor_arm_1']],
])test(`${id}: both exported LODs preserve movable assemblies, UVs and navigation clearance`,async()=>{
 for(const low of [false,true]){
  const bytes=fs.readFileSync(new URL(`../public/models/worlds/${id}-refined-v2${low?'-low':''}.glb`,import.meta.url)),{scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');scene.updateMatrixWorld(true)
  for(const name of names)assert.ok(scene.getObjectByName(name),`${name} missing`)
  let maximum=0;const point=new T.Vector3(),gs=new Set(),ms=new Set();scene.traverse(o=>{if(!o.isMesh)return;const g=o.geometry;assert.ok(g.attributes.normal&&g.attributes.uv);gs.add(g);ms.add(o.material);for(let i=0;i<g.attributes.position.count;i++){point.fromBufferAttribute(g.attributes.position,i).applyMatrix4(o.matrixWorld);assert.ok(point.toArray().every(Number.isFinite));maximum=Math.max(maximum,point.length())}})
  assert.ok(maximum*scale+1<radius,`${id} ${low?'light':'detailed'} radius ${maximum} exceeds the navigation envelope`)
  if(id==='opensource')assert.ok(maximum<10.055,'tree components protrude outside the 10.05 atmosphere boundary')
  gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose())
 }
})
