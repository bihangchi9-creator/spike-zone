import {createRequire} from 'node:module'
import {readFile,writeFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {T} from './geometry-v2.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),ts=require('typescript'),{GLTFLoader}=await import(pathToFileURL(require.resolve('three/addons/loaders/GLTFLoader.js')))
const load=async f=>{const code=ts.transpileModule(await readFile(new URL('../../web/src/universe/worlds/'+f,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))}
const motor=await load('motorMotionV2.ts'),campus=await load('campusSurfaceV2.ts'),destination=process.argv.includes('--output-dir')?process.argv[process.argv.indexOf('--output-dir')+1]:(await readFile(new URL('../../交付物/五世界精修总计划-20260924/实施记录-20260926/latest-integration-fix.txt',import.meta.url),'utf8')).trim(),surfaces=[],plantChecks=[],mountChecks=[],bindings={};
function probe(scene,label,position,size,yaw){
 const origin=new T.Vector3(...position),rotation=new T.Euler(0,yaw,0),normal=new T.Vector3(0,0,1).applyEuler(rotation),right=new T.Vector3(1,0,0).applyEuler(rotation),opaque=[];scene.traverse(o=>{if(o.isMesh&&!o.material.transparent)opaque.push(o)});const ray=new T.Raycaster(),samples=[];
 for(let x=0;x<=8;x++)for(let y=0;y<=4;y++){
  const point=origin.clone().addScaledVector(right,(x/8-.5)*size[0]);point.y+=(y/4-.5)*size[1];ray.set(point.clone().addScaledVector(normal,.25),normal.clone().negate());ray.far=1.25;
  const hit=ray.intersectObjects(opaque,false)[0];samples.push({x:x/8-.5,y:y/4-.5,position:point.toArray(),gap:hit?hit.distance-.25:null,material:hit?.object.material.name});
 }
 return {label,samples: samples.length,minGap:Math.min(...samples.filter(s=>s.gap!==null).map(s=>s.gap)),maxGap:Math.max(...samples.filter(s=>s.gap!==null).map(s=>s.gap)),allSupportedAndClear:samples.every(s=>s.gap!==null&&s.gap>.003&&s.gap<.045),points:samples}
}
for(const world of ['hyundai','university'])for(const low of [false,true]){
 const file=`web/public/models/worlds/${world}-refined-v2${low?'-low':''}.glb`,bytes=await readFile(new URL('../../'+file,import.meta.url));bindings[file]=createHash('sha256').update(bytes).digest('hex');const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');scene.updateMatrixWorld(true);const quality=low?'light':'detailed';
 if(world==='hyundai'){
  surfaces.push({world,quality,...probe(scene,'music-waveform',motor.cockpitPoint(motor.musicOverlayLocal),[motor.MUSIC_SCREEN.size[0]*motor.COCKPIT_SCALE[0],motor.MUSIC_SCREEN.size[1]*motor.COCKPIT_SCALE[1]],0)});
  surfaces.push({world,quality,...probe(scene,'official-Hyundai-logo',motor.factoryPoint(motor.factoryLogoFaceLocal),[motor.FACTORY_LOGO.size[0]*motor.FACTORY_SCALE[0],motor.FACTORY_LOGO.size[1]*motor.FACTORY_SCALE[1]],motor.FACTORY_YAW)});
  let checked=0,interior=0,occupation=0,interiorTriangles=0,occupationTriangles=0;const examples=[],point=new T.Vector3(),innerBox=new T.Box3(new T.Vector3(-6.6,1.38,3.25),new T.Vector3(-1.2,3.5,6.8)),outerBox=new T.Box3(new T.Vector3(...motor.FACTORY_OCCUPANCY.min),new T.Vector3(...motor.FACTORY_OCCUPANCY.max));
  scene.traverse(o=>{if(!o.isMesh||!/^motor_coastal_leaf/.test(o.material.name))return;const vertices=[];for(let i=0;i<o.geometry.attributes.position.count;i++){point.fromBufferAttribute(o.geometry.attributes.position,i).applyMatrix4(o.matrixWorld);const p=motor.factoryLocal(point.toArray()),local=new T.Vector3(...p);vertices.push(local);checked++;if(innerBox.containsPoint(local))interior++;if(outerBox.containsPoint(local)){occupation++;if(examples.length<10)examples.push(p)}}const index=o.geometry.index,count=index?.count||vertices.length;for(let i=0;i<count;i+=3){const t=new T.Triangle(...[0,1,2].map(j=>vertices[index?index.getX(i+j):i+j]));if(innerBox.intersectsTriangle(t))interiorTriangles++;if(outerBox.intersectsTriangle(t))occupationTriangles++}});
  plantChecks.push({quality,checkedLeafVertices:checked,assemblyInteriorVertices:interior,fullFactoryOccupationVertices:occupation,assemblyIntersectingTriangles:interiorTriangles,fullFactoryIntersectingTriangles:occupationTriangles,pass:interior===0&&occupation===0&&interiorTriangles===0&&occupationTriangles===0,examples});
 }else{
  const sign=campus.THEATRE_SIGN;surfaces.push({world,quality,...probe(scene,'Qu-Bochuan-title',sign.position,sign.size,sign.rotation[1])});
  const rotation=new T.Euler(...sign.rotation),normal=new T.Vector3(0,0,1).applyEuler(rotation),origin=new T.Vector3(...sign.position),walls=[];scene.traverse(o=>{if(o.isMesh&&o.material.name==='campus_pale_stone')walls.push(o)});const ray=new T.Raycaster(),checks=[];
  for(const x of [-1.04,1.04])for(const y of [-.18,.18]){const back=-sign.faceGap-sign.plateSize[2],point=new T.Vector3(x,y,back).applyEuler(rotation).add(origin),start=campus.theatreWallBehindSign(x)-.02,length=back-start;ray.set(point,normal.clone().negate());ray.far=.5;const hit=ray.intersectObjects(walls,false)[0],penetration=hit?length-hit.distance:null;checks.push({x,y,supportLength:length,wallDistance:hit?.distance,penetration,pass:penetration!==null&&penetration>.003&&penetration<.065})}
  mountChecks.push({quality,points:checks,pass:checks.every(c=>c.pass)});
 }
 const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.isMesh){gs.add(o.geometry);ms.add(o.material)}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());
}
for(const f of ['web/src/universe/worlds/DesignedModel.tsx','web/src/universe/worlds/WorldSigns.tsx','web/src/universe/worlds/motorMotionV2.ts','web/src/universe/worlds/campusSurfaceV2.ts','blender/five-worlds/hyundai-v2.mjs','blender/five-worlds/university-v2.mjs','blender/five-worlds/campus-curves-v2.mjs'])bindings[f]=createHash('sha256').update(await readFile(new URL('../../'+f,import.meta.url))).digest('hex');
const report={time:new Date().toISOString(),method:'Actual exported GLB, depth-tested opaque triangle rays. 9x5 grid includes all corners, edge midpoints and center. No browser or rendering-policy bypass.',bindings,surfaces,plantChecks,mountChecks,pass:surfaces.every(s=>s.allSupportedAndClear)&&plantChecks.every(c=>c.pass)&&mountChecks.every(c=>c.pass),limitation:'Tests surface clearance/support and plant occupancy only; GPU readability, shadows and transparency remain unverified.'};await writeFile(destination+'/actual-glb-surface-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,bindings:undefined,surfaces:surfaces.map(({points,...s})=>s)},null,2));if(!report.pass)process.exitCode=1;
