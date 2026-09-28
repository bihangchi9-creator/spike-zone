import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import * as T from 'three'
import * as jsx from 'react/jsx-runtime'

const compile=(file,dev=false)=>ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8').replaceAll('import.meta.env.DEV',String(dev)),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText
const configModule={exports:{}};vm.runInNewContext(compile('../src/universe/worlds/harborTechnologyConfig.ts'),{exports:configModule.exports,module:configModule})
const config=configModule.exports
// Execute the real HarborTechnology frame callback; no DOM, renderer or browser access.
function harborHarness(initial={},diagnostics=false){
 const state={low:false,reduced:false,project:null,panel:null},osReduced={current:false},slots=[],writes=[];let cursor=0,frame,wallMs=0,props={near:false,paused:false,...initial}
 const target=initial.diagnosticStage==='main-space'?'frame-diagnostics':initial.diagnosticStage==='workbench'?'refinement-performance':'world-performance'
 const output={set textContent(text){writes.push({text,position:courier.position.toArray(),wallMs})}}
 const document={hidden:false,getElementById:id=>id===`${target}-harbor-motion`?output:null}
 const model=new T.Group(),courier=new T.Group();courier.name='idea_courier';model.add(courier)
 const hooks={useRef:value=>{const i=cursor++;return slots[i]??(slots[i]={current:value})},useMemo:fn=>{const i=cursor++;return slots[i]??(slots[i]=fn())}}
 const space=Object.assign(selector=>selector(state),{getState:()=>state}),module={exports:{}}
 const dependencies={'react':hooks,'react/jsx-runtime':jsx,'three':T,'@react-three/fiber':{useFrame:fn=>{frame=fn},createPortal:(children,target)=>({children,target})},'../state':{useSpace:space},'../cinematic':{useReducedMotion:()=>osReduced},'./harborTechnologyConfig':config,'./HarborWaterField':{default:()=>null}}
 vm.runInNewContext(compile('../src/universe/worlds/HarborTechnology.tsx',diagnostics),{exports:module.exports,module,document,URLSearchParams,location:{search:diagnostics?'?qa-metrics=1':''},performance:{now:()=>wallMs},require:name=>{assert.ok(name in dependencies,name);return dependencies[name]}})
 const render=patch=>{props={...props,...patch};cursor=0;module.exports.default({...props,model})}
 render();frame({},0)
 const step=dt=>{wallMs+=dt*1000;frame({},dt)}
 return {state,osReduced,document,courier,render,writes,step,run:(seconds,hz=60)=>{for(let i=0;i<seconds*hz;i++)step(1/hz)}}
}
test('central harbor craft starts visibly within four seconds without being nearest, in either quality',()=>{
 for(const low of [false,true]){
  const h=harborHarness();h.state.low=low;h.render();const start=h.courier.position.clone();h.run(4)
  assert.ok(h.courier.position.y-start.y>.4,'overview must not be gated on near')
  assert.ok(h.courier.position.distanceTo(new T.Vector3(...config.courierPose(4).position))<1e-10)
  h.run(9);assert.ok(h.courier.position.z>9,'craft must actually travel along the approved short route')
  h.run(17);assert.ok(h.courier.position.distanceTo(start)<1e-10,'craft must dock, not drift forever')
 }
})
test('reading, settings, hidden tab, manual and OS reduced motion freeze the actual frame callback',()=>{
 const gates=[h=>{h.state.project='meeting-summary-agent'},h=>{h.state.panel='settings'},h=>{h.document.hidden=true},h=>{h.state.reduced=true},h=>{h.osReduced.current=true},h=>h.render({paused:true})]
 for(const gate of gates){
  const h=harborHarness();h.run(4);const before=h.courier.position.clone(),yaw=h.courier.rotation.y;gate(h);h.step(180);h.run(10)
  assert.ok(h.courier.position.equals(before));assert.equal(h.courier.rotation.y,yaw)
  h.state.project=null;h.state.panel=null;h.document.hidden=false;h.state.reduced=false;h.osReduced.current=false;h.render({paused:false});h.step(1/60)
  assert.ok(h.courier.position.distanceTo(new T.Vector3(...config.courierPose(4+1/60).position))<1e-10,'no background catch-up')
 }
})
test('switching proximity preserves flight phase instead of docking or restarting',()=>{
 const h=harborHarness();h.run(9);const before=h.courier.position.clone();h.render({near:true});h.step(0);assert.ok(h.courier.position.equals(before))
 h.run(1);h.render({near:false});h.step(0);assert.ok(h.courier.position.distanceTo(new T.Vector3(...config.courierPose(10).position))<1e-10)
 h.run(1);assert.ok(h.courier.position.distanceTo(new T.Vector3(...config.courierPose(11).position))<1e-10)
})
test('the shortened dock wait preserves frame-independent flight and limits stale frame deltas',()=>{
 const positions=[30,60,144].map(hz=>{const h=harborHarness();h.run(4,hz);return h.courier.position.clone()})
 positions.slice(1).forEach(p=>assert.ok(p.distanceTo(positions[0])<1e-10))
 const h=harborHarness();h.run(4);h.step(120);assert.ok(h.courier.position.distanceTo(new T.Vector3(...config.courierPose(4.05).position))<1e-10)
})

test('visible development diagnostics publish the actual craft position at most twice per second for each scene',()=>{
 const normal=harborHarness();normal.run(4);assert.equal(normal.writes.length,0)
 for(const diagnosticStage of ['main-space','world-detail','workbench']){
  const h=harborHarness({diagnosticStage},true);h.run(4)
  assert.ok(h.writes.length>=7&&h.writes.length<=9)
  h.writes.forEach((entry,index)=>{
   assert.ok(entry.text.includes(`(${diagnosticStage})`))
   assert.ok(entry.text.includes('near: false'))
   const published=entry.text.match(/local position: \[([^\]]+)\]/)[1].split(',').map(Number)
   published.forEach((value,axis)=>assert.ok(Math.abs(value-entry.position[axis])<=.00051))
   if(index)assert.ok(entry.wallMs-h.writes[index-1].wallMs>=500)
  })
  h.render({paused:true});h.run(1)
  assert.ok(h.writes.at(-1).text.includes('paused: true'))
  assert.ok(h.writes.at(-1).text.includes('seconds: 4.000'))
 }
})
