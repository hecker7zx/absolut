// ============================================================
//  animations.js — 5-Scene Cinematic Timeline
//  Line-reveal typography · Camera choreography · Dynamic lighting
// ============================================================

/**
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Group}  bottle
 * @param {Object}       lights
 * @param {Object}       objects  — { raspberries, iceCubes, splash, coldFog }
 * @param {UnrealBloomPass} bloomPass
 * @param {THREE.Scene}  scene
 */
export function setupAnimations(camera, bottle, lights, objects, bloomPass, scene) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    const D = 1; // duration per scene segment

    // === Master scrub timeline ===
    const master = gsap.timeline({
        scrollTrigger: {
            trigger: '#scroll-spacer',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            invalidateOnRefresh: true,
        },
    });

    // Continuous bottle rotation (full 2π over entire scroll)
    master.to(bottle.rotation, {
        y: Math.PI * 2, duration: D * 5, ease: 'none',
    }, 0);

    // ============================================================
    //  SCENE 1 — Emergence From Darkness  (0 → D)
    // ============================================================

    master.to(camera.position, {
        x: 0, y: 0.15, z: 5,
        duration: D, ease: 'none',
        onUpdate: () => camera.lookAt(0, 0, 0),
    }, 0);

    master.to(scene.fog, { density: 0.055, duration: D, ease: 'power2.out' }, 0);

    master.to(lights.keyLight,     { intensity: 3.0,  duration: D * 0.65 }, D * 0.15);
    master.to(lights.rimLight,     { intensity: 1.2,  duration: D * 0.5  }, D * 0.25);
    master.to(lights.ambientLight, { intensity: 0.05, duration: D * 0.5  }, D * 0.2);
    master.to(lights.mouseLight,   { intensity: 0.6,  duration: D * 0.4  }, D * 0.3);
    master.to(bloomPass,           { strength: 0.2,   duration: D }, 0);

    // Scroll prompt
    master.to('#scroll-prompt', { opacity: 0, duration: D * 0.15 }, D * 0.03);

    // Text 1 — line reveal
    revealText(master, '#text-1', D * 0.3, D * 0.78, D);

    // ============================================================
    //  SCENE 2 — Raspberries  (D → 2D)
    // ============================================================

    master.to(camera.position, {
        x: -2, y: 0.5, z: 4.2,
        duration: D, ease: 'none',
        onUpdate: () => camera.lookAt(0, 0, 0),
    }, D);

    master.to(lights.rimLight,  { intensity: 3.8,  duration: D * 0.4 }, D);
    master.to(lights.fillLight, { intensity: 0.5,  duration: D * 0.3 }, D * 1.1);
    master.to(lights.keyLight,  { intensity: 2.5,  duration: D * 0.3 }, D * 1.1);
    master.to(bloomPass,        { strength: 0.25,  duration: D * 0.5 }, D);

    // Raspberries
    master.to(objects.raspberries.material, {
        opacity: 1, duration: D * 0.3, ease: 'power1.inOut',
    }, D * 0.05);

    revealText(master, '#text-2', D * 1.15, D * 1.72, D);

    // Raspberries fade out
    master.to(objects.raspberries.material, {
        opacity: 0, duration: D * 0.25,
    }, D * 1.8);

    // ============================================================
    //  SCENE 3 — Ice & Frost  (2D → 3D)
    // ============================================================

    master.to(camera.position, {
        x: 0.5, y: -0.25, z: 4.5,
        duration: D, ease: 'none',
        onUpdate: () => camera.lookAt(0, 0, 0),
    }, D * 2);

    master.to(lights.fillLight,   { intensity: 1.8,  duration: D * 0.35 }, D * 2);
    master.to(lights.rimLight,    { intensity: 1.2,  duration: D * 0.35 }, D * 2);
    master.to(lights.keyLight,    { intensity: 2.0,  duration: D * 0.3  }, D * 2.1);
    master.to(lights.bottomLight, { intensity: 0.2,  duration: D * 0.3  }, D * 2.1);
    master.to(scene.fog,          { density: 0.04,   duration: D * 0.4  }, D * 2);
    master.to(bloomPass,          { strength: 0.18,  duration: D * 0.4  }, D * 2);

    // Ice + fog in
    master.to(objects.iceCubes.material, {
        opacity: 1, duration: D * 0.3,
    }, D * 1.95);
    master.to(objects.coldFog.material, {
        opacity: 0.45, duration: D * 0.35,
    }, D * 2.1);

    revealText(master, '#text-3', D * 2.15, D * 2.72, D);

    // Ice + fog out
    master.to(objects.iceCubes.material, { opacity: 0, duration: D * 0.25 }, D * 2.8);
    master.to(objects.coldFog.material,  { opacity: 0, duration: D * 0.25 }, D * 2.8);

    // ============================================================
    //  SCENE 4 — Liquid Splash  (3D → 4D)
    // ============================================================

    master.to(camera.position, {
        x: 2.2, y: 0.3, z: 3.5,
        duration: D, ease: 'none',
        onUpdate: () => camera.lookAt(0, 0, 0),
    }, D * 3);

    master.to(lights.rimLight,  { intensity: 4.5,  duration: D * 0.3  }, D * 3);
    master.to(lights.keyLight,  { intensity: 4.0,  duration: D * 0.3  }, D * 3.1);
    master.to(lights.fillLight, { intensity: 0.8,  duration: D * 0.25 }, D * 3.1);
    master.to(bloomPass,        { strength: 0.38,  duration: D * 0.4  }, D * 3);
    master.to(scene.fog,        { density: 0.05,   duration: D * 0.3  }, D * 3);

    // Splash in
    master.to(objects.splash.material, {
        opacity: 0.85, duration: D * 0.3,
    }, D * 2.92);

    revealText(master, '#text-4', D * 3.15, D * 3.72, D);

    // Splash out
    master.to(objects.splash.material, { opacity: 0, duration: D * 0.25 }, D * 3.8);

    // ============================================================
    //  SCENE 5 — Premium Reveal  (4D → 5D)
    // ============================================================

    master.to(camera.position, {
        x: 0, y: 0.2, z: 3.2,
        duration: D, ease: 'none',
        onUpdate: () => camera.lookAt(0, 0, 0),
    }, D * 4);

    // Full studio lighting
    master.to(lights.keyLight,     { intensity: 5.0,  duration: D * 0.35 }, D * 4.1);
    master.to(lights.fillLight,    { intensity: 2.0,  duration: D * 0.35 }, D * 4.1);
    master.to(lights.rimLight,     { intensity: 3.2,  duration: D * 0.35 }, D * 4.1);
    master.to(lights.bottomLight,  { intensity: 0.5,  duration: D * 0.3  }, D * 4.15);
    master.to(lights.ambientLight, { intensity: 0.12, duration: D * 0.3  }, D * 4.15);
    master.to(lights.mouseLight,   { intensity: 1.2,  duration: D * 0.3  }, D * 4.15);

    // Spotlights
    master.to(lights.spotLight1, { intensity: 3.5, duration: D * 0.3 }, D * 4.15);
    master.to(lights.spotLight2, { intensity: 3.0, duration: D * 0.3 }, D * 4.2);

    // Fog + bloom
    master.to(scene.fog,  { density: 0.015, duration: D * 0.4 }, D * 4);
    master.to(bloomPass,  { strength: 0.55, duration: D * 0.5 }, D * 4.2);

    // Final text (stays visible)
    master.to('#text-5', { opacity: 1, duration: 0.01 }, D * 4.28);
    master.fromTo('#text-5 .line-inner',
        { yPercent: 110 },
        {
            yPercent: 0,
            stagger: 0.1,
            duration: D * 0.25,
            ease: 'power3.out',
        },
        D * 4.35
    );

    // ============================================================
    //  Visibility Toggles
    // ============================================================
    createVisibilityToggle(objects.raspberries.group, 16, 44);
    createVisibilityToggle(objects.iceCubes.group,    36, 64);
    createVisibilityToggle(objects.coldFog.group,     38, 64);
    createVisibilityToggle(objects.splash.group,      56, 84);

    // ============================================================
    //  Progress Bar
    // ============================================================
    gsap.to('#progress-fill', {
        scrollTrigger: {
            trigger: '#scroll-spacer',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
        },
        scaleX: 1,
        transformOrigin: 'left center',
    });

    return master;
}

// -------------------------------------------------------
//  Line-by-line text reveal helper
// -------------------------------------------------------
/**
 * Adds reveal-in and hide-out animations for a scene text block.
 * Uses the .line-inner / .scene-number / .scene-divider structure.
 *
 * @param {gsap.core.Timeline} tl   - parent timeline
 * @param {string}  selector        - e.g. '#text-1'
 * @param {number}  inTime          - timeline position for reveal-in
 * @param {number}  outTime         - timeline position for hide-out
 * @param {number}  D               - base duration unit
 */
function revealText(tl, selector, inTime, outTime, D) {
    // Show container
    tl.to(selector, { opacity: 1, duration: 0.01 }, inTime - D * 0.02);

    // Scene number fade in
    tl.fromTo(`${selector} .scene-number`,
        { opacity: 0, y: 8 },
        { opacity: 0.7, y: 0, duration: D * 0.12, ease: 'power2.out' },
        inTime
    );

    // Line-inner clip reveal (staggered)
    tl.fromTo(`${selector} .line-inner`,
        { yPercent: 110 },
        {
            yPercent: 0,
            stagger: 0.07,
            duration: D * 0.18,
            ease: 'power3.out',
        },
        inTime + D * 0.03
    );

    // Divider scale in
    tl.to(`${selector} .scene-divider`, {
        scaleX: 1, duration: D * 0.14, ease: 'power2.out',
    }, inTime + D * 0.12);

    // --- Hide ---
    tl.to(`${selector} .line-inner`, {
        yPercent: -110, stagger: 0.03, duration: D * 0.12,
    }, outTime);

    tl.to(`${selector} .scene-number`, {
        opacity: 0, duration: D * 0.08,
    }, outTime);

    tl.to(`${selector} .scene-divider`, {
        scaleX: 0, duration: D * 0.1,
    }, outTime);

    // Hide container
    tl.to(selector, { opacity: 0, duration: 0.01 }, outTime + D * 0.14);
}

function createVisibilityToggle(group, startPct, endPct) {
    const { ScrollTrigger } = window;
    ScrollTrigger.create({
        trigger: '#scroll-spacer',
        start: `${startPct}% top`,
        end: `${endPct}% top`,
        onEnter:     () => { group.visible = true; },
        onLeave:     () => { group.visible = false; },
        onEnterBack: () => { group.visible = true; },
        onLeaveBack: () => { group.visible = false; },
    });
}
