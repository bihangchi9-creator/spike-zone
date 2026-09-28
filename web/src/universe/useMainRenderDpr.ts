import {useLayoutEffect,useState,useSyncExternalStore} from 'react'
import {createRenderDpr} from './renderDpr'
import {recordDiagnostic,renderDiagnostic} from '../qa/renderDiagnosticSession'
export function useMainRenderDpr(low:boolean){
 const [owner]=useState(()=>createRenderDpr(low,window.devicePixelRatio,renderDiagnostic.fixedDpr,recordDiagnostic))
 const state=useSyncExternalStore(owner.subscribe,owner.getSnapshot)
 useLayoutEffect(()=>owner.setQuality(low),[owner,low])
 return {owner,dpr:state.dpr}
}
