import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import ts from 'typescript'
import React from 'react'
import {createRoot,_roots,act,useFrame,advance} from '@react-three/fiber'
import {EffectComposerContext} from '@react-three/postprocessing'
import {EffectComposer,Pass} from 'postprocessing'
import {Vector2,WebGLRenderTarget} from 'three'

function moduleURL(path,dependencies={}){
 let source=readFileSync(new URL(path,import.meta.url),'utf8')
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText
 const resolved=js.replace(/from (["'])([^"']+)\1/g,(_match,_quote,name)=>`from ${JSON.stringify(dependencies[name]||import.meta.resolve(name))}`)
 return 'data:text/javascript;base64,'+Buffer.from(resolved).toString('base64')
}
const budgetURL=moduleURL('../src/universe/renderDpr.ts')
const {createRenderDpr}=await import(budgetURL)
const sizeURL=moduleURL('../src/scene/composerSize.ts')
const {createComposerSizeSync}=await import(sizeURL)
const diagnosticURL='data:text/javascript,export const renderDiagnostic={fixedDpr:null};export const recordDiagnostic=()=>{}'
const {useMainRenderDpr}=await import(moduleURL('../src/universe/useMainRenderDpr.ts',{'./renderDpr':budgetURL,'../qa/renderDiagnosticSession':diagnosticURL}))
const {default:ComposerSizeSync}=await import(moduleURL('../src/scene/ComposerSizeSync.tsx',{'./composerSize':sizeURL,'../qa/renderDiagnosticSession':diagnosticURL}))
const {default:RenderBudget}=await import(moduleURL('../src/universe/RenderBudget.tsx'))

// No browser/GPU: actual R3F store/reconciler and Composer targets/passes, with
// a minimal renderer boundary. Actual WebGL completeness is separately CUA-tested.
function renderer(){
 let dpr=1,w=0,h=0
 const canvas={width:0,height:0,style:{},addEventListener(){},removeEventListener(){}}
 const gl={domElement:canvas,shadowMap:{},autoClear:false,xr:{isPresenting:false,addEventListener(){},removeEventListener(){},disconnect(){}},render(){},setPixelRatio(v){dpr=v;gl.setSize(w,h)},getPixelRatio:()=>dpr,setSize(x,y){w=x;h=y;canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr)},getSize:v=>v.set(w,h),getDrawingBufferSize:v=>v.set(canvas.width,canvas.height),getContext:()=>({getContextAttributes:()=>({alpha:false})}),dispose(){},forceContextLoss(){},renderLists:{dispose(){}}}
 return gl
}
function configure(root,gl,dpr,width=1280,height=720){root.configure({gl,dpr,size:{width,height,top:0,left:0},frameloop:'never'})}

test('installed R3F and Composer reproduce the original independent ownership and sizing defects',()=>{
 const previous=globalThis.window;globalThis.window={devicePixelRatio:2}
 const gl=renderer(),root=createRoot(gl.domElement)
 try{
  const declaredRange=[1,1.5]
  configure(root,gl,declaredRange)
  const store=_roots.get(gl.domElement).store,composer=new EffectComposer(gl)
  store.getState().setDpr(1.25)
  assert.equal(gl.domElement.width,1600)
  assert.equal(composer.inputBuffer.width,1920,'DPR-only updates leave the installed composer stale')
  configure(root,gl,declaredRange)
  assert.equal(gl.getPixelRatio(),1.5,'even the same array reference resets the DPR on configure')
  composer.dispose()
 }finally{root.unmount();if(previous===undefined)delete globalThis.window;else globalThis.window=previous}
})

test('owned DPR survives real React parent/route updates and synchronizes real Composer before render',async()=>{
 const previous=Object.fromEntries(['window','document','IS_REACT_ACT_ENVIRONMENT'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]))
 globalThis.window={devicePixelRatio:2};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};globalThis.IS_REACT_ACT_ENVIRONMENT=true
 const gl=renderer(),root=createRoot(gl.domElement)
 configure(root,gl,1.5)
 const composer=new EffectComposer(gl),pass=new Pass('size witness'),passTarget=new WebGLRenderTarget(1,1)
 let owner,frames=0,resizeCalls=0,time=0
 const originalSize=composer.setSize.bind(composer)
 composer.setSize=(...args)=>{resizeCalls++;assert.equal(args[0],gl.getSize(new Vector2()).x,'never pass physical width as CSS');originalSize(...args)}
 pass.setSize=(w,h)=>passTarget.setSize(w,h)
 pass.render=(_renderer,input,output)=>{
  const physical=gl.getDrawingBufferSize(new Vector2())
  for(const target of [input,output,passTarget])assert.deepEqual([target.width,target.height],physical.toArray(),'every actual Composer render sees synchronized buffers AND pass targets')
  frames++
 }
 composer.addPass(pass)
 function Render(){useFrame((_state,dt)=>composer.render(dt),1);return null}
 function Harness({low=false,parentUpdate=0,destination=null,width=1280,height=720}){
  const budget=useMainRenderDpr(low);owner=budget.owner
  React.useLayoutEffect(()=>{configure(root,gl,budget.dpr,width,height)}) // Canvas layout lifecycle, including unrelated commits.
  return React.createElement(EffectComposerContext.Provider,{value:{composer}},React.createElement(ComposerSizeSync),React.createElement(RenderBudget,{owner}),React.createElement(Render,{parentUpdate,destination}))
 }
 const mount=props=>act(async()=>root.render(React.createElement(Harness,props)))
 const frame=()=>act(async()=>advance(time+=.016,true,_roots.get(gl.domElement).store.getState()))
 try{
  await mount({});await frame();const initialCalls=resizeCalls
  await act(async()=>owner.request(1.25,'diagnostic'));await frame()
  assert.equal(gl.getPixelRatio(),1.25);assert.equal(resizeCalls,initialCalls+1)
  for(let i=0;i<3;i++){await mount({parentUpdate:i,destination:'bytedance'});await frame();assert.equal(gl.getPixelRatio(),1.25)}
  assert.equal(resizeCalls,initialCalls+1,'no per-frame rebuild/resize while unchanged')
  await act(async()=>owner.request(1,'diagnostic'));await frame()
  await mount({destination:'origin',width:900,height:600});await frame()
  assert.equal(gl.getPixelRatio(),1);assert.equal(composer.inputBuffer.width,900)
  await mount({low:true});await frame();assert.equal(gl.getPixelRatio(),1)
  await mount({low:false});await frame();assert.equal(gl.getPixelRatio(),1.5,'explicit fine-quality selection resets the owned budget')
  // The actual RenderBudget hook warms up and drops only after its slow window.
  for(let i=0;i<180;i++)await act(async()=>advance(time+=.04,true,_roots.get(gl.domElement).store.getState()))
  await frame();assert.equal(gl.getPixelRatio(),1.25,'sustained 40ms frames request adaptive reduction through the same owner')
  await mount({parentUpdate:99,destination:'bytedance'});await frame();assert.equal(gl.getPixelRatio(),1.25)
  assert.ok(frames>190)
 }finally{
  await act(async()=>{root.render(null);root.unmount()});composer.dispose();passTarget.dispose()
  for(const [key,value] of Object.entries(previous)){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key]}
 }
})

test('Composer synchronization repairs a DPR-only change once and propagates odd viewport sizes without double scaling',()=>{
 const gl=renderer();gl.setSize(1281,721);gl.setPixelRatio(1.5)
 const composer=new EffectComposer(gl),sync=createComposerSizeSync(),pass=new Pass('dependent target'),target=new WebGLRenderTarget(1,1)
 pass.setSize=(w,h)=>target.setSize(w,h);composer.addPass(pass)
 gl.setPixelRatio(1.25)
 assert.equal(sync(gl,composer),true);assert.deepEqual([target.width,target.height],[1601,901]);assert.equal(sync(gl,composer),false)
 gl.setSize(901,601);assert.equal(sync(gl,composer),true);assert.deepEqual([target.width,target.height],[1126,751]);assert.equal(gl.getSize(new Vector2()).x,901)
 composer.dispose();target.dispose()
})

test('fixed diagnostic mode and light quality reject adaptive/manual requests; same quality calls preserve budget',()=>{
 const fixed=createRenderDpr(false,2,1.5);assert.equal(fixed.request(1,'adaptive'),false);assert.equal(fixed.request(1,'diagnostic'),false)
 const events=[],owner=createRenderDpr(false,2,null,(type,data)=>events.push({type,data}))
 owner.request(1.25,'adaptive');owner.setQuality(false);assert.equal(owner.getSnapshot().dpr,1.25)
 assert.equal(owner.request(1.5,'adaptive'),false)
 owner.setQuality(true);assert.equal(owner.request(1.5,'diagnostic'),false)
 owner.setQuality(false);assert.equal(owner.getSnapshot().dpr,1.5)
 assert.equal(events.filter(e=>e.type==='dpr-quality-reset').length,2)
})

test('raw readback refuses mismatched READ framebuffer and GL failures instead of reporting false black',async()=>{
 const {readDefaultFramebuffer}=await import(moduleURL('../src/qa/readDefaultFramebuffer.ts'))
 let error=0,readBinding=null,fail=false
 const gl={NO_ERROR:0,FRAMEBUFFER_BINDING:1,READ_FRAMEBUFFER_BINDING:2,READ_BUFFER:3,BACK:4,PIXEL_PACK_BUFFER_BINDING:5,PACK_ROW_LENGTH:6,PACK_SKIP_PIXELS:7,PACK_SKIP_ROWS:8,RGBA:9,UNSIGNED_BYTE:10,isContextLost:()=>false,getError:()=>{const v=error;error=0;return v},getParameter:key=>key===2?readBinding:key===3?4:key>=6?0:null,readPixels:(_x,_y,_w,_h,_format,_type,buffer)=>{if(fail)error=1282;else buffer.fill(42)}}
 assert.equal(readDefaultFramebuffer(gl,0,2,1)[0],42)
 readBinding={};assert.throws(()=>readDefaultFramebuffer(gl,0,2,1),/READ framebuffer/);readBinding=null
 fail=true;assert.throws(()=>readDefaultFramebuffer(gl,0,2,1),/invalid GL readback/)
 error=1280;assert.throws(()=>readDefaultFramebuffer(gl,0,2,1),/pre-existing/)
})
