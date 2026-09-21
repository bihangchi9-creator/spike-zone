import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const source=fs.readFileSync(new URL('../src/universe/worldSpin.ts',import.meta.url),'utf8')
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const {stepSpin}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
const run=(distance,hz=60)=>{let s={angle:0,speed:0};for(let i=0;i<hz*12;i++)s=stepSpin(s,1/hz,.009,distance,50,false);return s}
test('approaching a world reduces rotation without reversing or snapping',()=>{assert.ok(run(75).speed<run(300).speed*.13);let s=run(300);const n=stepSpin(s,.016,.009,75,50,false);assert.ok(n.speed<s.speed);assert.ok(n.angle>s.angle);assert.ok(n.angle-s.angle<.001)})
test('reading freezes orientation and resuming accelerates from rest',()=>{const before=run(300),paused=stepSpin(before,60,.009,300,50,true);assert.equal(paused.angle,before.angle);assert.equal(paused.speed,0);const resumed=stepSpin(paused,.016,.009,300,50,false);assert.ok(resumed.speed>0&&resumed.speed<.001);assert.ok(resumed.angle-paused.angle<.00001)})
test('rotation has consistent speed across frame rates and no background catchup',()=>{assert.ok(Math.abs(run(300,30).angle-run(300,144).angle)<.00002);const n=stepSpin({angle:0,speed:.009},60,.009,300,50,false);assert.ok(n.angle<=.000451)})
