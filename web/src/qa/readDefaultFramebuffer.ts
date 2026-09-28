/** DEV opt-in only. Errors invalidate samples; a zero-filled failed read is not a black frame. */
export function readDefaultFramebuffer(gl:WebGL2RenderingContext,y:number,width:number,height:number){
 if(gl.isContextLost())throw Error('readback context lost')
 const prior=gl.getError()
 if(prior!==gl.NO_ERROR)throw Error(`pre-existing GL error ${prior}; sample invalid (error consumed by diagnostic)`)
 if(gl.getParameter(gl.FRAMEBUFFER_BINDING)!==null||gl.getParameter(gl.READ_FRAMEBUFFER_BINDING)!==null)throw Error('readback requires default DRAW and READ framebuffer')
 if(gl.getParameter(gl.READ_BUFFER)!==gl.BACK)throw Error('readback requires BACK buffer')
 if(gl.getParameter(gl.PIXEL_PACK_BUFFER_BINDING)!==null||gl.getParameter(gl.PACK_ROW_LENGTH)!==0||gl.getParameter(gl.PACK_SKIP_PIXELS)!==0||gl.getParameter(gl.PACK_SKIP_ROWS)!==0)throw Error('unsupported pixel pack state')
 const data=new Uint8Array(width*height*4)
 gl.readPixels(0,y,width,height,gl.RGBA,gl.UNSIGNED_BYTE,data)
 const error=gl.getError()
 if(error!==gl.NO_ERROR||gl.isContextLost())throw Error(`invalid GL readback ${error}`)
 return data
}
