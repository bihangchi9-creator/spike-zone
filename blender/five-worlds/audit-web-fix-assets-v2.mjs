import {createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {T} from './geometry-v2.mjs'
const require=createRequire(new URL('../../交付物/package.json',import.meta.url)),validator=require('gltf-validator'),{NodeIO}=await import(pathToFileURL(require.resolve('@gltf-transform/core'))),{ALL_EXTENSIONS}=await import(pathToFileURL(require.resolve('@gltf-transform/extensions'))),io=new NodeIO().registerExtensions(ALL_EXTENSIONS),results=[]
const out=(await readFile(new URL('../../交付物/五世界精修总计划-20260924/实施记录-20260926/latest-web-fix.txt',import.meta.url),'utf8')).trim()
for(const low of [false,true]){
 const filename=`hyundai-refined-v2${low?'-low':''}.glb`,file=new URL('../../web/public/models/worlds/'+filename,import.meta.url),bytes=await readFile(file),doc=await io.read(file.pathname),validation=await validator.validateBytes(bytes,{uri:filename,maxIssues:100});let radius=0,triangles=0,primitives=0,missingUV=0,invalid=0;const v=new T.Vector3(),a=[];
 for(const node of doc.getRoot().listNodes()){const mesh=node.getMesh();if(!mesh)continue;const matrix=new T.Matrix4().fromArray(node.getWorldMatrix());for(const p of mesh.listPrimitives()){primitives++;if(!p.getAttribute('TEXCOORD_0'))missingUV++;const pos=p.getAttribute('POSITION');triangles+=(p.getIndices()?.getCount()||pos.getCount())/3;for(let i=0;i<pos.getCount();i++){pos.getElement(i,a);v.set(...a).applyMatrix4(matrix);if(!v.toArray().every(Number.isFinite))invalid++;radius=Math.max(radius,v.length())}}}
 results.push({filename,quality:low?'light':'detailed',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),triangles,assetPrimitives:primitives,missingUV,invalid,radius,navigationFits:radius*3.4+1<33.5,validation:validation.issues});
}
const pass=results.every(r=>r.navigationFits&&r.missingUV===0&&r.invalid===0&&r.validation.numErrors===0&&r.validation.numWarnings===0);await writeFile(out+'/affected-assets-check.json',JSON.stringify({time:new Date().toISOString(),pass,results,limitation:'Asset primitives are not measured browser draw calls; no performance or shader rendering claim.'},null,2));console.log(JSON.stringify({pass,results:results.map(({validation,...r})=>({...r,errors:validation.numErrors,warnings:validation.numWarnings}))},null,2));if(!pass)process.exitCode=1
