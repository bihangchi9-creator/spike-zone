import {createRequire} from 'node:module'
import {readFile,writeFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {T} from './geometry-v2.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),ts=require('typescript'),{GLTFLoader}=await import(pathToFileURL(require.resolve('three/addons/loaders/GLTFLoader.js')))
const source=await readFile(new URL('../../web/src/universe/worlds/motorMotionV2.ts',import.meta.url),'utf8'),code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,m=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))
const out=(await readFile(new URL('../../交付物/五世界精修总计划-20260924/实施记录-20260926/latest-web-fix.txt',import.meta.url),'utf8')).trim(),results=[]
for(const low of [false,true]){
 const file=`web/public/models/worlds/hyundai-refined-v2${low?'-low':''}.glb`,bytes=await readFile(new URL('../../'+file,import.meta.url)),{scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');scene.updateMatrixWorld(true);const meshes=[];scene.traverse(o=>{if(o.isMesh&&!o.material.transparent)meshes.push(o)});
 const shapes=[{label:'IONIQ V',center:m.cockpitPoint(m.ioniqBadgeFaceLocal),size:m.IONIQ_BADGE.letterSize.map((v,i)=>v*m.COCKPIT_SCALE[i]),yaw:0},{label:'HYUNDAI',center:m.factoryPoint(m.factoryLogoFaceLocal),size:m.FACTORY_LOGO.size.map((v,i)=>v*m.FACTORY_SCALE[i]),yaw:m.FACTORY_YAW}];
 for(const shape of shapes){
  const rotation=new T.Euler(0,shape.yaw,0),normal=new T.Vector3(0,0,1).applyEuler(rotation),right=new T.Vector3(1,0,0).applyEuler(rotation),ray=new T.Raycaster(),support=[],views=[];
  const points=[];for(let x=0;x<=8;x++)for(let y=0;y<=4;y++)points.push(new T.Vector3(...shape.center).addScaledVector(right,(x/8-.5)*shape.size[0]).add(new T.Vector3(0,(y/4-.5)*shape.size[1],0)));
  for(const p of points){ray.set(p.clone().addScaledVector(normal,.2),normal.clone().negate());ray.far=.5;const hit=ray.intersectObjects(meshes,false)[0];support.push({point:p.toArray(),gap:hit?hit.distance-.2:null,material:hit?.object.material.name})}
  for(const [name,position]of [['overview',[17,12,26]],['front',[0,8,30]],['music-project',[9,10,13]]]){
   const origin=new T.Vector3(...position),blocked=[];for(let i=0;i<points.length;i++){const d=points[i].clone().sub(origin),distance=d.length();ray.set(origin,d.normalize());ray.far=distance-.003;const hit=ray.intersectObjects(meshes,false)[0];if(hit)blocked.push({sample:i,material:hit.object.material.name,hit:hit.point.toArray(),local:m.factoryLocal(hit.point.toArray()),beforeSign:distance-hit.distance})}views.push({name,position,samples:points.length,blocked});
  }
  results.push({quality:low?'light':'detailed',file,sha256:createHash('sha256').update(bytes).digest('hex'),label:shape.label,support,views,pass:support.every(p=>p.gap!==null&&p.gap>.003&&p.gap<.03)&&views.filter(v=>shape.label==='IONIQ V'||v.name!=='music-project').every(v=>v.blocked.length===0)});
 }
}
const bindings={};for(const f of ['web/src/universe/worlds/motorMotionV2.ts','web/src/universe/worlds/WorldSigns.tsx','blender/five-worlds/hyundai-v2.mjs'])bindings[f]=createHash('sha256').update(await readFile(new URL('../../'+f,import.meta.url))).digest('hex')
const report={time:new Date().toISOString(),method:'Actual exported triangles; 45 full-plane samples including corners/edges, normal support and sightlines from unchanged overview/front/project cameras. No browser access.',bindings,results,pass:results.every(r=>r.pass)};await writeFile(out+'/visible-sign-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:results.map(r=>({...r,support:r.support.length,views:r.views.map(v=>({...v,blocked:v.blocked.length}))}))},null,2));if(!report.pass)process.exitCode=1
