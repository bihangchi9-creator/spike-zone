import { SYSTEM } from './worldConfig'
import { dockOf } from './worldAnchors'
import { EXPERIENCE } from './experienceConfig'
import { positionOf } from './worldMotion'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { fadeGroup, useReducedMotion, type WorldMode, type Journey } from './cinematic'
import * as THREE from 'three'
import { WORLDS, projectWorld, worldFor, RACE, SHARDS, SECRET, type V3 } from './data'
import Vessel from './Vessel'
import { launchFrame } from './visualMath'
import { segmentTouchesSphere, sphereContact, navigationPath } from './flightMath'
import { clearInput, flightInput as input, useSpace } from './state'

export default function Flight({mode,journey,onReady,onReturned,skipIntro}:{skipIntro:React.MutableRefObject<boolean>;mode:WorldMode;journey:React.MutableRefObject<Journey>;onReady:()=>void;onReturned:()=>void}){
 const {camera,size}=useThree()
 const ship=useRef<THREE.Group>(null)
 const boost=useRef(false),route=useRef({id:'',age:1,path:[] as V3[]})
 const seenIntro=useRef(false)
 useEffect(()=>{try{seenIntro.current=sessionStorage.getItem('spike-intro-seen')==='1'&&!(import.meta.env.DEV&&new URLSearchParams(location.search).has('promo-intro'))}catch{/* Session only */}},[])
 const reduced=useReducedMotion()
 const report=useRef(0),pitch=useRef(0),roll=useRef(0),wasPaused=useRef(false),shipAlpha=useRef(0)
 const phase=useRef<WorldMode>('home'),elapsed=useRef(0),completed=useRef(false)
 const pose=useMemo(()=>({homeP:new THREE.Vector3(),homeQ:new THREE.Quaternion(),homeFov:39,fromPortrait:1,fromShip:0,fromP:new THREE.Vector3(),fromQ:new THREE.Quaternion(),fromFov:60,pullback:new THREE.Vector3(),targetQ:new THREE.Quaternion()}),[])
 const sim=useRef({p:new THREE.Vector3(0,24,-32),velocity:new THREE.Vector3(),yaw:0,reset:useSpace.getState().resetFlight,race:0,docked:null as string|null})
 const tmp=useMemo(()=>({forward:new THREE.Vector3(),target:new THREE.Vector3(),offset:new THREE.Vector3(),direction:new THREE.Vector3(),dummy:new THREE.PerspectiveCamera(),cam:new THREE.Vector3(),before:new THREE.Vector3(),closest:new THREE.Vector3(),segment:new THREE.Line3()}),[])
 useEffect(()=>()=>clearInput(),[])
 useFrame((_,rawDt)=>{
  const dt=Math.min(rawDt,.04),s=useSpace.getState(),v=sim.current
  if(!ship.current)return
  if(mode==='home'){
   ship.current.visible=false
   pose.homeP.copy(camera.position);pose.homeQ.copy(camera.quaternion)
   pose.homeFov=camera instanceof THREE.PerspectiveCamera?camera.fov:39
   journey.current.portrait=1;journey.current.progress=0;phase.current='home'
   return
  }
  if(document.hidden)return
  if(phase.current!==mode){
   phase.current=mode;elapsed.current=0;completed.current=false;clearInput()
   pose.fromP.copy(camera.position);pose.fromQ.copy(camera.quaternion)
   pose.fromPortrait=journey.current.portrait;pose.fromShip=shipAlpha.current
   pose.fromFov=camera instanceof THREE.PerspectiveCamera?camera.fov:39
   if(mode==='launch'){
    v.p.set(0,24,-32);v.velocity.set(0,0,0);v.yaw=0;v.docked=null;roll.current=0
    pose.pullback.set(0,5,28).applyQuaternion(pose.homeQ).add(pose.homeP)
   }
  }
  if(mode==='launch'||mode==='return'){
   if(document.hidden)return
   elapsed.current+=dt
   const duration=reduced.current?.28:mode==='launch'?(seenIntro.current?EXPERIENCE.journey.repeatSeconds:EXPERIENCE.journey.launchSeconds):EXPERIENCE.journey.returnSeconds
   const t=mode==='launch'&&skipIntro.current?1:Math.min(1,elapsed.current/duration)
   const smooth=(x:number)=>THREE.MathUtils.smoothstep(x,0,1)
   if(mode==='launch'){
    const frame=launchFrame(t),{pull,settle}=frame
    tmp.cam.lerpVectors(pose.homeP,pose.pullback,pull)
    camera.position.copy(tmp.cam).lerp(tmp.target.set(0,28,-20),settle)
    camera.position.x+=Math.sin(settle*Math.PI)*4.2;camera.position.y+=Math.sin(settle*Math.PI)*1.2
    tmp.dummy.position.set(0,28,-20);tmp.dummy.lookAt(0,25,-40)
    camera.quaternion.slerpQuaternions(pose.homeQ,tmp.dummy.quaternion,settle)
    if(camera instanceof THREE.PerspectiveCamera)camera.fov=THREE.MathUtils.lerp(pose.homeFov,60,settle)
    journey.current.portrait=frame.portrait
    journey.current.progress=t
    ship.current.position.copy(v.p);ship.current.position.y-=8*(1-settle)
    ship.current.rotation.set(0,(1-settle)*.22,0)
    shipAlpha.current=frame.ship;fadeGroup(ship.current,frame.ship)
   }else{
    const e=smooth(t)
    camera.position.lerpVectors(pose.fromP,pose.homeP,e)
    camera.quaternion.slerpQuaternions(pose.fromQ,pose.homeQ,e)
    if(camera instanceof THREE.PerspectiveCamera)camera.fov=THREE.MathUtils.lerp(pose.fromFov,pose.homeFov,e)
    shipAlpha.current=pose.fromShip*(1-smooth(t/.5));fadeGroup(ship.current,shipAlpha.current)
    journey.current.portrait=THREE.MathUtils.lerp(pose.fromPortrait,1,smooth((t-.45)/.55))
    journey.current.progress=1-t
   }
   if(camera instanceof THREE.PerspectiveCamera)camera.updateProjectionMatrix()
   if(t===1&&!completed.current){completed.current=true;if(mode==='launch'){seenIntro.current=true;try{sessionStorage.setItem('spike-intro-seen','1')}catch{/* Session only */}onReady()}else onReturned()}
   return
  }
  journey.current.portrait=0;journey.current.progress=1;shipAlpha.current=1;fadeGroup(ship.current,1)
  if(v.reset!==s.resetFlight){v.p.set(0,24,-32);v.velocity.set(0,0,0);v.yaw=0;v.reset=s.resetFlight;v.race=0;v.docked=null}
  const paused=!!s.panel||!!s.project||!!s.exploring
  if(paused&&!wasPaused.current){v.velocity.set(0,0,0);clearInput()}
  wasPaused.current=paused
  tmp.before.copy(v.p)
  if(!paused){
   const keys=input.keys
   const turn=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+input.turn
   const thrust=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)+input.thrust
   const lift=(keys.has('KeyE')?1:0)-(keys.has('KeyQ')?1:0)+input.lift
   boost.current=(keys.has('ShiftLeft')||keys.has('ShiftRight')||input.boost)&&thrust>0
   const braking=keys.has('Space')||input.brake
   const manual=Math.abs(turn)+Math.abs(thrust)+Math.abs(lift)>0||braking
   if(manual){v.docked=null;if(s.destination)s.navigate(null)}
   const destination=s.destination&&!manual?worldFor(s.destination):null
   if(destination){
    v.docked=null
    const dock=dockOf(destination),remaining=v.p.distanceTo(tmp.target.set(...dock))
    route.current.age+=dt
    if(remaining<2){s.visit(destination.id);v.docked=destination.id;v.p.set(...dock);const focus=positionOf(destination);v.yaw=Math.atan2(-(focus[0]-v.p.x),-(focus[2]-v.p.z));s.navigate(null);v.velocity.set(0,0,0)}else{
     if(route.current.id!==destination.id||route.current.age>.6){route.current={id:destination.id,age:0,path:navigationPath(v.p.toArray() as V3,dock,WORLDS.map(w=>({position:positionOf(w),radius:w.radius}))).slice(1)}}
     while(route.current.path.length>1&&v.p.distanceTo(tmp.target.set(...route.current.path[0]))<12)route.current.path.shift()
     if(route.current.path.length===1)route.current.path[0]=dock
     const waypoint=route.current.path[0]
     if(!waypoint){v.velocity.multiplyScalar(Math.exp(-dt*5))}else{
      tmp.direction.set(...waypoint).sub(v.p).normalize()
      const desiredYaw=Math.atan2(-tmp.direction.x,-tmp.direction.z)
      v.yaw+=Math.atan2(Math.sin(desiredYaw-v.yaw),Math.cos(desiredYaw-v.yaw))*Math.min(1,dt*2)
      v.velocity.lerp(tmp.direction.multiplyScalar(Math.min(remaining>160?EXPERIENCE.flight.longCruise:EXPERIENCE.flight.cruise,remaining*.8)),1-Math.exp(-dt*1.8))
     }
    }
   }else if(v.docked){
    const world=worldFor(v.docked)!;v.p.set(...dockOf(world));const focus=positionOf(world);v.yaw=Math.atan2(-(focus[0]-v.p.x),-(focus[2]-v.p.z));v.velocity.set(0,0,0)
   }else{
    v.yaw-=turn*dt*1.25
    tmp.forward.set(-Math.sin(v.yaw),0,-Math.cos(v.yaw))
    const nearPlanet=WORLDS.some(p=>v.p.distanceTo(tmp.target.set(...positionOf(p)))<p.radius+13)
    const max=boost.current&&!nearPlanet?49:nearPlanet?12:23
    v.velocity.addScaledVector(tmp.forward,thrust*dt*(boost.current?36:23));v.velocity.y+=lift*dt*20
    v.velocity.multiplyScalar(Math.exp(-dt*(braking?5:thrust===0?1.1:.4)))
    if(v.velocity.length()>max)v.velocity.setLength(max)
   }
   v.p.addScaledVector(v.velocity,dt)
   for(const p of WORLDS){const contact=sphereContact(v.p.toArray() as V3,v.velocity.toArray() as V3,positionOf(p),p.radius+1.8);if(contact){v.p.set(...contact.position);v.velocity.set(...contact.velocity);s.navigate(null);v.docked=null}}
   for(const g of WORLDS)if(v.p.distanceTo(tmp.target.set(...positionOf(g)))<g.radius+40)s.visit(g.id)
   tmp.target.set(...SYSTEM.center);if(v.p.distanceTo(tmp.target)>SYSTEM.boundary){v.p.sub(tmp.target).setLength(SYSTEM.boundary-1).add(tmp.target);v.docked=null;v.velocity.multiplyScalar(-.2);s.update({notice:'boundary'});s.navigate(null)}
   SHARDS.forEach((p,i)=>{if(segmentTouchesSphere(tmp.before.toArray() as V3,v.p.toArray() as V3,p,3))s.collect(i)})
   if(v.p.distanceTo(tmp.target.set(...SECRET))<10)s.discover()
   if(s.race){v.race+=dt;if(segmentTouchesSphere(tmp.before.toArray() as V3,v.p.toArray() as V3,RACE[s.checkpoint],5.2)){if(s.checkpoint===RACE.length-1){s.finish(v.race);v.race=0}else s.update({checkpoint:s.checkpoint+1})}}
  }else{boost.current=false}
  ship.current.position.copy(v.p)
  ship.current.rotation.set(0,v.yaw,0)
  roll.current=THREE.MathUtils.damp(roll.current,-((input.keys.has('KeyD')||input.keys.has('ArrowRight')?1:0)-(input.keys.has('KeyA')||input.keys.has('ArrowLeft')?1:0)+input.turn)*.18,5,dt)
  ship.current.rotateZ(roll.current)
  pitch.current=THREE.MathUtils.damp(pitch.current,reduced.current?0:(boost.current?-.045:(input.brake||input.keys.has('Space'))?.045:0)-v.velocity.y*.003,4,dt);ship.current.rotateX(pitch.current)
  // Drag gives a bounded orbit; after releasing, the camera eases back behind the ship.
  const orbit=v.yaw+input.lookX
  const nearWorld=WORLDS.find(w=>v.p.distanceTo(tmp.direction.set(...positionOf(w)))<w.radius+90)
  const followDistance=nearWorld
    ? size.width<700 ? Math.max(75,nearWorld.radius*3)
      : nearWorld.model==='hyundai' ? 12 : Math.max(12,nearWorld.radius*1.35)
    : 12
  tmp.offset.set(Math.sin(orbit)*followDistance,4+input.lookY,Math.cos(orbit)*followDistance)
  tmp.cam.copy(v.p).add(tmp.offset)
  tmp.target.copy(v.p).add(new THREE.Vector3(-Math.sin(v.yaw)*8,1,-Math.cos(v.yaw)*8))
  if(v.docked)tmp.target.set(...positionOf(worldFor(v.docked)!))
  const inspected=s.project?projectWorld(s.project):s.panel==='experience'&&s.experience?worldFor(s.experience):null
  if(inspected&&v.p.distanceTo(tmp.direction.set(...positionOf(inspected)))<inspected.radius+160){tmp.target.set(...positionOf(inspected));const distance=inspected.radius*(size.width<700?7:3.4);tmp.cam.copy(tmp.target).add(new THREE.Vector3(distance*.24,inspected.radius*.45,distance))}
  camera.position.lerp(tmp.cam,1-Math.exp(-dt*(inspected?1.3:4)))
  tmp.dummy.position.copy(camera.position);tmp.dummy.lookAt(tmp.target)
  camera.quaternion.slerp(tmp.dummy.quaternion,1-Math.exp(-dt*5))
  if(camera instanceof THREE.PerspectiveCamera){camera.fov=THREE.MathUtils.damp(camera.fov,boost.current&&!reduced.current?65:60,3,dt);camera.updateProjectionMatrix()}
  report.current+=dt
  if(report.current>.15){report.current=0;let id:string|null=null,dist=Infinity;for(const p of WORLDS){const d=v.p.distanceTo(tmp.target.set(...positionOf(p)))-p.radius;if(d<dist){dist=d;id=p.id}}
   s.update({heading:v.yaw,position:v.p.toArray() as V3,speed:Math.round(v.velocity.length()),nearest:dist<55?id:null,route:s.destination?route.current.path:[],distance:Math.max(0,Math.round(dist)),raceTime:v.race})}
 })
 return <group ref={ship} visible={false}><Vessel boost={boost}/></group>
}
