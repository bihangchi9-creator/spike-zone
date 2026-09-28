import {createRequire} from 'node:module'
import {readFile,writeFile,mkdir,rm} from 'node:fs/promises'
import {resolve,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
const web=resolve(root,'web'),require=createRequire(resolve(web,'package.json'))
const ts=require('typescript'),T=await import(pathToFileURL(require.resolve('three')))
const temp=resolve(web,'src/universe/worlds/builders/.harbor-v3-export.mjs')
// Reuse the already installed local modeling toolkit, or install the adjacent package.json.
let toolkit=createRequire(import.meta.url)
try{toolkit.resolve('@gltf-transform/core')}catch{toolkit=createRequire(resolve(root,'交付物/package.json'))}
const {NodeIO}=await import(pathToFileURL(toolkit.resolve('@gltf-transform/core')))
const {ALL_EXTENSIONS}=await import(pathToFileURL(toolkit.resolve('@gltf-transform/extensions')))
const {dedup,quantize}=await import(pathToFileURL(toolkit.resolve('@gltf-transform/functions')))
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS)
const source=await readFile(resolve(web,'src/universe/worlds/builders/harborRefinedV3.ts'),'utf8')
await writeFile(temp,ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText)
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}}
try{
 const {GLTFExporter}=await import(pathToFileURL(require.resolve('three/addons/exporters/GLTFExporter.js')))
 const {buildHarborRefinedV3}=await import(pathToFileURL(temp))
 const dest=resolve(web,'public/models/worlds');await mkdir(dest,{recursive:true});const reports=[]
 for(const low of [false,true]){
  const group=buildHarborRefinedV3(low);group.updateMatrixWorld(true)
  let radius=0,meshes=0,triangles=0;const point=new T.Vector3()
  group.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){point.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);radius=Math.max(radius,point.length())}}})
  const buffer=await new GLTFExporter().parseAsync(group,{binary:true})
  const document=await io.readBinary(new Uint8Array(buffer))
  await document.transform(dedup({keepUniqueNames:true}),quantize({quantizePosition:16,quantizeNormal:10,quantizeTexcoord:14,quantizeColor:8}))
  const compact=await io.writeBinary(document),filename='chongzhen-refined-v3'+(low?'-low':'')+'.glb'
  // Write complete assets atomically so a dev-page reload never sees a half-written GLB.
  const pending=resolve(dest,filename+'.tmp');await writeFile(pending,compact)
  const {rename}=await import('node:fs/promises');await rename(pending,resolve(dest,filename))
  reports.push({filename,bytes:compact.byteLength,rawBytes:buffer.byteLength,meshes,triangles,radius:+radius.toFixed(4),quantization:'16-bit positions, 10-bit normals; no external decoder',assemblies:group.children.map(o=>o.name)})
  console.log(reports.at(-1))
 }
 await writeFile(resolve(dest,'chongzhen-refined-v3.json'),JSON.stringify(reports,null,2))
}finally{await rm(temp,{force:true})}
