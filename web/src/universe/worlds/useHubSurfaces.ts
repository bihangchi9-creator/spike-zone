import {useEffect,useMemo} from 'react'
import {useTexture} from '@react-three/drei'
import * as T from 'three'
const names=['coating','aluminum','mineral','wood'] as const
const urls=[...names.flatMap(name=>['rough.jpg','normal.png'].map(kind=>`${import.meta.env.BASE_URL}textures/worlds-refined-v1/${name}-${kind}`)),...['oak-color.jpg','oak-rough.jpg','oak-normal.png'].map(name=>`${import.meta.env.BASE_URL}textures/worlds-refined-v2/${name}`)]
export function useHubSurfaces(){
 const sources=useTexture(urls)
 const textures=useMemo(()=>sources.map((source,i)=>{const texture=source.clone();texture.colorSpace=i===8?T.SRGBColorSpace:T.NoColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=4;texture.flipY=false;if(i>=8)texture.repeat.set(.65,.85);texture.needsUpdate=true;return texture}),[sources])
 useEffect(()=>()=>textures.forEach(t=>t.dispose()),[textures])
 return textures
}
export function applyHubSurface(material:T.Material,textures:T.Texture[],v2=false){
 if(!(material instanceof T.MeshStandardMaterial))return
 const slot=material.name==='hub_brushed_aluminum'?1:material.name==='hub_mineral_floor'?2:material.name==='hub_worktop'?3:/hub_porcelain|hub_blue_enamel|hub_service_navy/.test(material.name)?0:-1
 if(slot<0)return
 material.roughnessMap=textures[slot*2];material.normalMap=textures[slot*2+1]
 // The gray maps multiply roughness; normalize the coefficient while retaining material distinctions.
 material.roughness=slot===0?.8:slot===1?.78:1
 material.normalScale.setScalar(slot===3?.24:slot===2?.22:.1)
 if(v2){
  if(slot===3){material.map=textures[8];material.color.set('#ffffff');material.roughnessMap=textures[9];material.normalMap=textures[10];material.roughness=1;material.normalScale.setScalar(.42)}
  if(material.name==='hub_blue_enamel'){material.roughness=.56;material.metalness=.35}
  if(material.name==='hub_porcelain'){material.roughness=.9;material.metalness=.07}
  if(slot===1){material.roughness=.61;material.metalness=.82}
 }
}
