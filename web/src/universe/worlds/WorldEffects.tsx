import {useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as T from 'three'
import {useSpace} from '../state'
import {positionOf,worldClock} from '../worldMotion'
import {worldFor} from '../data'
import type {Stop} from './catalog'
export function ProjectPath({id,stop}:{id:string;stop:Stop|null}){const points=useMemo(()=>{if(!stop)return null;const end=new T.Vector3(...stop.position),start=id==='opensource'?new T.Vector3(0,-8.8,0):id==='bytedance'?new T.Vector3(0,2.5,0):end.clone().add(new T.Vector3(-2,0,0));return new T.TubeGeometry(new T.CatmullRomCurve3([start,start.clone().lerp(end,.45).add(new T.Vector3(0,1,0)),end]),36,.035,5,false)},[id,stop]);return points?<mesh geometry={points}><meshBasicMaterial color={id==='chongzhen'?'#ffc981':id==='opensource'?'#83e6bc':'#75bffa'} toneMapped={false}/></mesh>:null}
export function IdeaCourier(){const ref=useRef<T.Group>(null),s=useSpace();useFrame(()=>{if(!ref.current)return;ref.current.visible=!s.reduced;const t=worldClock.time/100,part=Math.floor(t)%4,phase=t%1,home=positionOf(worldFor('chongzhen')!),away=positionOf(worldFor(part<2?'bytedance':'opensource')!);const a=new T.Vector3(...(part%2?away:home)),b=new T.Vector3(...(part%2?home:away));const e=T.MathUtils.smoothstep(phase,.12,.88);ref.current.position.lerpVectors(a,b,e);ref.current.position.y+=28+Math.sin(e*Math.PI)*65;ref.current.lookAt(b.clone().add(new T.Vector3(0,28,0)))});return <group ref={ref}><mesh><boxGeometry args={[2.6,1.3,4.8]}/><meshStandardMaterial color="#d78749" roughness={.55}/></mesh><mesh position={[0,.9,.3]}><boxGeometry args={[1.9,1,2.5]}/><meshStandardMaterial color="#e4e9de" roughness={.55}/></mesh><mesh position={[0,.9,1.56]}><planeGeometry args={[1.4,.6]}/><meshBasicMaterial color="#92d9ef"/></mesh></group>}
