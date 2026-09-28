import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import ts from 'typescript'
const code=ts.transpileModule(readFileSync(new URL('../src/qa/renderDiagnosticMath.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const {classifyScanlines,diagnosticOptions}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))
const rows=(width,color)=>Array.from({length:3},()=>{const a=new Uint8Array(width*4);for(let x=0;x<width;x++)a.set([...color,255],x*4);return a})
test('black-frame screening distinguishes the observed 73 percent right rectangle from a dark blue star field',()=>{
 const width=1920,scene=rows(width,[8,14,25]);assert.equal(classifyScanlines(scene,width).suspect,false)
 const black=rows(width,[0,0,0]);assert.equal(classifyScanlines(black,width).suspect,true)
 const rectangle=rows(width,[60,80,100]);for(const row of rectangle)for(let x=518;x<width;x++)row.set([0,0,0,255],x*4)
 const result=classifyScanlines(rectangle,width);assert.equal(result.suspect,true);assert.ok(Math.abs(result.blackRatio-1402/1920)<1e-9);assert.equal(result.rightBlackRatio,1)
 const shortBand=rows(width,[8,14,25]);for(const row of shortBand)for(let x=1500;x<width;x++)row.set([0,0,0,255],x*4)
 assert.equal(classifyScanlines(shortBand,width).suspect,false,'a small dark object must not trigger the observed rectangle detector')
})
test('fixed DPR and pixel readback are opt-in DEV diagnostics; baseline mode retains adaptive behavior',()=>{
 for(const search of ['?render-diag=1&fixed-dpr=1.5&pixel-probe=1','?fixed-dpr=1.5'])assert.deepEqual(diagnosticOptions(search,false),{enabled:false,fixedDpr:null,pixels:false})
 assert.deepEqual(diagnosticOptions('?render-diag=1',true),{enabled:true,fixedDpr:null,pixels:false})
 assert.deepEqual(diagnosticOptions('?render-diag=1&fixed-dpr=1.5',true),{enabled:true,fixedDpr:1.5,pixels:false})
 assert.equal(diagnosticOptions('?render-diag=1&fixed-dpr=0.5',true).fixedDpr,null)
 assert.equal(diagnosticOptions('?pixel-probe=1',true).pixels,false)
})

test('diagnostic raw screenshots are lazy and capped, and stale recording completion cannot end a newer session',async()=>{
 const descriptors=Object.fromEntries(['location','navigator','performance','fetch'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));let time=100,reads=0;const uploads=[]
 try{
  Object.defineProperty(globalThis,'location',{configurable:true,value:{search:'?render-diag=1&pixel-probe=1',href:'http://127.0.0.1:5173/?render-diag=1&pixel-probe=1'}})
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{userAgent:'test',hardwareConcurrency:1}})
  Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>time,timeOrigin:0}})
  globalThis.fetch=async(url,options)=>{uploads.push({url,options});return {ok:true}}
  const mathURL='data:text/javascript;base64,'+Buffer.from(code).toString('base64')
  const source=readFileSync(new URL('../src/qa/renderDiagnosticSession.ts',import.meta.url),'utf8').replace("'./renderDiagnosticMath'",JSON.stringify(mathURL)).replace('import.meta.env.DEV','true')
  const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText,s=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
  const first=s.beginDiagnostic({});assert.equal(s.diagnosticRunning(),true)
  for(let i=0;i<10;i++)s.diagnosticScreenshot(()=>{reads++;return Promise.resolve(new Blob(['raw']))},{})
  assert.equal(reads,6,'the expensive framebuffer copy must not run after the PNG cap')
  await s.finishDiagnostic('test complete',first);assert.equal(s.diagnosticRunning(),false);assert.equal(uploads.length,7)
  const report=JSON.parse(uploads.at(-1).options.body);assert.equal(report.events.filter(e=>e.type==='raw-frame-saved').length,6)
  const second=s.beginDiagnostic({});assert.notEqual(second,first);await s.finishDiagnostic('late old callback',first);assert.equal(s.diagnosticRunning(),true)
  time+=35001;assert.equal(s.diagnosticRunning(),false,'no readback after the bounded 35-second window')
  await s.finishDiagnostic('deadline',second)
 }finally{for(const [key,descriptor] of Object.entries(descriptors)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key]}}
})
