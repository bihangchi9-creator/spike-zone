// Asset-only inspection; never launches a browser or claims a measured frame rate.
import {createRequire} from 'node:module'
import {readFile,writeFile} from 'node:fs/promises'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),kit=createRequire(root+'/交付物/package.json'),validator=kit('gltf-validator')
const {NodeIO}=await import(pathToFileURL(kit.resolve('@gltf-transform/core'))),{ALL_EXTENSIONS}=await import(pathToFileURL(kit.resolve('@gltf-transform/extensions'))),io=new NodeIO().registerExtensions(ALL_EXTENSIONS)
const reports=[]
for(const file of ['spike-explorer-v2.glb','spike-explorer-v2-low.glb']){
 const path=root+'/web/public/models/explorer/'+file,data=await readFile(path),validation=await validator.validateBytes(new Uint8Array(data),{uri:file,maxIssues:100}),doc=await io.read(path)
 const nodes=doc.getRoot().listNodes(),materials=doc.getRoot().listMaterials(),sourceStats=JSON.parse(await readFile(root+'/web/public/models/explorer/spike-explorer-v2.json','utf8')).find(s=>s.name===file)
 reports.push({file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),validation:validation.issues,
  metadataMatches:sourceStats.sha256===createHash('sha256').update(data).digest('hex'),
  anchors:nodes.filter(n=>n.getName().startsWith('exhaust_')).map(n=>({name:n.getName(),matrix:n.getWorldMatrix()})),
  materials:materials.map(m=>({name:m.getName(),color:m.getBaseColorFactor(),metalness:m.getMetallicFactor(),roughness:m.getRoughnessFactor(),alphaMode:m.getAlphaMode(),doubleSided:m.getDoubleSided(),texture:m.getBaseColorTexture()?.getName(),roughnessTexture:m.getMetallicRoughnessTexture()?.getName()})),
  textures:doc.getRoot().listTextures().map(t=>({name:t.getName(),mime:t.getMimeType(),size:t.getSize(),bytes:t.getImage()?.length})),
  triangles:doc.getRoot().listMeshes().reduce((sum,m)=>sum+m.listPrimitives().reduce((s,p)=>s+(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3,0),0),
  assetPrimitives:doc.getRoot().listMeshes().reduce((sum,m)=>sum+m.listPrimitives().length,0),note:'Asset primitives are not measured browser draw calls.'})
}
const output=process.argv[2]||root+'/交付物/主飞船-Spike航驰-v2-20260927/建模实施记录/gltf-validation.json'
await writeFile(output,JSON.stringify(reports,null,2)+'\n')
for(const r of reports)console.log(r.file,{errors:r.validation.numErrors,warnings:r.validation.numWarnings,metadataMatches:r.metadataMatches,triangles:r.triangles,primitives:r.assetPrimitives})
if(reports.some(r=>r.validation.numErrors||r.validation.numWarnings||!r.metadataMatches))process.exitCode=1
