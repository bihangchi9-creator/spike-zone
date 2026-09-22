import {useMemo,useEffect} from 'react'
import {useGLTF,useTexture} from '@react-three/drei'
import * as T from 'three'
import {useSpace} from '../state'
const base=import.meta.env.BASE_URL
const families=['plaster','stone','wood','slate','metal']
const paths=[...families.flatMap(f=>[`${f}-color.jpg`,`${f}-rough.jpg`,`${f}-normal.png`]),...Array.from({length:6},(_,i)=>`art-${i}.jpg`),'pool-color.jpg']
export default function HarborRefined({near=true}:{near?:boolean}){
 const low=useSpace(s=>s.low),{scene}=useGLTF(`${base}models/worlds/chongzhen-refined-v1${low||!near?'-low':''}.glb`)
 const textures=useTexture(paths.map(p=>`${base}textures/harbor-v1/${p}`))
 const materials=useMemo(()=>{const maps=textures.map((t,i)=>{const map=t.clone();map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=near&&!low?8:2;map.colorSpace=i>=15||i%3===0?T.SRGBColorSpace:T.NoColorSpace;map.needsUpdate=true;return map});const copy=scene.clone(true),mats=new Map<T.Material,T.MeshStandardMaterial>();copy.traverse(o=>{if(!(o instanceof T.Mesh))return;const old=o.material as T.MeshStandardMaterial;let material=mats.get(old);if(!material){material=old.clone();const family=families.findIndex(f=>old.name.startsWith('harbor_'+f));if(family>=0){material.map=maps[family*3];material.roughnessMap=maps[family*3+1];material.normalMap=maps[family*3+2];material.normalScale.setScalar(family===2?.18:.24);material.roughness=1}if(old.name.startsWith('harbor_art_'))material.map=maps[15+Number(old.name.slice(-1))];if(old.name==='harbor_pool'){material.map=maps[21];material.map.repeat.set(.32,.32)}mats.set(old,material)}o.material=material;o.castShadow=old.name!=='harbor_pool';o.receiveShadow=true});return {copy,maps,mats}},[scene,textures,near,low])
 useEffect(()=>()=>{materials.maps.forEach(t=>t.dispose());materials.mats.forEach(m=>m.dispose())},[materials])
 return <group><primitive object={materials.copy}/>{near&&<><pointLight position={[0,2.35,-2.8]} intensity={4.5} color="#ffd49b" distance={5.3} decay={2}/><pointLight position={[-5.4,2.23,.2]} intensity={3.6} color="#ffd9a8" distance={4.7} decay={2}/><pointLight position={[5.4,2.23,.2]} intensity={3.6} color="#ffd9a8" distance={4.7} decay={2}/></>}</group>
}
