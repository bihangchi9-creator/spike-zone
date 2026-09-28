import {createRequire} from 'node:module'
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {resolve,dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {T} from '../five-worlds/geometry-v2.mjs'
import {buildVesselV2} from './model-v2.mjs'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),web=resolve(root,'web'),require=createRequire(web+'/package.json'),kit=createRequire(root+'/交付物/package.json')
const ts=require('typescript'),code=ts.transpileModule(await readFile(web+'/src/universe/vesselDesignV2.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,{VESSEL_V2}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))
const {GLTFExporter}=await import(pathToFileURL(require.resolve('three/addons/exporters/GLTFExporter.js'))),{NodeIO}=await import(pathToFileURL(kit.resolve('@gltf-transform/core'))),{ALL_EXTENSIONS}=await import(pathToFileURL(kit.resolve('@gltf-transform/extensions'))),{dedup,quantize}=await import(pathToFileURL(kit.resolve('@gltf-transform/functions')))
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),dest=web+'/public/models/explorer';await mkdir(dest,{recursive:true})
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}}
const reports=[]
for(const low of [false,true]){
 const group=buildVesselV2(low,VESSEL_V2);group.updateMatrixWorld(true);let triangles=0,maxRadius=0;const materials=[],nodes=[]
 group.traverse(o=>{nodes.push(o.name);if(!o.isMesh)return;const p=o.geometry.attributes.position;triangles+=(o.geometry.index?.count||p.count)/3;for(let i=0;i<p.count;i++)maxRadius=Math.max(maxRadius,new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).length());materials.push(o.material.name)})
 const raw=await new GLTFExporter().parseAsync(group,{binary:true}),doc=await io.readBinary(new Uint8Array(raw)),textures=[]
 async function texture(file){const image=await readFile(web+'/public/textures/explorer-v2/'+file),t=doc.createTexture(file).setImage(image).setMimeType('image/png');textures.push({file,bytes:image.length});return t}
 const paint=await texture('paint-roughness.png'),metal=await texture('titanium-roughness.png'),fabric=await texture('seat-roughness.png')
 for(const m of doc.getRoot().listMaterials()){
  if(m.getName()==='cobalt_automotive_paint')m.setMetallicRoughnessTexture(paint)
  if(m.getName()==='brushed_titanium')m.setMetallicRoughnessTexture(metal)
  if(m.getName()==='warm_neutral_upholstery')m.setMetallicRoughnessTexture(fabric)
  if(m.getName()==='Spike_wordmark'||m.getName()==='BiHangChi_nameplate'){
   m.setBaseColorTexture(await texture(m.getName()==='Spike_wordmark'?'spike-wordmark.png':'bihangchi-nameplate.png')).setAlphaMode('MASK').setAlphaCutoff(.4).setDoubleSided(false)
  }
 }
 await doc.transform(dedup({keepUniqueNames:true}),quantize({quantizePosition:16,quantizeNormal:12,quantizeTexcoord:14}))
 const binary=await io.writeBinary(doc),name='spike-explorer-v2'+(low?'-low':'')+'.glb';await writeFile(dest+'/'+name+'.tmp',binary);await rename(dest+'/'+name+'.tmp',dest+'/'+name)
 const box=new T.Box3().setFromObject(group),report={name,quality:low?'light':'detailed',bytes:binary.length,sha256:createHash('sha256').update(binary).digest('hex'),triangles,meshes:materials.length,materials:[...new Set(materials)],nodes,textures,maxModelRadius:maxRadius,worldRadius:maxRadius*VESSEL_V2.scale,collisionRadius:VESSEL_V2.collisionRadius,bounds:{min:box.min.toArray(),max:box.max.toArray()},decoder:'KHR_mesh_quantization; embedded PNG; no external decoder',inventory:group.userData.inventory}
 if(report.worldRadius>VESSEL_V2.collisionRadius-.05)throw Error('Collision envelope insufficient: '+report.worldRadius)
 reports.push(report);console.log(JSON.stringify({...report,inventory:undefined,nodes:undefined,materials:undefined,textures:undefined}))
}
await writeFile(dest+'/spike-explorer-v2.json',JSON.stringify(reports,null,2)+'\n')
