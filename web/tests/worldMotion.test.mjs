import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const source=fs.readFileSync(new URL('../src/universe/experienceConfig.ts',import.meta.url),'utf8')
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText
const {advanceTime,entryParticleFrame}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
test('orbital clock freezes while reading, has no catch-up jump and is frame independent',()=>{
 assert.equal(advanceTime(20,100,true),20);assert.equal(advanceTime(20,100,false),20.05)
 const integrate=hz=>{let t=0;for(let i=0;i<hz*10;i++)t=advanceTime(t,1/hz,false);return t}
 const a=integrate(30),b=integrate(144);assert.ok(Math.abs(a-b)<1e-10)
})
test('entry cycles fade to zero at their seam and decelerate near the target',()=>{
 assert.equal(entryParticleFrame(0).alpha,0);assert.equal(entryParticleFrame(1).alpha,0)
 assert.ok(entryParticleFrame(.999999).alpha<.001)
 const early=entryParticleFrame(.2).travel-entryParticleFrame(.1).travel,late=entryParticleFrame(.9).travel-entryParticleFrame(.8).travel
 assert.ok(early>late);assert.ok(entryParticleFrame(.5).alpha>.99)
})
