import {createRequire} from 'node:module'
import {readFile,writeFile} from 'node:fs/promises'
import {T} from './geometry-v2.mjs'
import {buildByteDance} from './bytedance-v2.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),ts=require('typescript'),code=ts.transpileModule(await readFile(new URL('../../web/src/universe/worlds/hubMotionV2.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("export { approachAngle } from './hubMotion';",''),motion=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))
const root=buildByteDance(true,motion,{audit:true});root.updateMatrixWorld(true)
const staticRoot=root.children.find(o=>o.name==='architecture'),objects=[]
staticRoot.traverse(o=>{if(o.isMesh&&!/boxed_track_girder|continuous_running_rail|track_cross_tie/.test(o.name)){o.geometry.computeBoundingBox();objects.push({mesh:o,bounds:o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)})}})
// A conservative solid cabin envelope, excluding wheels contacting the rail by design.
const cabin=new T.Box3(new T.Vector3(-.38,.23,-.85),new T.Vector3(.38,1.06,.85)),hits=[];let sweepRadius=0,sweepAt=0
for(let track=0;track<2;track++)for(let step=0;step<360;step++){
 const angle=step/360*Math.PI*2,p=motion.hubRailPoint(track,angle),pose=new T.Matrix4().compose(new T.Vector3(p[0],p[1]+.112,p[2]),new T.Quaternion().setFromEuler(new T.Euler(motion.hubRailPitch(track,angle),motion.hubRailYaw(track,angle),0,'YXZ')),new T.Vector3(1,1,1)),worldBounds=cabin.clone().applyMatrix4(pose),inverse=pose.clone().invert()
 for(const x of [-.38,.38])for(const y of [.23,1.06])for(const z of [-.85,.85]){const radius=new T.Vector3(x,y,z).applyMatrix4(pose).length();if(radius>sweepRadius){sweepRadius=radius;sweepAt=angle}}
 for(const {mesh,bounds}of objects){if(!bounds.intersectsBox(worldBounds))continue;const transform=new T.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld),g=mesh.geometry,pos=g.attributes.position,idx=g.index,triangle=new T.Triangle(),count=idx?.count||pos.count;let found=false
  for(let j=0;j<count;j+=3){for(let v=0;v<3;v++)[triangle.a,triangle.b,triangle.c][v].fromBufferAttribute(pos,idx?idx.getX(j+v):j+v).applyMatrix4(transform);if(cabin.intersectsTriangle(triangle)){found=true;break}}
  if(found){const path=[];let q=mesh;while(q&&q!==staticRoot){path.unshift(q.name);q=q.parent}hits.push({track,degrees:step,object:path.join('/'),position:p})}
 }
}
const report={sweepRadius,sweepAtDegrees:sweepAt/Math.PI*180,withinNavigationEnvelope:sweepRadius*4.6+1<52,samplesPerTrack:360,samplingDegrees:1,shape:'conservative cabin box; excludes intentional wheel/rail contact',hits,totalHits:hits.length,uniqueObjects:[...new Set(hits.map(h=>h.object))],limitation:'Discrete geometric check, not continuous collision proof or browser animation validation'}
await writeFile(new URL('../../交付物/五世界精修总计划-20260924/实施记录-20260926/byte-v2-clearance.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify({sweepRadius,withinNavigationEnvelope:report.withinNavigationEnvelope,totalHits:report.totalHits,objects:report.uniqueObjects},null,2))
