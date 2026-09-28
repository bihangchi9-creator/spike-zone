import {Vector2,type WebGLRenderer} from 'three'
import type {EffectComposer} from 'postprocessing'
/** Use CSS size for setSize: this installed Composer obtains physical size from gl. */
export function createComposerSizeSync(){
 const physical=new Vector2(),css=new Vector2()
 return (gl:WebGLRenderer,composer:EffectComposer)=>{
  gl.getDrawingBufferSize(physical)
  if(physical.x<=0||physical.y<=0)return false
  if([composer.inputBuffer,composer.outputBuffer].every(b=>b.width===physical.x&&b.height===physical.y))return false
  gl.getSize(css)
  composer.setSize(css.x,css.y)
  return true
 }
}
