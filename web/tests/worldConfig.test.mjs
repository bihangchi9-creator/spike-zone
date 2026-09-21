import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const load=async file=>{const js=ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))}
const {WORLD_CONFIG:worlds,SYSTEM,orbitAt,atlasPoint,ownerOf,realProjectIds,visitedIds}=await load('../src/universe/worldConfig.ts')
const {navigationPath,segmentTouchesSphere}=await load('../src/universe/flightMath.ts')
const {atlasLabels}=await load('../src/universe/atlasLayout.ts')
test('five unique experience bodies own every real project exactly once',()=>{
 assert.equal(worlds.length,5);assert.equal(new Set(worlds.map(w=>w.id)).size,5)
 assert.equal(realProjectIds.length,11);assert.equal(new Set(worlds.flatMap(w=>w.slugs)).size,12)
 for(const w of worlds)for(const slug of w.slugs)assert.equal(ownerOf(slug),w.id)
 assert.equal(worlds.filter(w=>w.model==='hyundai').length,1)
 assert.ok(worlds.filter(w=>['university','bytedance','opensource'].includes(w.id)).every(w=>w.radius>45))
})
test('shared concentric orbits have a guaranteed safety gap and slower outer angular speed',()=>{
 const sorted=[...worlds].sort((a,b)=>a.orbit.radius-b.orbit.radius)
 for(let i=1;i<sorted.length;i++){const a=sorted[i-1],b=sorted[i];assert.ok(b.orbit.radius-a.orbit.radius>=a.radius+b.radius+SYSTEM.clearance);assert.ok(b.orbit.period>a.orbit.period)}
 for(let time=0;time<60000;time+=127)for(const w of worlds){const p=orbitAt(w.orbit,time);assert.ok(Math.abs(Math.hypot(...p.map((v,i)=>v-SYSTEM.center[i]))-w.orbit.radius)<1e-9)}
})
test('atlas applies one linear projection to all live coordinates and route vertices',()=>{
 const a=orbitAt(worlds[0].orbit,101),b=orbitAt(worlds[4].orbit,101),mid=a.map((v,i)=>(v+b[i])/2)
 const pa=atlasPoint(a),pb=atlasPoint(b),pm=atlasPoint(mid)
 pm.forEach((v,i)=>assert.ok(Math.abs(v-(pa[i]+pb[i])/2)<1e-9))
 const initial=worlds.map(w=>({id:w.id,point:atlasPoint(orbitAt(w.orbit,0))}))
 assert.ok(initial[0].point[0]<initial[1].point[0]);assert.ok(initial[3].point[0]<initial[0].point[0]);assert.ok(initial[4].point[0]>initial[1].point[0]);assert.ok(initial[2].point[1]<initial[0].point[1])
})
test('legacy experience and project discovery IDs migrate without wiping records',()=>{
 assert.deepEqual(visitedIds(['bytedance','opensource','hyundai']),['bytedance','opensource','hyundai'])
 assert.deepEqual(visitedIds(['material-gen-agent','bytedance','ai-music-wallpaper','future-world']),['bytedance','hyundai','future-world'])
})
test('navigation detours around a blocking planet and each returned leg clears its solid surface',()=>{
 const bodies=[{position:[0,0,0],radius:50}],start=[0,0,150],end=[0,0,-150],path=navigationPath(start,end,bodies)
 assert.ok(path.length>2);assert.deepEqual(path[0],start);assert.deepEqual(path.at(-1),end)
 for(let i=1;i<path.length;i++)assert.equal(segmentTouchesSphere(path[i-1],path[i],bodies[0].position,51.8),false)
})
test('routes between all five worlds remain available at several moving phases',()=>{
 for(const time of [0,180,900,3000,6000]){
  const bodies=worlds.map(w=>({position:orbitAt(w.orbit,time),radius:w.radius}))
  // Safe polar inspection docks ensure this exercises route planning independently of view preference.
  const docks=bodies.map(b=>[b.position[0],b.position[1]+b.radius+36,b.position[2]])
  for(let a=0;a<5;a++)for(let b=0;b<5;b++){if(a===b)continue;const path=navigationPath(docks[a],docks[b],bodies);assert.ok(path.length>=2,`No path ${a} → ${b} at ${time}`);for(let i=1;i<path.length;i++)for(const body of bodies)assert.equal(segmentTouchesSphere(path[i-1],path[i],body.position,body.radius+1.8),false)}
 }
})
test('initial atlas label rectangles do not overlap',()=>{
 const labels=atlasLabels(worlds.map(w=>{const [x,y]=atlasPoint(orbitAt(w.orbit,0));return {id:w.id,x,y}}))
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++)assert.ok(Math.abs(labels[i].lx-labels[j].lx)>=170||Math.abs(labels[i].ly-labels[j].ly)>=57)
})
