import {createRequire} from 'node:module'
import {readFile} from 'node:fs/promises'
import {T} from './geometry-v2.mjs'
import {buildHyundai} from './hyundai-v2.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),ts=require('typescript'),code=ts.transpileModule(await readFile(new URL('../../web/src/universe/worlds/motorMotionV2.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("export { approachAngle } from './hubMotion';",''),motion=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const root=buildHyundai(false,motion.motorRoadV2,motion,{audit:true});root.updateMatrixWorld(true);const all=[];root.traverse(o=>{if(!o.isMesh)return;let max=0,at;const p=new T.Vector3();for(let i=0;i<o.geometry.attributes.position.count;i++){p.fromBufferAttribute(o.geometry.attributes.position,i).applyMatrix4(o.matrixWorld);if(p.length()>max){max=p.length();at=p.toArray()}}all.push({name:o.name,radius:max,at})});console.log(all.sort((a,b)=>b.radius-a.radius).slice(0,10))
