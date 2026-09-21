import {useEffect,useState} from 'react'
import WorldExplorer from '../universe/worlds/WorldExplorer'
import {useSpace} from '../universe/state'
import {WORLDS} from '../universe/data'
export default function WorldShowcase(){const s=useSpace(),[lang,setLang]=useState<'zh'|'en'>('zh');useEffect(()=>{const id=new URLSearchParams(location.search).get('world')||'bytedance';useSpace.getState().openExperience(WORLDS.some(w=>w.id===id)?id:'bytedance')},[]);return s.exploring?<WorldExplorer key={s.exploring} lang={lang} onLang={()=>setLang(l=>l==='zh'?'en':'zh')}/>:<div style={{padding:40,color:'white'}}><h1>世界预览</h1>{WORLDS.map(w=><button key={w.id} onClick={()=>s.openExperience(w.id)}>{w.name[0]}</button>)}<a href="/">返回网站</a></div>}
