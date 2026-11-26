/*!
 * Logo Particles – Double Play
 * WebGL-Partikel-Hero: Logo-Form aus Partikeln, Intro, zähe Maus-/Drag-Interaktion,
 * Scroll-Tilt und Auflösung in ein Partikelfeld.
 *
 * Benötigt:  window.LOGO_PARTICLES_DATA  (aus <projekt>.data.js, vorher laden)
 * Markup:    [data-logo-particles="hero"]    Hero-Section (100vh), Drag-Fläche + Optionen
 *            [data-logo-particles="chrome"]  optional – fixed Overlay, blendet beim Scrollen aus
 *            [data-logo-particles="split"]   optional – Text, wird buchstabenweise eingeblendet
 *            [data-logo-particles="replay"]  optional – Button: Intro neu abspielen
 *            [data-logo-particles="hint"]    optional – Hinweis, blendet nach Intro ein
 *            [data-logo-particles="intro-hide"] optional – z. B. Nav: versteckt, bis sich das Logo gebildet hat
 *                                             (kommt sofort zurück bei Scroll / Touch / Taste)
 *            [data-logo-particles="reveal"]  optional – Element blendet nach dem Intro weich von unten ein (z. B. Subline, Button)
 *            [data-logo-particles="reveal-words"] optional – Text blendet Wort für Wort ein (z. B. Headline)
 *                                             Reihenfolge = DOM-Reihenfolge, gestaffelt; data-lp-delay="ms" überschreibt
 * Optionen (Attribute auf der Hero-Section, alle optional):
 *   data-lp-viscosity="1"  data-lp-size="1"  data-lp-glow="1"  data-lp-flow="1"
 *   data-lp-shimmer="1"    data-lp-shimmer-speed="1"  data-lp-pulse="1"
 *   data-lp-dissolve-start="0.9"  data-lp-dissolve-length="1"  (in Bildschirmhöhen)
 *   data-lp-reveal-at="0.8"  (Anteil des Intros, ab dem intro-hide-Elemente einblenden)
 *   Kein Drag auf Links/Buttons/Formularfeldern; weitere Bereiche mit data-lp-no-drag ausnehmen
 *   data-lp-offset-y="0"  (Logo verschieben, Anteil der Bildschirmhöhe, + = nach oben)
 *   data-lp-scale="1"     (Logo-Größe)
 *   Beide auch mit eigenem Mobile-Wert: data-lp-offset-y-mobile, data-lp-scale-mobile (< 768 px)
 *   data-lp-mouse="1" data-lp-count="20000" data-lp-count-mobile="9000"
 *   data-lp-tints="#b6f5a0,#6fe3d6,#6f95dc"  (Farben des Hintergrund-Sternenfelds)
 * Tuning:    ?lp-tune an die URL hängen -> Regler-Panel inkl. "Attribute kopieren"
 * API:       window.LogoParticles.replay() / .destroy()
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

function init() {
  const hero = document.querySelector('[data-logo-particles="hero"]');
  const src = window.LOGO_PARTICLES_DATA;
  if (!hero || !src) { console.warn('[logo-particles] hero element or LOGO_PARTICLES_DATA missing'); return; }

  const opt = (name, def) => { const v = hero.getAttribute('data-lp-' + name); return v === null || v === '' ? def : parseFloat(v); };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 767px)').matches || (navigator.maxTouchPoints > 1 && innerWidth < 1000);
  const optR = (name, def) => { const m = isMobile ? hero.getAttribute('data-lp-' + name + '-mobile') : null;
    return m !== null && m !== '' ? parseFloat(m) : opt(name, def); };
  const COUNT = Math.round(isMobile ? opt('count-mobile', 9000) : opt('count', 20000));
  const STARS = isMobile ? 900 : 2200;
  const hexToRgb = h => { const n = parseInt(h.trim().replace('#', ''), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
  const tintAttr = hero.getAttribute('data-lp-tints');
  const tints = (tintAttr ? tintAttr.split(',').map(hexToRgb) : [[.71, .96, .63], [.44, .89, .84], [.44, .58, .86]]).concat([[1, 1, 1], [1, 1, 1]]);

  /* ---------- styles the module needs (layout/typo stays in Webflow) ---------- */
  const css = document.createElement('style');
  css.textContent = `
    .lp-canvas{position:fixed;inset:0;z-index:0;pointer-events:none}
    .lp-canvas canvas{display:block;width:100%;height:100%}
    [data-logo-particles="hero"]{cursor:grab;touch-action:pan-y;-webkit-user-select:none;user-select:none}
    [data-logo-particles="hero"]:active{cursor:grabbing}
    [data-logo-particles="chrome"]{pointer-events:none}
    [data-logo-particles="replay"]{pointer-events:auto}
    .lp-letter{display:inline-block;opacity:0;transform:translateY(.35em);filter:blur(6px);
      transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1),filter .9s}
    .lp-in .lp-letter{opacity:1;transform:none;filter:none}
    [data-logo-particles="hint"]{opacity:0}
    [data-logo-particles="intro-hide"]{transition:opacity .9s cubic-bezier(.2,.7,.2,1),visibility .9s}
    html:not(.lp-intro-done) [data-logo-particles="intro-hide"]{opacity:0;visibility:hidden;pointer-events:none}
    [data-logo-particles="reveal"],.lp-word{transition:opacity 1.1s cubic-bezier(.2,.7,.2,1),transform 1.1s cubic-bezier(.2,.7,.2,1),filter 1.1s cubic-bezier(.2,.7,.2,1)}
    .lp-word{display:inline-block}
    html.lp-intro-done [data-logo-particles="reveal"],html.lp-intro-done .lp-word{transition-delay:var(--lp-d,0ms)}
    html:not(.lp-intro-done) [data-logo-particles="reveal"]{opacity:0;transform:translateY(24px);filter:blur(8px);pointer-events:none}
    html:not(.lp-intro-done) .lp-word{opacity:0;transform:translateY(.45em);filter:blur(8px)}
    .lp-tune{position:fixed;left:16px;bottom:16px;z-index:9999;width:260px;padding:14px;border-radius:12px;
      background:rgba(8,11,18,.9);border:1px solid rgba(255,255,255,.12);color:#eef4f6;font:12px/1.3 system-ui,sans-serif;backdrop-filter:blur(12px)}
    .lp-tune label{display:grid;grid-template-columns:1fr auto;gap:3px 8px;margin-bottom:9px;opacity:.85}
    .lp-tune input{grid-column:1/-1;width:100%}
    .lp-tune button{width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:inherit;cursor:pointer}`;
  document.head.appendChild(css);

  const wrap = document.createElement('div');
  wrap.className = 'lp-canvas';
  wrap.setAttribute('aria-hidden', 'true');
  document.body.prepend(wrap);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    document.documentElement.classList.add('lp-no-webgl');   // -> in Webflow ein statisches Fallback zeigen
    document.documentElement.classList.add('lp-intro-done');
    wrap.remove(); return;
  }
  const DPR = Math.min(devicePixelRatio, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  /* ---------- logo particles ---------- */
  const SN = src.length / 6;
  const aTarget = new Float32Array(COUNT * 3), aStart = new Float32Array(COUNT * 3), aScatter = new Float32Array(COUNT * 3);
  const aColor = new Float32Array(COUNT * 3), aT = new Float32Array(COUNT), aRand = new Float32Array(COUNT * 4);
  const rnd = (() => { let s = 1337; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const sphere = (r0, r1) => {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, r = r0 + (r1 - r0) * Math.cbrt(rnd()), s = Math.sqrt(1 - u * u);
    return [r * s * Math.cos(th), r * s * Math.sin(th), r * u];
  };
  for (let i = 0; i < COUNT; i++) {
    const k = Math.floor(rnd() * SN) * 6;
    const t = src[k + 5] / 999;
    const x = (src[k] - 220 + (rnd() - .5) * 1.2) / 220;
    const y = -(src[k + 1] - 222 + (rnd() - .5) * 1.2) / 220;
    const z = 0.16 * Math.cos(t * Math.PI * 2) + (rnd() - .5) * 0.03;   // strands cross at different depth
    aTarget.set([x, y + 0.03, z], i * 3);
    aStart.set(sphere(2.2, 5.5), i * 3);
    aScatter.set(sphere(2.5, 9), i * 3);
    aColor.set([src[k + 2] / 255, src[k + 3] / 255, src[k + 4] / 255], i * 3);
    aT[i] = t;
    aRand.set([rnd(), rnd(), rnd(), rnd()], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(aTarget, 3));
  geo.setAttribute('aStart', new THREE.BufferAttribute(aStart, 3));
  geo.setAttribute('aScatter', new THREE.BufferAttribute(aScatter, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));
  geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
  geo.setAttribute('aRand', new THREE.BufferAttribute(aRand, 4));

  const settings = {
    size: opt('size', 1), glow: opt('glow', 1), flow: reduced ? 0 : opt('flow', 1),
    shimmer: reduced ? 0 : opt('shimmer', 1), shimmerSpeed: opt('shimmer-speed', 1), pulse: opt('pulse', 1),
    mouse: opt('mouse', 1), viscosity: opt('viscosity', 1),
    offsetY: optR('offset-y', 0), scale: optR('scale', 1),
    dissolveStart: opt('dissolve-start', 0.9), dissolveLength: Math.max(0.05, opt('dissolve-length', 1))
  };
  const uniforms = {
    uTime: { value: 0 }, uIntro: { value: reduced ? 1 : 0 }, uDissolve: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) }, uMouseB: { value: new THREE.Vector2(0, 0) }, uMousePresence: { value: 0 },
    uMouseAmt: { value: settings.mouse }, uAspect: { value: 1 }, uScale: { value: DPR }, uSize: { value: settings.size },
    uGlow: { value: settings.glow }, uJitter: { value: settings.shimmer }, uFlowTime: { value: 0 },
    uShimmerTime: { value: 0 }, uPulse: { value: settings.pulse }
  };

  const logoMat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
    vertexShader: /* glsl */`
      attribute vec3 aStart; attribute vec3 aScatter; attribute vec3 aColor; attribute float aT; attribute vec4 aRand;
      uniform float uTime, uIntro, uDissolve, uAspect, uScale, uSize, uMouseAmt, uJitter, uFlowTime, uLayer, uShimmerTime, uPulse;
      uniform vec2 uMouse, uMouseB; uniform float uMousePresence;
      varying vec3 vColor; varying float vAlpha; varying float vPulse;
      float ease(float x){ return 1.0 - pow(1.0 - clamp(x,0.,1.), 3.0); }
      void main(){
        // Intro: particles collapse from a diffuse cloud onto the loop, staggered along the path (t)
        float local = ease((uIntro * 1.9 - aT * 0.6 - aRand.z * 0.3));
        vec3 shape = position;
        float ph = aRand.y * 6.2831;
        shape += 0.0045 * uJitter * vec3(sin(uShimmerTime*1.7+ph), cos(uShimmerTime*1.3+ph*1.7), sin(uShimmerTime*1.1+ph*2.3));
        vec3 swirl = aStart;
        float a = (1.0 - local) * 2.2;
        swirl.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * swirl.xz;
        vec3 p = mix(swirl, shape, local);

        // Scroll dissolve into ambient field
        float d = smoothstep(aRand.w * 0.55, aRand.w * 0.55 + 0.45, uDissolve);
        p = mix(p, aScatter, d);

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vec4 clip = projectionMatrix * mv;

        // Mouse: local "uncertainty" – particles near the cursor get pushed apart
        vec2 ndc = clip.xy / clip.w;
        vec2 m = mix(uMouse, uMouseB, aRand.y);            // staggered, viscous follow
        vec2 dir = (ndc - m) * vec2(uAspect, 1.0);
        float dist = length(dir);
        float push = exp(-dist*dist / 0.03) * uMouseAmt * uMousePresence * (1.0 - d) * local;
        mv.xy += normalize(dir + 1e-5) * push * 0.12 * (0.6 + aRand.x);
        mv.z += push * 0.15 * (aRand.y - 0.5);
        gl_Position = projectionMatrix * mv;

        // Light pulses travelling along the loop
        float f1 = fract(aT - uFlowTime) ; float g1 = exp(-pow(min(f1, 1.0-f1), 2.0) / 0.0016);
        float f2 = fract(aT - uFlowTime - 0.5); float g2 = exp(-pow(min(f2, 1.0-f2), 2.0) / 0.0016);
        vPulse = max(g1, g2) * local * (1.0 - d) * uPulse;

        float big = step(0.985, aRand.x);
        float s = mix(1.0, 2.0, pow(aRand.x, 5.0)) + big * 2.5;
        s *= 1.0 + vPulse * 0.9 + push * 1.5;
        s *= mix(1.0, 0.8, d);
        if (uLayer > 0.5) s = 26.0 * (0.6 + aRand.x) * (1.0 - d) * local * local;
        gl_PointSize = uSize * s * uScale * (3.6 / -mv.z);
        vColor = aColor;
        vAlpha = (0.35 + 0.65 * local) * mix(1.0, 0.75, d) * (0.8 + 0.2 * sin(uShimmerTime * (0.6 + aRand.z) + ph) * min(uJitter, 1.5));
      }`,
    fragmentShader: /* glsl */`
      uniform float uGlow, uLayer;
      varying vec3 vColor; varying float vAlpha; varying float vPulse;
      void main(){
        float r = length(gl_PointCoord - 0.5) * 2.0;
        if (r > 1.0) discard;
        vec3 c = vColor;
        c = mix(vec3(dot(c, vec3(0.299,0.587,0.114))), c, 1.55);          // push the pastel gradient
        c = clamp(c, 0.0, 1.0);
        if (uLayer > 0.5) {                                               // soft nebula body
          float g = exp(-r * r * 3.5) * (1.0 - r);
          vec3 o = c * g * vAlpha * uGlow * 0.07;
          gl_FragColor = vec4(o, max(o.r, max(o.g, o.b)));
          return;
        }
        float core = exp(-r * r * 7.0);
        float halo = exp(-r * r * 2.2) * 0.35;
        vec3 col = mix(c, vec3(1.0), 0.08 + vPulse * 0.35);
        vec3 o = col * (core + halo) * vAlpha * uGlow * (0.95 + vPulse * 1.3);
        gl_FragColor = vec4(o, max(o.r, max(o.g, o.b)));
      }`
  });
  const group = new THREE.Group();
  uniforms.uLayer = { value: 0 };
  const glowMat = logoMat.clone();
  glowMat.uniforms = { ...uniforms, uLayer: { value: 1 } };
  const glowPts = new THREE.Points(geo, glowMat);
  geo.setDrawRange(0, COUNT);
  const glowGeo = geo.clone(); glowGeo.setDrawRange(0, Math.floor(COUNT * 0.12));
  glowPts.geometry = glowGeo;
  group.add(glowPts);
  group.add(new THREE.Points(geo, logoMat));
  scene.add(group);

  /* ---------- ambient starfield ---------- */
  const sPos = new Float32Array(STARS * 3), sCol = new Float32Array(STARS * 3), sR = new Float32Array(STARS);
  for (let i = 0; i < STARS; i++) {
    sPos.set(sphere(4, 14), i * 3);
    sCol.set(tints[Math.floor(rnd() * tints.length)], i * 3);
    sR[i] = rnd();
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('aColor', new THREE.BufferAttribute(sCol, 3));
  sGeo.setAttribute('aR', new THREE.BufferAttribute(sR, 1));
  const starMat = new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime, uScale: uniforms.uScale, uIntro: uniforms.uIntro, uDissolve: uniforms.uDissolve },
    transparent: true, depthWrite: false, blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
    vertexShader: `attribute vec3 aColor; attribute float aR; uniform float uTime,uScale,uIntro,uDissolve;
      varying vec3 vC; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.0 + pow(aR,8.)*3.0) * uScale * (6.0 / -mv.z) ;
        vC = aColor; vA = (0.25 + 0.5*aR) * (0.6 + 0.4*sin(uTime*(0.5+aR*1.5)+aR*40.)) * smoothstep(0.2,1.0,uIntro) * (1.0 + uDissolve*0.6); }`,
    fragmentShader: `varying vec3 vC; varying float vA;
      void main(){ float r = length(gl_PointCoord-.5)*2.; if(r>1.)discard; vec3 o = vC*exp(-r*r*5.)*vA; gl_FragColor = vec4(o, max(o.r,max(o.g,o.b))); }`
  });
  const stars = new THREE.Points(sGeo, starMat);
  scene.add(stars);

  /* ---------- interaction ---------- */
  const rot = { x: 0, y: 0, tx: 0, ty: 0 };
  const mouseTarget = new THREE.Vector2(0, 0);
  let mouseIn = 0, dragging = false, lastX = 0, lastY = 0;
  // Never start a drag on interactive content (links, buttons, inputs) or opt-out areas
  const NO_DRAG = 'a,button,input,textarea,select,label,[role="button"],[data-lp-no-drag]';
  let downX = 0, downY = 0, captured = false, pid = null;
  const onDown = e => {
    if (e.button > 0 || (e.target.closest && e.target.closest(NO_DRAG))) return;
    dragging = true; captured = false; pid = e.pointerId;
    lastX = downX = e.clientX; lastY = downY = e.clientY;
  };
  const onMove = e => {
    mouseTarget.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1));
    mouseIn = 1;
    if (!dragging) return;
    // capture the pointer only once it really moves, so plain clicks are never swallowed
    if (!captured && e.pointerType === 'mouse' && Math.hypot(e.clientX - downX, e.clientY - downY) > 4) {
      try { hero.setPointerCapture(pid); } catch (_) {}
      captured = true;
    }
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    rot.ty += dx * 0.005; rot.tx += (e.pointerType === 'mouse' ? dy : 0) * 0.005;
  };
  const onUp = () => { dragging = false; captured = false; };
  const onLeave = () => { mouseIn = 0; };
  hero.addEventListener('pointerdown', onDown);
  addEventListener('pointermove', onMove);
  addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
  document.addEventListener('mouseleave', onLeave);

  /* ---------- intro, labels, chrome ---------- */
  document.querySelectorAll('[data-logo-particles="split"]').forEach(el => {
    if (el.dataset.lpSplit) return; el.dataset.lpSplit = '1';
    const base = parseFloat(el.getAttribute('data-lp-delay') || '900');
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = [...el.textContent].map((c, i) =>
      `<span class="lp-letter" aria-hidden="true" style="transition-delay:${base + i * 60}ms">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  });
  // Headline / subline / button: staggered reveal once the logo has formed (DOM order)
  {
    let t = 0;
    const WORD_STEP = 70, EL_STEP = 160;
    document.querySelectorAll('[data-logo-particles="reveal"],[data-logo-particles="reveal-words"]').forEach(el => {
      const own = el.getAttribute('data-lp-delay');
      if (own !== null && own !== '') t = parseFloat(own);
      if (el.getAttribute('data-logo-particles') === 'reveal') {
        el.style.setProperty('--lp-d', t + 'ms'); t += EL_STEP; return;
      }
      if (!el.dataset.lpWords) {
        el.dataset.lpWords = '1';
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const nodes = []; while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
        nodes.forEach(n => {
          const frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = 'lp-word'; w.textContent = part; frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        });
      }
      el.querySelectorAll('.lp-word').forEach(w => { w.style.setProperty('--lp-d', t + 'ms'); t += WORD_STEP; });
      t += EL_STEP - WORD_STEP;
    });
  }
  const chromes = [...document.querySelectorAll('[data-logo-particles="chrome"]')];
  const hints = [...document.querySelectorAll('[data-logo-particles="hint"]')];
  const INTRO_MS = 3400;
  let introStart = performance.now();
  const lenis = () => window.lenis || window.__lenis || null;
  // Elements marked intro-hide (e.g. the nav) wait for the logo – but never block the user.
  const REVEAL_AT = Math.min(1, Math.max(0, opt('reveal-at', 0.8)));  // share of the intro
  const revealUI = () => document.documentElement.classList.add('lp-intro-done');
  ['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, revealUI, { passive: true }));
  addEventListener('scroll', () => { if (scrollY > 10) revealUI(); }, { passive: true });
  function replay() {
    if (!reduced && scrollY < 10) document.documentElement.classList.remove('lp-intro-done'); else revealUI();
    document.documentElement.classList.remove('lp-in');
    introStart = performance.now();
    uniforms.uIntro.value = reduced ? 1 : 0;
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('lp-in')));
  }
  document.querySelectorAll('[data-logo-particles="replay"]').forEach(b => b.addEventListener('click', () => {
    const l = lenis(); if (l && l.scrollTo) l.scrollTo(0); else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    replay();
  }));
  replay();

  /* ---------- resize ---------- */
  let baseScale = 1;
  const VIEW_H = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); // world units per viewport height (at z=0)
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    uniforms.uAspect.value = w / h;
    baseScale = Math.min(1.05, (w / h) * 0.95);
  }
  addEventListener('resize', resize); resize();

  /* ---------- loop ---------- */
  const clock = new THREE.Clock();
  let smoothScroll = 0, raf = 0, alive = true;
  function frame() {
    if (!alive) return;
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    uniforms.uTime.value = t;
    uniforms.uFlowTime.value += dt * 0.09 * settings.flow;
    uniforms.uShimmerTime.value += dt * settings.shimmerSpeed;
    if (!reduced) uniforms.uIntro.value = Math.min(1, (performance.now() - introStart) / INTRO_MS);
    if (uniforms.uIntro.value >= REVEAL_AT) revealUI();

    // scroll (Lenis already smooths -> lighter smoothing on top)
    const l = lenis();
    const y = l && typeof l.scroll === 'number' ? l.scroll : scrollY;
    const target = y / innerHeight;
    smoothScroll += (target - smoothScroll) * (reduced ? 1 : (l ? 0.3 : 0.08));
    const p1 = Math.min(1, smoothScroll);
    const p2 = Math.max(0, Math.min(1, (smoothScroll - settings.dissolveStart) / settings.dissolveLength));
    uniforms.uDissolve.value = p2;

    // viscous follow (frame-rate independent)
    const k = rate => 1 - Math.exp(-dt * rate / (0.25 + settings.viscosity));
    uniforms.uMouse.value.lerp(mouseTarget, k(3.0));
    uniforms.uMouseB.value.lerp(mouseTarget, k(1.1));
    uniforms.uMousePresence.value += (mouseIn - uniforms.uMousePresence.value) * k(1.5);
    rot.x += (rot.tx - rot.x) * k(2.6);
    rot.y += (rot.ty - rot.y) * k(2.6);
    if (!dragging) {
      rot.tx += -rot.tx * (1 - Math.exp(-dt * 0.35));
      rot.ty += -rot.ty * (1 - Math.exp(-dt * 0.25));
    }
    const sway = reduced ? 0 : 1;
    group.rotation.y = rot.y + Math.sin(t * 0.25) * 0.22 * sway;
    group.rotation.x = rot.x + Math.sin(t * 0.18) * 0.08 * sway - p1 * 0.95;
    group.rotation.z = -p1 * 0.25;
    group.scale.setScalar(baseScale * settings.scale * (1 - p1 * 0.38));
    group.position.y = settings.offsetY * VIEW_H + p1 * 0.42;
    stars.rotation.y = t * 0.006 + smoothScroll * 0.15;
    stars.rotation.x = smoothScroll * 0.1;

    const chromeOp = Math.max(0, 1 - p1 * 2.2);
    for (const c of chromes) c.style.opacity = chromeOp;
    const hintOp = Math.max(0, uniforms.uIntro.value - 0.8) * 5 * (1 - Math.min(1, p1 * 6));
    for (const h of hints) h.style.opacity = hintOp;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  /* ---------- tuning panel (?lp-tune) ---------- */
  if (/[?&]lp-tune/.test(location.search)) {
    const defs = [['size', 'Partikelgröße', 0.4, 2.5], ['glow', 'Helligkeit', 0.2, 2], ['flow', 'Puls-Tempo', 0, 3],
      ['pulse', 'Puls-Helligkeit', 0, 2], ['shimmer', 'Schimmern', 0, 3], ['shimmer-speed', 'Schimmer-Tempo', 0, 3],
      ['viscosity', 'Zähigkeit', 0, 3], ['mouse', 'Maus-Streuung', 0, 2],
      ['dissolve-start', 'Auflösung Start (vh)', 0, 3], ['dissolve-length', 'Auflösung Dauer (vh)', 0.1, 3],
      ['offset-y', 'Logo-Position (vh)', -0.4, 0.4], ['scale', 'Logo-Größe', 0.4, 1.6]];
    const apply = { size: v => uniforms.uSize.value = v, glow: v => uniforms.uGlow.value = v, flow: v => settings.flow = v,
      shimmer: v => uniforms.uJitter.value = v, pulse: v => uniforms.uPulse.value = v,
      'shimmer-speed': v => settings.shimmerSpeed = v,
      'dissolve-start': v => settings.dissolveStart = v, 'dissolve-length': v => settings.dissolveLength = Math.max(0.05, v),
      'offset-y': v => settings.offsetY = v, scale: v => settings.scale = v, viscosity: v => settings.viscosity = v, mouse: v => uniforms.uMouseAmt.value = v };
    const panel = document.createElement('div'); panel.className = 'lp-tune';
    const ck = k => k.replace(/-(\w)/g, (m, c) => c.toUpperCase());   // attribute name -> settings key
    panel.innerHTML = defs.map(([k, l, mn, mx]) =>
      `<label>${l} <output>${settings[ck(k)].toFixed(2)}</output><input type="range" data-k="${k}" min="${mn}" max="${mx}" step="0.05" value="${settings[ck(k)]}"></label>`).join('')
      + '<button type="button">Attribute kopieren</button>';
    panel.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return;
      const v = +e.target.value; settings[ck(k)] = v; apply[k](v); e.target.previousElementSibling.textContent = v.toFixed(2); });
    panel.querySelector('button').addEventListener('click', async e => {
      const txt = defs.map(([k]) => `data-lp-${k}${isMobile && (k === 'offset-y' || k === 'scale') ? '-mobile' : ''}="${(+settings[ck(k)]).toFixed(2)}"`).join(' ');
      try { await navigator.clipboard.writeText(txt); e.target.textContent = 'Kopiert ✓'; }
      catch { e.target.textContent = txt; }
    });
    document.body.appendChild(panel);
  }

  /* ---------- API (z. B. für Page-Transitions) ---------- */
  window.LogoParticles = {
    replay,
    destroy() {
      alive = false; cancelAnimationFrame(raf);
      hero.removeEventListener('pointerdown', onDown);
      removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onUp); removeEventListener('resize', resize);
      document.removeEventListener('mouseleave', onLeave);
      geo.dispose(); glowGeo.dispose(); sGeo.dispose(); logoMat.dispose(); glowMat.dispose(); starMat.dispose();
      renderer.dispose(); wrap.remove();
    }
  };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
