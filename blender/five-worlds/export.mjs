import {createRequire} from 'node:module'
import {readFile,writeFile,mkdir,rename,rm} from 'node:fs/promises'
import {resolve,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {T} from './geometry.mjs'
import {buildByteDance} from './bytedance-v1.mjs'
import {buildOpenSource} from './opensource-v1.mjs'
import {buildUniversity} from './university-v1.mjs'
import {buildHyundai} from './hyundai-v1.mjs'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),web=resolve(root,'web'),require=createRequire(resolve(web,'package.json')),toolkit=createRequire(resolve(root,'交付物/package.json'))
const ts=require('typescript'),temp=resolve(web,'src/universe/worlds/.hub-motion-export.mjs')
const {NodeIO}=await import(pathToFileURL(toolkit.resolve('@gltf-transform/core'))),{ALL_EXTENSIONS}=await import(pathToFileURL(toolkit.resolve('@gltf-transform/extensions'))),{dedup,quantize}=await import(pathToFileURL(toolkit.resolve('@gltf-transform/functions')))
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),{GLTFExporter}=await import(pathToFileURL(require.resolve('three/addons/exporters/GLTFExporter.js')))
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}}
await writeFile(temp,ts.transpileModule(await readFile(resolve(web,'src/universe/worlds/hubMotion.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText)
try{
 const world=process.argv[2]||'bytedance';if(!['bytedance','opensource','university','hyundai'].includes(world))throw Error('Unknown world '+world);
 const motion=await import(pathToFileURL(temp)),reports=[],dest=resolve(web,'public/models/worlds');await mkdir(dest,{recursive:true})
 for(const low of [false,true]){
  const roadSource=await readFile(resolve(web,'src/universe/worlds/builders/motor.ts'),'utf8');const road=JSON.parse(roadSource.match(/export const motorRoad:V\[\]=(\[[^\n]+\])/)[1].replace(/(^|[^\d])\.(\d)/g,(_,a,b)=>a+'0.'+b));
  const scene=world==='bytedance'?buildByteDance(low,motion):world==='opensource'?buildOpenSource(low):world==='university'?buildUniversity(low):buildHyundai(low,road);scene.updateMatrixWorld(true);let meshes=0,triangles=0,vertices=0,invalid=0;const materials=new Set(),box=new T.Box3().setFromObject(scene)
  scene.traverse(o=>{if(!o.isMesh)return;meshes++;materials.add(o.material.name);const g=o.geometry;triangles+=(g.index?.count||g.attributes.position.count)/3;vertices+=g.attributes.position.count;for(const attr of Object.values(g.attributes))for(const v of attr.array)if(!Number.isFinite(v))invalid++})
  if(invalid)throw Error('Non-finite vertex values: '+invalid)
  const raw=await new GLTFExporter().parseAsync(scene,{binary:true}),doc=await io.readBinary(new Uint8Array(raw));await doc.transform(dedup({keepUniqueNames:true}),quantize({quantizePosition:16,quantizeNormal:10,quantizeTexcoord:14}));const bytes=await io.writeBinary(doc),filename=world+'-refined-v1'+(low?'-low':'')+'.glb';await writeFile(resolve(dest,filename+'.tmp'),bytes);await rename(resolve(dest,filename+'.tmp'),resolve(dest,filename));
  reports.push({filename,bytes:bytes.length,triangles,vertices,meshes,materials:[...materials],bounds:{min:box.min.toArray(),max:box.max.toArray()},textures:[],decoder:'No external decoder; KHR_mesh_quantization',inventory:scene.userData.inventory.reduce((a,name)=>(a[name]=(a[name]||0)+1,a),{})});console.log(JSON.stringify({...reports.at(-1),inventory:undefined}))
  const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.isMesh){gs.add(o.geometry);ms.add(o.material)}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose())
 }
 await writeFile(resolve(dest,world+'-refined-v1.json'),JSON.stringify(reports,null,2))
}finally{await rm(temp,{force:true})}
