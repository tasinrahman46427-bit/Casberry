import { useEffect, useRef, useState } from 'react';
import AeroShards from './AeroShards';
import FlexCarousel from './FlexCarousel';
import GlowCursor from './GlowCursor';
import TechText from './TechText';
import ShaderCanvas from './ShaderCanvas';
import './App.css';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* Scroll-in reveal: adds .in when visible */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* Per-section scroll progress (0..1) exposed as --p, used for parallax / sticky scenes */
function useScrollProgress() {
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      document.documentElement.style.setProperty('--page', clamp(scrollY / (document.body.scrollHeight - innerHeight)));
      document.querySelectorAll('[data-scroll]').forEach(el => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--p', clamp((innerHeight - r.top) / (innerHeight + r.height)).toFixed(4));
        el.style.setProperty('--sticky', clamp(-r.top / Math.max(r.height - innerHeight, 1)).toFixed(4));
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); };
  }, []);
}

/* Words light up as you scroll through the section */
function ScrollWords({ text }) {
  const ref = useRef(null);
  const words = text.split(' ');
  useEffect(() => {
    const sec = ref.current.closest('[data-scroll]');
    const spans = ref.current.querySelectorAll('span');
    let raf = 0;
    const f = () => {
      const p = clamp(parseFloat(getComputedStyle(sec).getPropertyValue('--sticky')) || 0);
      spans.forEach((s, i) => { s.style.opacity = clamp((p * 1.3 - i / spans.length) * 6, 0.12, 1); });
      raf = requestAnimationFrame(f);
    };
    f();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <p ref={ref} className="words">{words.map((w, i) => <span key={i}>{w} </span>)}</p>;
}

function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const t0 = performance.now();
      const run = t => {
        const k = clamp((t - t0) / 1600);
        setV(Math.round(to * (1 - Math.pow(1 - k, 4))));
        if (k < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
      io.disconnect();
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1737071371043-761e02b1ef95?w=1200&q=80&auto=format', alt: 'Chrome sculpture', title: 'Iridescence', subtitle: 'Collection 01' },
  { src: 'https://images.unsplash.com/photo-1739056238917-d89cd05c48d5?w=1200&q=80&auto=format', alt: 'Twisted chrome form', title: 'Liquid Metal', subtitle: 'Collection 02' },
  { src: 'https://images.unsplash.com/photo-1747191092806-c7da11881986?w=1200&q=80&auto=format', alt: 'Clay bust', title: 'Clay Study', subtitle: 'Collection 03' },
  { src: 'https://images.unsplash.com/photo-1770249196550-ff6c641165cb?w=1200&q=80&auto=format', alt: 'Chrome humanoid', title: 'Automaton', subtitle: 'Collection 04' },
  { src: 'https://images.unsplash.com/photo-1726910133626-9b573eca70ff?w=1200&q=80&auto=format', alt: 'Black fins', title: 'Fins', subtitle: 'Collection 05' },
  { src: 'https://images.unsplash.com/photo-1604854574958-59047362c165?w=1200&q=80&auto=format', alt: 'Plaster bust', title: 'Plaster', subtitle: 'Collection 06' }
];

const FEATURES = [
  ['01', 'GPU Native', 'Every pixel is drawn on the GPU at a locked 60 FPS.'],
  ['02', 'Scroll Driven', 'Sections react to scroll position, not just viewport entry.'],
  ['03', 'Interactive', 'Cursor, click and hold all change the scene.'],
  ['04', 'Zero Bloat', 'Pauses offscreen to save battery and bandwidth.'],
  ['05', 'Exportable', 'Shaders ship as clean, dependency-free components.'],
  ['06', 'Accessible', 'Respects reduced-motion and keyboard navigation.']
];

const STEPS = [
  ['Compose', 'Sculpt shaders with faders, palettes and post FX.'],
  ['Preview', 'See changes live on your real layout.'],
  ['Export', 'Copy a clean React component into your project.'],
  ['Ship', 'Deploy with free commercial rights.']
];

export default function App() {
  useReveal();
  useScrollProgress();
  const [noGpu, setNoGpu] = useState(false);

  return (
    <main className="site">
      <div className="progress" />
      <nav className="nav">
        <b>Casberry</b>
        <div><a href="#work">Work</a><a href="#features">Features</a><a href="#studio">Studio</a><a href="#cta">Contact</a></div>
      </nav>

      {/* 1 — HERO: AeroShards */}
      <section className="hero" data-scroll>
        <div className="hero__bg" style={{ transform: 'translateY(calc(var(--p) * 18vh)) scale(calc(1 + var(--p) * .1))' }}>
          {noGpu ? (
            <ShaderCanvas />
          ) : (
            <AeroShards shardColor="#896ABD" accentColor="#A855F7" placement="full" material="glass" markers="plus"
              count={1300} depthOfField={0.75} vignette={0.3} mouseInteraction pulseOnClick holdToGather
              onError={() => setNoGpu(true)} />
          )}
        </div>
        <div className="hero__copy" style={{ opacity: 'calc(1 - var(--p) * 2.2)' }}>
          <span className="tag reveal">Procedural · Interactive · Real-time</span>
          <h1 className="reveal d1">Light, glass &amp;<br />living shaders.</h1>
          <p className="reveal d2">A fully animated, GPU-powered experience. Move your cursor, click, or hold to play.</p>
          <div className="reveal d3"><a className="btn" href="#work">Explore work</a><a className="btn ghost" href="#studio">Shader Studio</a></div>
        </div>
        <div className="scrollhint">Scroll ↓</div>
      </section>

      {/* 2 — MANIFESTO: scroll-linked word reveal */}
      <section className="manifesto" data-scroll>
        <div className="sticky">
          <ScrollWords text="We build interfaces that feel alive. Every surface reacts, every pixel is computed, and every scroll tells a story. Motion is not decoration — it is the product." />
        </div>
      </section>

      {/* 3 — CARDS: FlexCarousel */}
      <section id="work" className="work" data-scroll>
        <header className="reveal">
          <span className="tag">Selected work</span>
          <h2>Drag, scroll, click a card.</h2>
        </header>
        <div className="work__stage reveal d1" style={{ transform: 'scale(calc(.92 + var(--p) * .12))' }}>
          <FlexCarousel items={GALLERY} preset="liquid" intro="rise" cardHeight={0.5} gap={12} squeeze={0.2} focusOnClick captions />
        </div>
      </section>

      {/* 4 — FEATURES: staggered cards + GlowCursor */}
      <section id="features" className="features">
        <GlowCursor color="#5f8bff" intensity={1.3} trailWidth={3} linger={1.4} glow={1.2} clickBurst theme="dark">
          <div className="features__inner">
            <header className="reveal"><span className="tag">Features</span><h2>Built to be touched.</h2></header>
            <div className="grid">
              {FEATURES.map(([n, t, d], i) => (
                <article key={n} className="card reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                  <em>{n}</em><h3>{t}</h3><p>{d}</p>
                </article>
              ))}
            </div>
          </div>
        </GlowCursor>
      </section>

      {/* 5 — SHADER STUDIO + TechText */}
      <section id="studio" className="studio" data-scroll>
        <div className="studio__bg" style={{ opacity: 'calc(.35 + var(--p) * .65)' }}>
          <ShaderCanvas primary="#896ABD" secondary="#5f8bff" />
        </div>
        <div className="studio__content">
          <span className="tag reveal">Powered by Shader Studio</span>
          <div className="studio__type reveal d1" style={{ transform: 'translateX(calc((var(--p) - .5) * -12vw))' }}>
            <TechText text="Shader Studio" fontWeight={700} fontSize={170} reveal="letter" intro="assemble" introDuration={2} clickKick />
          </div>
          <p className="reveal d2">Compose procedural WebGL2 shaders, tune 15+ post FX, then export clean code for React, Vue or Three.js.</p>
          <a className="btn reveal d3" href="https://shaderstudio.dev/" target="_blank" rel="noreferrer">Open Shader Studio</a>
        </div>
      </section>

      {/* 6 — STICKY STEPS: scroll-pinned scene */}
      <section className="steps" data-scroll>
        <div className="sticky steps__pin">
          <h2>How it works</h2>
          <div className="steps__list">
            {STEPS.map(([t, d], i) => (
              <div key={t} className="step"
                style={{ '--i': i, opacity: `calc(.18 + clamp(0, (var(--sticky) * 4.2 - ${i}), 1) * .82)`, transform: `translateY(calc((1 - clamp(0, (var(--sticky) * 4.2 - ${i}), 1)) * 40px))` }}>
                <span>0{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div>
              </div>
            ))}
          </div>
          <div className="bar"><i style={{ transform: 'scaleX(var(--sticky))' }} /></div>
        </div>
      </section>

      {/* 7 — STATS + CTA */}
      <section id="cta" className="cta">
        <GlowCursor color="#A855F7" intensity={1.4} glow={1.4} clickBurst theme="dark">
          <div className="cta__inner">
            <div className="stats">
              {[[60, ' FPS'], [15, '+ Post FX'], [1600, '+ Fonts'], [0, ' Dependencies']].map(([n, s], i) => (
                <div key={i} className="reveal" style={{ transitionDelay: `${i * 100}ms` }}><b><Counter to={n} suffix={s} /></b></div>
              ))}
            </div>
            <h2 className="reveal">Let’s make something that moves.</h2>
            <a className="btn big reveal d1" href="mailto:hello@example.com">Start a project</a>
            <footer className="reveal d2">© 2026 Casberry · Built with React Bits &amp; Shader Studio</footer>
          </div>
        </GlowCursor>
      </section>
    </main>
  );
}
