import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { WORLDS, SHARDS, pick, periodFor, workFor, type Lang } from './data'
import { useSpace } from './state'
import { positionOf } from './worldMotion'
import { atlasPoint, orbitAt, SYSTEM, realProjectIds } from './worldConfig'
import { dockOf } from './worldAnchors'
import { navigationPath } from './flightMath'
import { atlasLabels } from './atlasLayout'
import './atlas.css'
export default function StarAtlas({lang}:{lang:Lang}){
 const s=useSpace(),zh=lang==='zh'
 const [selected,setSelected]=useState(s.destination||s.experience||'bytedance'),[zoom,setZoom]=useState(false),[routes,setRoutes]=useState(true)
 const buttons=useRef<(HTMLButtonElement|null)[]>([]),w=WORLDS.find(w=>w.id===selected)||WORLDS[1]
 const [sx,sy]=atlasPoint(positionOf(w)),ship=atlasPoint(s.position),center=atlasPoint(SYSTEM.center)
 const projected=WORLDS.map(w=>{const [x,y]=atlasPoint(positionOf(w));return {id:w.id,x,y}}),labels=atlasLabels(projected)
 const orbitLines=useMemo(()=>WORLDS.map(w=>Array.from({length:145},(_,i)=>atlasPoint(orbitAt(w.orbit,w.orbit.period*i/144)).join(',')).join(' ')),[])
 const route=navigationPath(s.position,dockOf(w),WORLDS.map(w=>({position:positionOf(w),radius:w.radius})))
 const path=route.map(p=>atlasPoint(p).join(',')).join(' ')
 const distance=Math.round(Math.hypot(...positionOf(w).map((v,i)=>v-s.position[i])))
 const move=(e:KeyboardEvent,i:number)=>{const d=['ArrowRight','ArrowDown'].includes(e.key)?1:['ArrowLeft','ArrowUp'].includes(e.key)?-1:0;if(d){e.preventDefault();const next=(i+d+WORLDS.length)%WORLDS.length;setSelected(WORLDS[next].id);buttons.current[next]?.focus()}}
 const heading=atlasPoint([s.position[0]-Math.sin(s.heading)*20,s.position[1],s.position[2]-Math.cos(s.heading)*20]),rotation=Math.atan2(heading[1]-ship[1],heading[0]-ship[0])*180/Math.PI+90
 const offChart=ship[0]<16||ship[0]>984||ship[1]<16||ship[1]>651
 return <div className="star-atlas" lang={lang}>
 <header className="atlas-heading"><div><p>{zh?'航驰星野 / 经历星图':'SPIKE STARFIELD / EXPERIENCE ATLAS'}</p><h2>{zh?'五段经历，一个星系':'Five worlds, one journey'}</h2></div><span>01 — {String(WORLDS.length).padStart(2,'0')}</span></header>
 <div className="atlas-layout"><div className="atlas-map-column">
 <div className={`atlas-map ${zoom?'is-zoomed':''}`} aria-label={zh?'五颗经历星球的交互星图':'Interactive atlas of five experience worlds'}>
 <div className="atlas-map-world" style={{transformOrigin:`${sx/10}% ${sy/6.67}%`,transition:s.reduced?'none':undefined}}>
 <img className="atlas-art" src={`${import.meta.env.BASE_URL}textures/atlas/star-atlas-v2.jpg`} alt="" width="1536" height="1024" draggable="false"/>
 <svg className="atlas-lines" viewBox="0 0 1000 667" aria-hidden="true">
 <g className="atlas-orbital-paths">{orbitLines.map((points,i)=><polyline key={i} points={points} className={WORLDS[i].id===w.id?'selected':''}/>)}</g>
 {routes&&<polyline className="atlas-route" points={path}/>}
 <g transform={`translate(${center.join(' ')})`} className="atlas-beacon"><path d="M0 -5 L4 0 L0 5 L-4 0 Z"/><path d="M-11 0H-7M7 0H11"/></g>
 {labels.map(l=><path className="atlas-label-leader" key={l.id} d={`M${l.x} ${l.y} L${l.lx+4} ${l.ly+12}`}/>)}
 <g className="atlas-player" transform={`translate(${Math.max(16,Math.min(984,ship[0]))} ${Math.max(16,Math.min(651,ship[1]))})`}><path transform={`rotate(${rotation})`} d="M0 -9 L6 7 L0 4 L-6 7 Z"/><text x="12" y="4">{offChart?(zh?'图幅之外':'OFF CHART'):(zh?'你在这里':'YOU')}</text></g>
 </svg>
 {WORLDS.map((world,i)=>{const {x,y}=projected[i],label=labels[i],visited=s.progress.visited.includes(world.id);return <div key={world.id}>
 <button ref={el=>{buttons.current[i]=el}} className={`atlas-node ${world.id===selected?'selected':''}`} style={{left:x/10+'%',top:y/6.67+'%','--world-color':world.color,'--world-accent':world.accent,'--world-size':Math.max(20,world.radius*.64)+'px'} as CSSProperties} onClick={()=>setSelected(world.id)} onKeyDown={e=>move(e,i)} aria-pressed={world.id===selected} aria-label={`${pick(world.name,lang)} · ${visited?(zh?'已到访':'Visited'):(zh?'待探索':'Unvisited')}`}><span className="atlas-node-orb"/><small>{String(i+1).padStart(2,'0')}</small></button>
 <button className={`atlas-world-label ${world.id===selected?'selected':''}`} style={{left:label.lx/10+'%',top:label.ly/6.67+'%'}} onClick={()=>setSelected(world.id)} tabIndex={-1}><strong>{pick(world.name,lang)}</strong><span>{visited?'✓ ':''}{world.priority===0?(zh?'核心经历':'CORE WORLD'):world.priority===1?(zh?'持续探索':'GROWING WORLD'):(zh?'经历星球':'EXPERIENCE WORLD')}</span></button>
 </div>})}
 </div><div className="atlas-map-caption"><span>{zh?'斜俯视投影 · 展开时暂停航行':'OBLIQUE PROJECTION · FLIGHT PAUSED'}</span></div>
 <div className="atlas-controls"><button onClick={()=>setZoom(!zoom)} aria-pressed={zoom} aria-label={zh?'切换星图缩放':'Toggle atlas zoom'}>{zoom?'−':'+'}</button><button onClick={()=>setRoutes(!routes)} aria-pressed={routes}>{zh?'航线':'Route'}</button></div></div>
 <div className="atlas-system-tabs" role="group" aria-label={zh?'选择经历星球':'Choose an experience world'}>{WORLDS.map((world,i)=><button key={world.id} aria-pressed={selected===world.id} onClick={()=>{setSelected(world.id);setZoom(false)}}><small>0{i+1}</small>{pick(world.name,lang)}</button>)}</div>
 </div><aside className="atlas-dossier" aria-live="polite"><p className="atlas-dossier-kicker">{periodFor(w,lang)}</p><h3>{pick(w.name,lang)}</h3><p className="atlas-role">{pick(w.role,lang)}</p><p className="atlas-story">{pick(w.description,lang)}</p>
 <div className="atlas-facts"><span>{zh?'距离星球中心':'DISTANCE TO CENTER'}<b>{distance}<small>{zh?'模拟单位':'sim units'}</small></b></span><span>{zh?'项目已读':'PROJECTS READ'}<b>{w.slugs.filter(id=>s.progress.projects.includes(id)&&!id.startsWith('pending')).length}<small>/ {w.slugs.filter(id=>!id.startsWith('pending')).length||'—'}</small></b></span></div>
 <button className="atlas-depart" onClick={()=>s.navigate(w.id)}>{zh?'设为目的地 · 启航':'Set destination · Depart'}<span>↗</span></button>
 <button className="atlas-depart" onClick={()=>s.openExperience(w.id)}>{zh?'进入世界 · 旋转探索':'Enter world · Explore'} ↗</button><div className="atlas-projects"><p>{w.model==='hyundai'?(zh?'座舱项目 / 直接阅读':'COCKPIT PROJECT / READ DIRECTLY'):(zh?'经历项目 / 直接阅读':'EXPERIENCE PROJECTS / READ DIRECTLY')}</p>{w.slugs.map((id,i)=><button key={id} onClick={()=>s.openProject(id)}><small>{String(i+1).padStart(2,'0')}</small><span>{workFor(id,lang).name}<em>{id.startsWith('pending')?(zh?'资料待补充':'Details to be added'):s.progress.projects.includes(id)?(zh?'已阅读':'Read'):(zh?'阅读故事':'Read story')}</em></span><b>↗</b></button>)}</div>
 </aside></div>
 <footer className="atlas-footer"><span>{zh?'经历已到访':'WORLDS VISITED'} <b>{WORLDS.filter(w=>s.progress.visited.includes(w.id)).length} / {WORLDS.length}</b></span><span>{zh?'项目已阅读':'PROJECTS READ'} <b>{realProjectIds.filter(id=>s.progress.projects.includes(id)).length} / {realProjectIds.length}</b></span><span>{zh?'星尘':'STARDUST'} <b>{s.progress.shards.length} / {SHARDS.length}</b></span><button onClick={()=>s.update({race:true,checkpoint:0,raceTime:0,resetFlight:s.resetFlight+1,destination:null,panel:null,notice:'race'})}>{zh?'支线 · 星环航线':'OPTIONAL · RING COURSE'} ↗</button></footer>
 </div>
}
