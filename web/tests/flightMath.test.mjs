import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const source = readFileSync(new URL('../src/universe/flightMath.ts', import.meta.url), 'utf8')
const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText
const { segmentTouchesSphere, sphereContact } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))

test('boosted movement detects a target even when both endpoints are outside', () => {
  assert.equal(segmentTouchesSphere([0,0,20],[0,0,-20],[0,0,0],5), true)
  assert.equal(segmentTouchesSphere([6,0,20],[6,0,-20],[0,0,0],5), false)
})
test('stationary and tangent checkpoint cases are stable', () => {
  assert.equal(segmentTouchesSphere([0,0,0],[0,0,0],[0,0,0],5), true)
  assert.equal(segmentTouchesSphere([0,0,6],[0,0,6],[0,0,0],5), false)
  assert.equal(segmentTouchesSphere([5,0,-10],[5,0,10],[0,0,0],5), true)
})
test('planet collision places the ship outside and reflects inward velocity', () => {
  const c = sphereContact([4,0,0],[-12,3,0],[0,0,0],6)
  assert.deepEqual(c.position,[6,0,0])
  assert.deepEqual(c.velocity,[6,3,0])
})
test('moving away is not reflected and contact at planet center stays finite', () => {
  assert.deepEqual(sphereContact([4,0,0],[12,0,0],[0,0,0],6).velocity,[12,0,0])
  assert.deepEqual(sphereContact([0,0,0],[0,0,-1],[0,0,0],6).position,[0,0,6])
  assert.equal(sphereContact([7,0,0],[0,0,0],[0,0,0],6),null)
})
