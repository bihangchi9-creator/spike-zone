import { createRequire } from 'node:module'
import { readFile,writeFile,unlink,mkdir } from 'node:fs/promises'
import { fileURLToPath,pathToFileURL } from 'node:url'
import { resolve,dirname } from 'node:path'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),web=resolve(root,'web'),require=createRequire(resolve(web,'package.json')),ts=require('typescript')
const source=resolve(web,'src/universe/vesselModel.ts'),temp=resolve(web,'src/universe/.vessel-export.mjs')
await writeFile(temp,ts.transpileModule(await readFile(source,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText)
// GLTFExporter uses browser FileReader for its final binary container.
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}}
try{const {buildExplorer}=await import(pathToFileURL(temp));const {GLTFExporter}=await import(pathToFileURL(require.resolve('three/addons/exporters/GLTFExporter.js')));const group=buildExplorer(),buffer=await new GLTFExporter().parseAsync(group,{binary:true});const dest=resolve(web,'public/models/explorer');await mkdir(dest,{recursive:true});await writeFile(resolve(dest,'spike-explorer.glb'),Buffer.from(buffer));console.log('Exported',buffer.byteLength,'bytes,',group.children.length,'material groups')}finally{await unlink(temp)}
