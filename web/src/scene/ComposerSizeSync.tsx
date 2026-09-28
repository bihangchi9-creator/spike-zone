import {useContext,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import {EffectComposerContext} from '@react-three/postprocessing'
import {createComposerSizeSync} from './composerSize'
import {recordDiagnostic} from '../qa/renderDiagnosticSession'
export default function ComposerSizeSync(){
 const {composer}=useContext(EffectComposerContext)
 const [sync]=useState(createComposerSizeSync)
 // Canvas configure applies the owned DPR before frame callbacks. -1 runs before
 // Composer's render at +1, without claiming render ownership. Budget at 0 only
 // requests the NEXT React commit; it never mutates gl/R3F during this frame.
 useFrame(({gl})=>{
  if(sync(gl,composer))recordDiagnostic('composer-size-synced',{dpr:gl.getPixelRatio(),input:[composer.inputBuffer.width,composer.inputBuffer.height],output:[composer.outputBuffer.width,composer.outputBuffer.height]})
 },-1)
 return null
}
