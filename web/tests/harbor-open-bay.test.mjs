import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import * as T from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'

test('both exported LODs have an unobstructed bay mouth, water to the edge and intact side quays',async()=>{
 for(const suffix of ['', '-low']){
  const bytes=await readFile(new URL(`../public/models/worlds/chongzhen-refined-v3${suffix}.glb`,import.meta.url))
  const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')
  scene.updateMatrixWorld(true)
  const fixed=[scene.getObjectByName('architecture_and_props'),scene.getObjectByName('levitation_chassis')]
  assert.ok(fixed.every(Boolean))
  fixed.forEach(group=>group.traverse(o=>{if(o.isMesh)o.material.side=T.DoubleSide}))
  for(const x of [-1.55,0,1.55])for(const y of [-1.6,-.6,-.2,.075]){
   const ray=new T.Raycaster(new T.Vector3(x,y,5.6),new T.Vector3(0,0,1),0,2.7)
   const hits=ray.intersectObjects(fixed,true)
   assert.equal(hits.length,0,`${suffix||'detailed'}: bay blocked at x=${x}, y=${y} by ${hits[0]?.object.name}`)
  }
  for(const x of [-1.4,0,1.4]){
   const ray=new T.Raycaster(new T.Vector3(x,1,7.4),new T.Vector3(0,-1,0),0,3)
   const water=ray.intersectObjects(fixed,true).find(hit=>hit.object.material.name==='harbor_pool')
   assert.ok(water,'water must reach the open outer edge')
   assert.ok(Math.abs(water.point.y+.635)<.015,'water level must remain continuous')
   assert.equal(ray.intersectObjects(fixed,true).filter(hit=>hit.object.material.name!=='harbor_pool').length,0,'the last water lip must float beyond its solid bed')
  }
  for(const x of [-3.15,3.15]){
   const ray=new T.Raycaster(new T.Vector3(x,1,7),new T.Vector3(0,-1,0),0,3)
   assert.ok(ray.intersectObjects(fixed,true).some(hit=>hit.object.material.name==='harbor_stone_paving'),'side quay lost its walking surface')
  }
  scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}})
 }
})
