import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import Vessel from '../universe/Vessel'
import Capture from './Capture'
const views:Record<string,[number,number,number]>={side:[7,1.6,0],front:[4,2.8,-6],rear:[4,3,6],pilot:[0,3,8]}
function Model({view}:{view:string}){const boost=useRef(false),{camera}=useThree();useEffect(()=>{camera.position.set(...views[view]);camera.lookAt(0,.1,0)},[camera,view]);return <Vessel boost={boost}/>}
export default function VesselShowcase(){const view=new URLSearchParams(location.search).get('vessel')||'rear';return <div style={{position:'fixed',inset:0,background:'#08111d'}}><Canvas gl={{preserveDrawingBuffer:true}} dpr={1} camera={{fov:35,position:views[view]||views.rear}}><color attach="background" args={['#08111d']}/><ambientLight intensity={.65}/><directionalLight position={[4,6,5]} intensity={3.4} color="#c4dcf4"/><directionalLight position={[-3,2,-4]} intensity={2} color="#e4bc89"/><Suspense fallback={null}><Model view={views[view]?view:'rear'}/></Suspense></Canvas><div style={{position:'absolute',top:30,left:30,color:'#c6d2de'}}>SPIKE / EXPLORER · {view}<p>{Object.keys(views).map(v=><a style={{marginRight:20}} key={v} href={`?vessel=${v}&label=ship-${v}`}>{v}</a>)}</p></div><Capture/></div>}
