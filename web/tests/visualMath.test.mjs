import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import ts from 'typescript'
const source=readFileSync(new URL('../src/universe/visualMath.ts',import.meta.url),'utf8')
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext}}).outputText
const {arrangeLabels,withJourneyOpacity,launchFrame}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))
test('desktop labels yield to each other, HUD and viewport edges',()=>{
 const points=[{id:'hud',x:100,y:200,z:.5},{id:'one',x:500,y:250,z:.5},{id:'overlap',x:520,y:270,z:.5},{id:'two',x:850,y:250,z:.5},{id:'behind',x:800,y:400,z:2}]
 assert.deepEqual(arrangeLabels(points,1280,720).map(p=>p.id),['one','two'])
})
test('mobile keeps one readable label above touch controls',()=>{
 const points=[{id:'offscreen',x:50,y:300,z:.5},{id:'controls',x:195,y:680,z:.5},{id:'first',x:195,y:230,z:.5},{id:'second',x:195,y:450,z:.5}]
 assert.deepEqual(arrangeLabels(points,390,844).map(p=>p.id),['first'])
})
test('shader reveal injection survives repeated uniform replacements without redeclaration',()=>{
 const source='void main(){gl_FragColor=vec4(1.);}'
 const once=withJourneyOpacity(source)
 assert.equal(withJourneyOpacity(once),once)
 assert.equal((once.match(/uniform float journeyOpacity;/g)||[]).length,1)
})
test('launch ends with a fully visible stationary-scale ship and a hidden portrait',()=>{
 assert.deepEqual(launchFrame(0),{pull:0,settle:0,portrait:1,ship:0})
 assert.deepEqual(launchFrame(1),{pull:1,settle:1,portrait:0,ship:1})
 let previous=launchFrame(0)
 for(let i=1;i<=100;i++){const next=launchFrame(i/100);assert.ok(next.portrait<=previous.portrait);assert.ok(next.ship>=previous.ship);assert.ok(next.settle>=previous.settle);previous=next}
})
