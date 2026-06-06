// ============================================================
//  main.js — Cinematic Experience Orchestrator
//  Cursor · Mouse-Reactive Light · Post-FX · Render Loop
// ============================================================
import { createScene, handleResize } from './scene.js';
import { createBottle } from './bottle.js';
import { createParticles } from './particles.js';
import { createRaspberries, createIceCubes, createSplashParticles, createColdFog } from './objects.js';
import { setupAnimations } from './animations.js';
import { initCursor, setupMagnetics } from './cursor.js';

// -------------------------------------------------------
//  DOM
// -------------------------------------------------------
const canvas = document.getElementById('bottle-canvas');
const loader = document.getElementById('loader');
const loaderProgress = document.getElementById('loader-progress');

// -------------------------------------------------------
//  Loading
// -------------------------------------------------------
let loadProg = 0;
const progInterval = setInterval(() => {
    loadProg = Math.min(loadProg + 6 + Math.random() * 10, 88);
    if (loaderProgress) loaderProgress.style.width = `${loadProg}%`;
}, 130);

// -------------------------------------------------------
//  Scene
// -------------------------------------------------------
const {
    renderer, scene, camera, lights,
    composer, bloomPass, cinematicPass,
} = createScene(canvas);

// -------------------------------------------------------
//  3D Content
// -------------------------------------------------------
const bottleGroup = createBottle(scene);
const particles   = createParticles(scene);
const raspberries = createRaspberries(scene);
const iceCubes    = createIceCubes(scene);
const splash      = createSplashParticles(scene);
const coldFog     = createColdFog(scene);

const objects = { raspberries, iceCubes, splash, coldFog };

// -------------------------------------------------------
//  Finish Loading
// -------------------------------------------------------
clearInterval(progInterval);
if (loaderProgress) loaderProgress.style.width = '100%';
composer.render();

setTimeout(() => {
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => { loader.style.display = 'none'; }, 1200);
    }
}, 700);

// -------------------------------------------------------
//  Custom Cursor
// -------------------------------------------------------
const cursor = initCursor();

// -------------------------------------------------------
//  Magnetic Interactions
// -------------------------------------------------------
setupMagnetics();

// -------------------------------------------------------
//  Lenis Smooth Scrolling
// -------------------------------------------------------
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const lenis = new window.Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.7,
    touchMultiplier: 1.5,
});

lenis.on('scroll', ScrollTrigger.update);

// -------------------------------------------------------
//  GSAP Scroll Animations
// -------------------------------------------------------
setupAnimations(camera, bottleGroup, lights, objects, bloomPass, scene);

// -------------------------------------------------------
//  Mouse-Reactive Light State
// -------------------------------------------------------
const mouseLightTarget = { x: 0, y: 0 };
const mouseLight = lights.mouseLight;

document.addEventListener('mousemove', (e) => {
    mouseLightTarget.x = ((e.clientX / window.innerWidth)  * 2 - 1) * 4;
    mouseLightTarget.y = (-(e.clientY / window.innerHeight) * 2 + 1) * 2.5;
});

// -------------------------------------------------------
//  Unified Render Loop
// -------------------------------------------------------
gsap.ticker.add((time) => {
    const ms = time * 1000;

    // Lenis
    lenis.raf(ms);

    // Custom cursor
    if (cursor) cursor.update();

    // Mouse-reactive light (smooth follow)
    mouseLight.position.x += (mouseLightTarget.x - mouseLight.position.x) * 0.06;
    mouseLight.position.y += (mouseLightTarget.y - mouseLight.position.y) * 0.06;

    // Update cinematic shader time (for animated grain)
    if (cinematicPass) {
        cinematicPass.uniforms.uTime.value = time;
    }

    // Ambient particles
    particles.update(ms);

    // Scene objects (only when visible)
    if (raspberries.group.visible) raspberries.update(ms);
    if (iceCubes.group.visible)    iceCubes.update(ms);
    if (splash.group.visible)      splash.update(ms);
    if (coldFog.group.visible)     coldFog.update(ms);

    // Render with full post-processing pipeline
    composer.render();
});

gsap.ticker.lagSmoothing(0);

// -------------------------------------------------------
//  Resize
// -------------------------------------------------------
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        handleResize(renderer, camera, composer, bloomPass);
        ScrollTrigger.refresh();
    }, 100);
});

handleResize(renderer, camera, composer, bloomPass);

// -------------------------------------------------------
//  Debug FPS (add ?debug to URL)
// -------------------------------------------------------
if (window.location.search.includes('debug')) {
    let fc = 0, lt = performance.now();
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:10px;right:10px;z-index:10000;
        font:12px monospace;color:#0f0;background:rgba(0,0,0,.6);
        padding:4px 8px;border-radius:4px;pointer-events:none;`;
    document.body.appendChild(el);
    gsap.ticker.add(() => {
        fc++;
        const n = performance.now();
        if (n - lt >= 1000) { el.textContent = `${fc} FPS`; fc = 0; lt = n; }
    });
}
