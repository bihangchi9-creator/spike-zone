import {createRequire} from 'node:module'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {T} from './geometry.mjs'
const require=createRequire(new URL('../../交付物/package.json',import.meta.url)),validator=require('gltf-validator'),{NodeIO}=await import(pathToFileURL(require.resolve('@gltf-transform/core'))),{ALL_EXTENSIONS}=await import(pathToFileURL(require.resolve('@gltf-transform/extensions'))),io=new NodeIO().registerExtensions(ALL_EXTENSIONS),result=[]
for(const world of ['bytedance','opensource','university','hyundai'])for(const low of [false,true]){
 const name=`${world}-refined-v1${low?'-low':''}.glb`,path=new URL('../../web/public/models/worlds/'+name,import.meta.url),data=await readFile(path),validation=await validator.validateBytes(new Uint8Array(data),{uri:name,maxIssues:100}),doc=await io.read(fileURLToPath(path));let radius=0,triangles=0,missingUV=0,nonFinite=0,draws=0;const point=new T.Vector3(),a=[]
 for(const node of doc.getRoot().listNodes()){const mesh=node.getMesh();if(!mesh)continue;const matrix=new T.Matrix4().fromArray(node.getWorldMatrix());for(const prim of mesh.listPrimitives()){draws++;if(!prim.getAttribute('TEXCOORD_0'))missingUV++;const position=prim.getAttribute('POSITION');triangles+=(prim.getIndices()?.getCount()||position.getCount())/3;for(let i=0;i<position.getCount();i++){position.getElement(i,a);point.set(...a).applyMatrix4(matrix);if(!point.toArray().every(Number.isFinite))nonFinite++;radius=Math.max(radius,point.length())}}}
 const envelope={bytedance:[52,4.6],opensource:[50,4.65],university:[54,4.5],hyundai:[33.5,3.4]}[world];
 result.push({world,navigation:{worldRadius:envelope[0],currentScale:envelope[1],modelRadiusAtCurrentScale:radius*envelope[1],fitsWithOneUnitClearance:radius*envelope[1]+1<envelope[0],maximumScaleWithOneUnitClearance:(envelope[0]-1)/radius},quality:low?'light':'detailed',filename:name,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),triangles,assetPrimitiveCount:draws,radius,missingUV,nonFinite,validation:validation.issues,note:'Asset primitive count is not measured browser draw calls. No browser timing measured.'});console.log(name,'errors',validation.issues.numErrors,'warnings',validation.issues.numWarnings,'radius',radius.toFixed(3))
}
await writeFile(new URL('../../交付物/五世界精修总计划-20260924/实施记录-20260926/asset-audit.json',import.meta.url),JSON.stringify(result,null,2))
if(result.some(r=>r.validation.numErrors||r.missingUV||r.nonFinite))process.exitCode=1
