import { createRequire } from 'node:module'
import { readFile,writeFile,unlink,mkdir } from 'node:fs/promises'
import { fileURLToPath,pathToFileURL } from 'node:url'
import { resolve,dirname } from 'node:path'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),web=resolve(root,'web'),require=createRequire(resolve(web,'package.json')),ts=require('typescript')
const source=resolve(web,'src/universe/hyundai/model.ts'),temp=resolve(web,'src/universe/hyundai/.model-export.mjs')
await writeFile(temp,ts.transpileModule(await readFile(source,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText)
// GLTFExporter uses browser FileReader for its final binary container.
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}}
try{const {buildHyundai}=await import(pathToFileURL(temp));const {GLTFExporter}=await import(pathToFileURL(require.resolve('three/addons/exporters/GLTFExporter.js')));const group=buildHyundai(),buffer=await new GLTFExporter().parseAsync(group,{binary:true});const dest=resolve(web,'public/models/hyundai');await mkdir(dest,{recursive:true});await writeFile(resolve(dest,'hyundai-world.glb'),Buffer.from(buffer));let meshes=0,triangles=0;group.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3}});console.log({bytes:buffer.byteLength,meshes,triangles})}finally{await unlink(temp)}
