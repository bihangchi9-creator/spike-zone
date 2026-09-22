import {createRequire} from 'node:module'
import {readFile,writeFile,mkdir,rm} from 'node:fs/promises'
import {resolve,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),web=resolve(root,'web'),require=createRequire(resolve(web,'package.json')),ts=require('typescript'),temp=resolve(web,'src/universe/worlds/builders/.harbor-export.mjs')
const source=await readFile(resolve(web,'src/universe/worlds/builders/harborRefined.ts'),'utf8')
await writeFile(temp,ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText)
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}}
try{const {GLTFExporter}=await import(pathToFileURL(require.resolve('three/addons/exporters/GLTFExporter.js'))),{buildHarborRefined}=await import(pathToFileURL(temp));const dest=resolve(web,'public/models/worlds');await mkdir(dest,{recursive:true});const reports=[];for(const low of [false,true]){const group=buildHarborRefined(low),buffer=await new GLTFExporter().parseAsync(group,{binary:true});const filename='chongzhen-refined-v1'+(low?'-low':'')+'.glb';await writeFile(resolve(dest,filename),Buffer.from(buffer));let meshes=0,triangles=0;group.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3}});reports.push({filename,bytes:buffer.byteLength,meshes,triangles,assemblies:group.children.map(o=>o.name)});console.log(reports.at(-1))}await writeFile(resolve(dest,'chongzhen-refined-v1.json'),JSON.stringify(reports,null,2))}finally{await rm(temp,{force:true})}
