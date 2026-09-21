import { worldFor, pick, periodFor, workFor, type Lang } from './data'
import { useSpace } from './state'
export default function ExperiencePanel({id,lang}:{id:string;lang:Lang}){
 const w=worldFor(id)!,s=useSpace(),zh=lang==='zh'
 return <><p className="space-eyebrow">{zh?'经历星球':'EXPERIENCE WORLD'} / {periodFor(w,lang)}</p><h2>{pick(w.name,lang)}</h2><p className="space-modal-lead">{pick(w.role,lang)}</p><p className="space-modal-lead">{pick(w.description,lang)}</p>
 <p className="experience-status">{w.model==='hyundai'?(zh?'蓝白工厂为视觉主题，实际项目位于下半部智能座舱。':'The factory is a visual theme; the project lives in the lower smart cockpit.'):(zh?'当前为占位外观，主题场景待后续设计。':'Placeholder appearance; a custom environment is to be designed.')}</p>
 <div className="atlas-projects">{w.slugs.map((slug,i)=><button key={slug} onClick={()=>s.openProject(slug)}><small>{String(i+1).padStart(2,'0')}</small><span>{workFor(slug,lang).name}<em>{slug.startsWith('pending')?(zh?'资料待补充，不计入项目成果':'Awaiting details; not counted as a project'):s.progress.projects.includes(slug)?(zh?'已阅读':'Read'):(zh?'阅读项目':'Read project')}</em></span><b>↗</b></button>)}</div>
 <div className="space-modal-actions"><button onClick={()=>s.setPanel('map')}>{zh?'返回星图':'Back to atlas'} ↗</button><button onClick={()=>s.setPanel(null)}>{zh?'继续飞行':'Resume flight'}</button><button onClick={()=>s.navigate(id)}>{zh?'领航至此':'Navigate here'} ↗</button></div></>
}
