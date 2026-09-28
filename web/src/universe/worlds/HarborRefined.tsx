import {useMemo,useEffect} from 'react'
import {useGLTF,useTexture,useEnvironment} from '@react-three/drei'
import {useFrame} from '@react-three/fiber'
import * as T from 'three'
import HarborTechnology from './HarborTechnology'
import {useSpace} from '../state'
const base=import.meta.env.BASE_URL
const families=['plaster','stone','wood','slate','metal']
const common=[...families.flatMap(f=>[`${f}-color.jpg`,`${f}-rough.jpg`,`${f}-normal.png`]),...Array.from({length:6},(_,i)=>`art-${i}.jpg`),'pool-color.jpg']
const urls={v1:common.map(p=>`${base}textures/harbor-v1/${p}`),v2:[...common,'pool-normal.png'].map(p=>`${base}textures/harbor-v2/${p}`)}
export default function HarborRefined({near=true,version='v3',paused=false,diagnosticStage='world-detail'}:{near?:boolean;version?:'v1'|'v2'|'v3';paused?:boolean;diagnosticStage?:'main-space'|'world-detail'|'workbench'}){
 const low=useSpace(s=>s.low),refined=version!=='v1'
 const {scene}=useGLTF(`${base}models/worlds/chongzhen-refined-${version}${low||!near?'-low':''}.glb${version==='v3'?'?rev=water-field-20260924':''}`)
 const textures=useTexture(urls[version==='v1'?'v1':'v2']),environment=useEnvironment({files:`${base}textures/env.hdr`})
 const materials=useMemo(()=>{
  const maps=textures.map((t,i)=>{const map=t.clone();map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=near&&!low?8:2;map.colorSpace=(i>=15&&i<=21)||i<15&&i%3===0?T.SRGBColorSpace:T.NoColorSpace;map.needsUpdate=true;return map})
  const copy=scene.clone(true),mats=new Map<T.Material,T.MeshStandardMaterial>()
  copy.traverse(o=>{
   if(!(o instanceof T.Mesh))return
   const old=o.material as T.MeshStandardMaterial;let material=mats.get(old)
   if(!material){
    material=old.clone();const family=families.findIndex(f=>old.name.startsWith('harbor_'+f))
    if(family>=0){material.map=maps[family*3];material.roughnessMap=maps[family*3+1];material.normalMap=maps[family*3+2];material.normalScale.setScalar(refined?(family===2?.26:.48):(family===2?.18:.24));material.roughness=1}
    if(old.name.startsWith('harbor_art_'))material.map=maps[15+Number(old.name.slice(-1))]
    if(refined&&old.name==='harbor_glass')material=new T.MeshPhysicalMaterial({name:old.name,color:'#d2eced',roughness:.075,metalness:.06,transmission:near&&!low?.88:0,transparent:low,opacity:low?.68:1,thickness:.075,ior:1.46,side:T.DoubleSide,vertexColors:true,clearcoat:.45,clearcoatRoughness:.14})
    if(old.name==='harbor_pool'){
     if(refined){material=new T.MeshPhysicalMaterial({name:old.name,color:'#71c9b7',roughness:.12,metalness:.07,transmission:near&&!low?.45:0,thickness:.45,attenuationColor:new T.Color('#338a93'),attenuationDistance:1.3,ior:1.333,vertexColors:true,normalMap:maps[22],normalScale:new T.Vector2(.3,.3)});maps[22].repeat.set(.76,.76)}
     material.map=maps[21];material.map.repeat.set(refined?.48:.32,refined?.48:.32)
    }
    if(refined){material.envMap=environment;material.envMapIntensity=old.name==='harbor_pool'?1.15:old.name==='harbor_glass'?.65:.55;material.needsUpdate=true}
    mats.set(old,material)
   }
   o.material=material;o.castShadow=!['harbor_pool','harbor_glass','harbor_leaf','harbor_leaf_light'].includes(old.name);o.receiveShadow=true
  })
  return {copy,maps,mats}
 },[scene,textures,near,low,refined,environment])
 useFrame((_,dt)=>{if(refined&&!paused&&!useSpace.getState().reduced&&!useSpace.getState().project&&!document.hidden){const map=materials.maps[22];map.offset.x=(map.offset.x+Math.min(dt,.05)*.005)%1;map.offset.y=(map.offset.y+Math.min(dt,.05)*.003)%1}})
 useEffect(()=>()=>{materials.maps.forEach(t=>t.dispose());materials.mats.forEach(m=>m.dispose())},[materials])
 return <group><primitive object={materials.copy}/>{version==='v3'&&<HarborTechnology model={materials.copy} near={near} paused={paused} diagnosticStage={diagnosticStage}/>}{near&&<>
  <pointLight position={[0,2.32,-2.7]} intensity={refined?8:4.5} color="#ffdb9f" distance={5.3} decay={2}/>
  <pointLight position={[-5.4,2.23,.2]} intensity={refined?7.5:3.6} color="#ffdda8" distance={4.7} decay={2}/>
  <pointLight position={[5.4,2.23,.2]} intensity={refined?7.5:3.6} color="#ffdda8" distance={4.7} decay={2}/>
 </>}</group>
}
