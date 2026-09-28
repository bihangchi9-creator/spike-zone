import {useEffect,useMemo} from 'react'
import {useTexture,useEnvironment} from '@react-three/drei'
import * as T from 'three'
const files=['worlds-refined-v2/wood-grain.jpg','worlds-refined-v2/oak-normal.png','worlds-refined-v2/oak-rough.jpg','harbor-v2/stone-normal.png','harbor-v2/stone-rough.jpg','worlds-refined-v1/coating-normal.png','worlds-refined-v1/coating-rough.jpg','worlds-refined-v2/natural-water-normal-v1.png','worlds-refined-v2/natural-rock-normal-v1.png','worlds-refined-v2/natural-rock-rough-v1.jpg','worlds-refined-v2/natural-water-rough-v1.jpg']
export function useRefinedWorldSurfaces(){
 const sources=useTexture(files.map(f=>`${import.meta.env.BASE_URL}textures/${f}`)),environment=useEnvironment({files:`${import.meta.env.BASE_URL}textures/env.hdr`})
 const maps=useMemo(()=>sources.map((source,i)=>{const map=source.clone();map.wrapS=map.wrapT=T.RepeatWrapping;map.flipY=false;map.colorSpace=i===0?T.SRGBColorSpace:T.NoColorSpace;map.anisotropy=4;if(i<3)map.repeat.set(.7,1.1);if(i===7||i===10)map.repeat.set(.27,.27);if(i===8||i===9)map.repeat.set(.35,.35);map.needsUpdate=true;return map}),[sources])
 useEffect(()=>()=>maps.forEach(m=>m.dispose()),[maps]);return {maps,environment}
}
export function applyRefinedWorldSurface(material:T.Material,maps:T.Texture[],environment:T.Texture){
 if(!(material instanceof T.MeshStandardMaterial))return
 material.envMap=environment;material.envMapIntensity=.65
 if(/tree_(growing_wood|structural_wood|cut_wood)|campus_wood/.test(material.name)){material.map=maps[0];material.normalMap=maps[1];material.roughnessMap=maps[2];material.normalScale.setScalar(.33);material.roughness=1}
 else if(/terrain/.test(material.name)){material.normalMap=maps[8];material.roughnessMap=maps[9];material.normalScale.setScalar(.26);material.roughness=1}
 else if(/limestone|cut_stone|pale_stone/.test(material.name)){material.normalMap=maps[3];material.roughnessMap=maps[4];material.normalScale.setScalar(.3);material.roughness=1}
 else if(/ivory|enamel|window_frame/.test(material.name)){material.normalMap=maps[5];material.roughnessMap=maps[6];material.normalScale.setScalar(.09);material.roughness=.85}
 else if(/water|lake/.test(material.name)){
  const shallow=/shallow/.test(material.name),campus=/campus/.test(material.name)
  material.normalMap=maps[7];material.roughnessMap=maps[10];material.normalScale.setScalar(shallow?.17:.29);material.roughness=shallow?.46:.29;material.envMapIntensity=shallow?.72:1.12;material.metalness=.08
  // Shore tint follows the existing basin, without changing its footprint or opacity.
  material.onBeforeCompile=shader=>{
   shader.vertexShader='varying vec2 waterXZ;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nwaterXZ=position.xz;')
   shader.fragmentShader='varying vec2 waterXZ;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float shore=length((waterXZ-vec2(${campus?'0.,.3':'1.,5.2'}))/vec2(${campus?'3.22,3.55':'4.1,3.18'}));
    float shoal=smoothstep(.68,1.02,shore);
    diffuseColor.rgb=mix(diffuseColor.rgb*.92,diffuseColor.rgb*vec3(1.12,1.09,1.025),shoal);
   `)
  }
  material.customProgramCacheKey=()=>`natural-basin-v1-${campus?'campus':'coast'}`
 }
}
