import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import WorldShowcase from './qa/WorldShowcase'
import HyundaiShowcase from './qa/HyundaiShowcase'
import VesselShowcase from './qa/VesselShowcase'
import Capture from './qa/Capture'
import PromoIntro from './qa/PromoIntro'
import PromoStudio from './qa/PromoStudio'
import HarborReview from './qa/HarborReview'
import FrameDiagnostics from './universe/FrameDiagnostics'
const capture = import.meta.env.DEV && new URLSearchParams(window.location.search).has('capture')
const diagnostics = new URLSearchParams(window.location.search).has('diagnostics')
import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Works from './ui/Works'
import LoadingScreen from './ui/LoadingScreen'
import Universe from './universe/Universe'
import RenderBudget from './universe/RenderBudget'
import EntryConstellation from './universe/EntryConstellation'
import Flight from './universe/Flight'
import type { Journey } from './universe/cinematic'
import SpaceHUD from './universe/SpaceHUD'
import WorldExplorer from './universe/worlds/WorldExplorer'
import { clearInput, useSpace } from './universe/state'
import { useSkyEntry } from './universe/useSkyEntry'

type Lang = 'en' | 'zh'

const COPY = {
  en: {
    title: 'Spike',
    paragraphs: [] as string[],
  },
  zh: {
    title: 'Spike',
    paragraphs: [] as string[],
  },
}

function Hero({ lang, cueOpacity, scrollY }: { lang: Lang; cueOpacity: MotionValue<number>; scrollY: MotionValue<number> }) {
  const { title, paragraphs } = COPY[lang]
  // 首屏标题的淡出/模糊/视差：直接用窗口绝对滚动量 scrollY 驱动，与视口尺寸/字号解耦
  // （之前用 .about 容器的相对进度，宽屏大字号下容器变高，静止时进度就非 0 → 首屏即淡糊，故改此法）。
  // 页顶 scrollY=0 恒为清晰；下滑到约一屏高度渐糊淡出。
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const blur = useTransform(scrollY, [vh * 0.15, vh * 0.6], ['blur(0px)', 'blur(16px)'], { clamp: true })
  const opacity = useTransform(scrollY, [vh * 0.15, vh * 0.6], [1, 0], { clamp: true })
  // 视差：标题上升更快、字距随滚动拉开；正文上升慢一点
  const titleY = useTransform(scrollY, [0, vh], [0, -96])
  const bodyY = useTransform(scrollY, [0, vh], [0, -52])
  const titleSpacing = useTransform(scrollY, [0, vh], ['0.01em', '0.42em'])
  return (
    <section className="hero">
      <motion.div
        className="about"
        lang={lang}
        style={{ filter: blur, opacity }}
      >
        {/* 入场动画放内层，避免其 fill 锁住 opacity 覆盖外层滚动 opacity */}
        {/* about-shift：用 transform 下移，不改变 .about 几何盒（否则会污染 scrollYProgress 起点） */}
        <div className="about-shift">
          <div className="about-intro">
            <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
              {title}
            </motion.h1>
            {paragraphs.map((p, i) => (
              <motion.p key={i} className="about-body" style={{ y: bodyY }}>
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </motion.div>
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
        <span className="scroll-cue-label">{lang === 'en' ? 'SCROLL' : '向下滚动'}</span>
      </motion.div>
    </section>
  )
}

function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button className="lang-toggle" onClick={onToggle} aria-label="切换语言 / Switch language">
      {lang === 'en' ? '中文' : 'EN'}
    </button>
  )
}

function Portfolio() {
  const [lang, setLang] = useState<Lang>(() => { try { return localStorage.getItem('spike-language') === 'en' ? 'en' : 'zh' } catch { return 'zh' } })
  const [mode, setMode] = useState<'home' | 'launch' | 'space' | 'return'>('home')
  const [ready, setReady] = useState(false)
  const low = useSpace(s => s.low)
  const exploring = useSpace(s=>s.exploring)
  const journey = useRef<Journey>({ portrait: 1, progress: 0 })
  const savedScroll = useRef(0)
  const skipIntro = useRef(false)
  const mainRef = useRef<HTMLElement>(null)
  const toggleLanguage = () => setLang(l => l === 'zh' ? 'en' : 'zh')
  const enterSpace = useCallback(() => { skipIntro.current=false; savedScroll.current = window.scrollY; setReady(false); clearInput(); useSpace.getState().update({ panel: null, project: null, destination: null, race: false, checkpoint: 0, raceTime: 0 }); setMode('launch') }, [])
  useSkyEntry(mode === 'home', enterSpace)
  const exitSpace = () => { clearInput(); useSpace.getState().update({ panel: null, project: null, sound: false, destination: null, race: false }); setReady(false); setMode('return') }
  const onFlightReady = useCallback(() => { setMode('space'); setReady(true) }, [])
  const onReturned = useCallback(() => { setMode('home'); requestAnimationFrame(() => { window.scrollTo({top:savedScroll.current,behavior:'instant'}); document.querySelector<HTMLButtonElement>('.explore-entry')?.focus({preventScroll:true}) }) }, [])
  useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem('spike-language', lang) } catch { /* session fallback */ } }, [lang])
  useEffect(() => {
    if (mode === 'home') return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const main = mainRef.current
    main?.setAttribute('inert', '')
    return () => { document.body.style.overflow = previous; main?.removeAttribute('inert') }
  }, [mode])
  const { scrollY } = useScroll()
  // 作品区蒙层：以作品区顶部从视口底进入到视口中部的进度，驱动 3D 渐暗 + 模糊
  const worksRef = useRef(null)
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(
    worksProgress,
    [0, 1],
    ['rgba(8, 11, 18, 0)', 'rgba(8, 11, 18, 0.41)'] // 压暗减半（原 0.82）
  )

  // 滚动渐暗：离开首屏后压暗 3D 场景，保证履历文字可读
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
  // 首屏滚动提示随之淡出
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  // 首屏底部渐变底色：开始滑动后淡出

  // 磨砂右轨：进入履历区后淡入（首屏不磨砂）
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const railOpacity = useTransform(scrollY, [vh * 0.5, vh * 1.1], [0, 1])
  // 首屏装饰画框/角标：滚动后淡出
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  return (
    <div className={`site-root mode-${mode}`}>
      {/* 加载遮罩：模型全部加载完成前覆盖全屏，完成后淡出 */}
      <LoadingScreen />{import.meta.env.DEV&&new URLSearchParams(location.search).has('promo-intro')&&<style>{'.scene-bg{width:1280px!important;height:720px!important;right:auto!important;bottom:auto!important}'}</style>}
      {capture && !new URLSearchParams(location.search).has('promo-intro') && <Capture />}{import.meta.env.DEV&&new URLSearchParams(location.search).has('promo-intro')&&<PromoIntro launch={enterSpace}/>}
      {diagnostics && <output id="frame-diagnostics" style={{position:"fixed",bottom:0,left:0,zIndex:10000,background:"#000",color:"#fff",fontSize:11,pointerEvents:"none"}}/>}

      {/* 固定的 3D 背景 */}
      <div className="scene-bg" style={{ pointerEvents: mode === 'space' ? 'auto' : 'none' }}>
        <Canvas
          frameloop={exploring ? 'never' : 'always'}
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={low ? 1 : [1, 1.5]}
          camera={{ position: [0, 5, 19], fov: 39, near: 0.1, far: 4000 }}
          gl={{ preserveDrawingBuffer: capture, antialias: false, stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          {diagnostics && <FrameDiagnostics mode={mode} />}
          <RenderBudget/>
          <color attach="background" args={['#0a0e16']} />
          <Suspense fallback={null}>
            <Universe journey={journey} active={mode === 'space' && ready} portrait={mode === 'home' || mode === 'launch' || mode === 'return'} lang={lang} />
            <Scene home={mode === 'home'} journey={journey} />
            <EntryConstellation mode={mode} journey={journey}/>
            <Flight skipIntro={skipIntro} mode={mode} journey={journey} onReady={onFlightReady} onReturned={onReturned} />
          </Suspense>
        </Canvas>
      </div>

      {/* 滚动渐暗蒙层 */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />

      {/* 作品区固定蒙层：仅压暗（减半），模糊先注释掉 */}
      <motion.div
        className="stage-fog"
        style={{ background: fogBg }}
        aria-hidden="true"
      />

      {/* 固定磨砂右轨（进入履历区淡入） */}
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      {mode === 'home' && <LangToggle lang={lang} onToggle={toggleLanguage} />}
      {mode === 'home' && <motion.div className="explore-entry-wrap" style={{ opacity: heroChromeOpacity }}><button className="explore-entry" onClick={enterSpace}><span className="entry-orbit" aria-hidden="true"/><span>{lang === 'zh' ? '探索星空' : 'Explore the stars'}<small>{lang === 'zh' ? '每一段经历，都是一颗星球' : 'Every chapter, a world'}</small></span><span className="entry-arrow">↗</span></button></motion.div>}
      {(mode === 'launch' || (mode === 'space' && !ready) || mode === 'return') && <div className="warp-transition" role="status"><p>{lang === 'zh' ? (mode === 'return' ? '回到故事的起点' : '飞向故事的另一面') : (mode === 'return' ? 'BACK TO THE BEGINNING' : 'BEYOND THE PORTRAIT')}</p><span>{lang === 'zh' ? '航驰星野' : 'SPIKE / STARFIELD'}</span></div>}
      {mode === 'launch' && <button className="journey-skip" onClick={()=>{skipIntro.current=true}}>{lang==='zh'?'跳过入场 · 直接驾驶':'Skip arrival · Take the controls'} ↗</button>}
      {(mode === 'launch' || mode === 'return') && <button className="journey-return" onClick={exitSpace}>{lang === 'zh' ? '返回肖像 ↙' : 'Back to portrait ↙'}</button>}
      {mode === 'space' && exploring && <WorldExplorer key={exploring} lang={lang} onLang={toggleLanguage}/>}
      {mode === 'space' && <SpaceHUD lang={lang} onLang={toggleLanguage} onExit={exitSpace} ready={ready} />}

      {/* 首屏装饰：发丝内框 + 四角定位标 + 角标元数据（随滚动淡出） */}
      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">+</span>
        <span className="hero-mark tr">+</span>
        <span className="hero-mark bl">+</span>
        <span className="hero-mark br">+</span>
        <div className="hero-meta hm-tl">
          <span className="hm-name">{lang === 'zh' ? '毕航驰 Spike' : 'Bihangchi / Spike'}</span>
          <span>{lang === 'zh' ? '字节跳动 · 模型运营' : 'ByteDance · Model operations'}</span>
        </div>
        <div className="hero-meta hm-tr">Bihangchi — 2026</div>
        <div className="hero-meta hm-bl">{lang === 'zh' ? '重复是最好的老师' : 'Repetition is the best teacher'}</div>
        <div className="hero-meta hm-br">{lang === 'zh' ? '行动起来' : 'Make it happen'}</div>
        <div className="hero-meta hm-right">{lang === 'zh' ? '北京 · 大理' : 'Beijing · Dali'}</div>
      </motion.div>

      {/* 全屏胶片噪点蒙层（multiply 混合） */}
      <NoiseOverlay />

      {/* 可滚动内容 */}
      <main className="content" ref={mainRef} aria-hidden={mode !== 'home'}>
        <Hero lang={lang} cueOpacity={cueOpacity} scrollY={scrollY} />
        <Resume lang={lang} />
        <Works lang={lang} innerRef={worksRef} />
        <footer className="site-footer">
          <div><span className="footer-kicker">{lang === 'zh' ? '保持联系' : 'KEEP IN TOUCH'}</span><p>{lang === 'zh' ? '行动起来。' : 'Make it happen.'}</p></div>
          <a href="mailto:bihangchi9@163.com">bihangchi9@163.com ↗</a>
          <a href="https://github.com/bihangchi9-creator" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{lang === 'zh' ? '回到开场 ↑' : 'Back to the beginning ↑'}</button>
          <span className="footer-signature">{lang === 'zh' ? '毕航驰 Spike · 2026' : 'Bihangchi / Spike · 2026'}</span>
          <a className="nebula-credit" href="https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/" target="_blank" rel="noreferrer">{lang === 'zh' ? '星云影像' : 'Nebula imagery'} · NASA / ESA / CSA / STScI ↗</a>
        </footer>
      </main>
    </div>
  )
}

export default function App(){if(import.meta.env.DEV&&new URLSearchParams(location.search).has('harbor-review'))return <HarborReview/>;if(import.meta.env.DEV&&new URLSearchParams(location.search).has('promo-studio'))return <PromoStudio/>;if(import.meta.env.DEV && new URLSearchParams(location.search).has('world'))return <WorldShowcase/>;if(import.meta.env.DEV && new URLSearchParams(location.search).has('hyundai'))return <HyundaiShowcase/>;return import.meta.env.DEV && new URLSearchParams(location.search).has('vessel') ? <VesselShowcase/> : <Portfolio/>}
