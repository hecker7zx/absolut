// ============================================================
//  scene.js — Three.js Scene with Post-Processing Pipeline
//  Bloom · Film Grain · Chromatic Aberration · Mouse Light
// ============================================================
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// -------------------------------------------------------
//  Cinematic Post-FX Shader (Film Grain + Chromatic Aberration)
// -------------------------------------------------------
const CinematicShader = {
    uniforms: {
        tDiffuse:  { value: null },
        uTime:     { value: 0 },
        uGrain:    { value: 0.032 },
        uChromatic: { value: 0.0012 },
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uGrain;
        uniform float uChromatic;
        varying vec2 vUv;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
            vec2 uv = vUv;

            // --- Chromatic aberration (radial — stronger at edges) ---
            vec2 dir = uv - 0.5;
            float dist = length(dir);
            float ca = uChromatic * dist;

            float r = texture2D(tDiffuse, uv + dir * ca).r;
            float g = texture2D(tDiffuse, uv).g;
            float b = texture2D(tDiffuse, uv - dir * ca).b;
            vec3 color = vec3(r, g, b);

            // --- Film grain ---
            float grain = hash(uv * 800.0 + fract(uTime)) * uGrain;
            color += grain - uGrain * 0.5;

            // --- Subtle vignette burn ---
            float vig = 1.0 - dist * 0.35;
            color *= vig;

            gl_FragColor = vec4(color, 1.0);
        }
    `,
};

/**
 * Creates the full scene with cinematic post-processing pipeline:
 * RenderPass → UnrealBloom → CinematicShader → OutputPass
 */
export function createScene(canvas) {
    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020202);
    scene.fog = new THREE.FogExp2(0x020202, 0.12);

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(
        45, window.innerWidth / window.innerHeight, 0.1, 100
    );
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // --- Lights (all start at 0 for emergence) ---
    const keyLight = new THREE.SpotLight(0xfff5e6, 0);
    keyLight.position.set(3, 4, 4);
    keyLight.angle = Math.PI / 4;
    keyLight.penumbra = 0.5;
    keyLight.decay = 1.5;
    keyLight.distance = 25;
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.target.position.set(0, 0, 0);
    scene.add(keyLight, keyLight.target);

    const fillLight = new THREE.SpotLight(0xb3d4ff, 0);
    fillLight.position.set(-3, 3, 3);
    fillLight.angle = Math.PI / 3;
    fillLight.penumbra = 0.8;
    fillLight.decay = 1.5;
    fillLight.distance = 25;
    fillLight.target.position.set(0, 0, 0);
    scene.add(fillLight, fillLight.target);

    const rimLight = new THREE.PointLight(0xe91e63, 0);
    rimLight.position.set(0, 1, -3);
    rimLight.decay = 2;
    rimLight.distance = 15;
    scene.add(rimLight);

    const bottomLight = new THREE.PointLight(0xffffff, 0);
    bottomLight.position.set(0, -3, 2);
    bottomLight.decay = 2;
    bottomLight.distance = 12;
    scene.add(bottomLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0);
    scene.add(ambientLight);

    // Spotlights for Scene 5 reveal
    const spotLight1 = new THREE.SpotLight(0xffffff, 0);
    spotLight1.position.set(-4, 5, 3);
    spotLight1.angle = Math.PI / 5;
    spotLight1.penumbra = 0.6;
    spotLight1.decay = 1.5;
    spotLight1.distance = 20;
    spotLight1.target.position.set(0, 0, 0);
    scene.add(spotLight1, spotLight1.target);

    const spotLight2 = new THREE.SpotLight(0xffe4c4, 0);
    spotLight2.position.set(4, 5, 2);
    spotLight2.angle = Math.PI / 5;
    spotLight2.penumbra = 0.6;
    spotLight2.decay = 1.5;
    spotLight2.distance = 20;
    spotLight2.target.position.set(0, 0, 0);
    scene.add(spotLight2, spotLight2.target);

    // Mouse-reactive light — follows cursor for dynamic reflections
    const mouseLight = new THREE.PointLight(0xffffff, 0);
    mouseLight.position.set(0, 0, 4);
    mouseLight.decay = 2;
    mouseLight.distance = 12;
    scene.add(mouseLight);

    const lights = {
        keyLight, fillLight, rimLight,
        bottomLight, ambientLight,
        spotLight1, spotLight2, mouseLight,
    };

    // --- Environment Map ---
    const envMap = createStudioEnvironment(renderer);
    scene.environment = envMap;

    // --- Post-Processing Pipeline ---
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.12, 0.4, 0.85
    );
    composer.addPass(bloomPass);

    const cinematicPass = new ShaderPass(CinematicShader);
    composer.addPass(cinematicPass);

    composer.addPass(new OutputPass());

    return { renderer, scene, camera, lights, composer, bloomPass, cinematicPass };
}

// -------------------------------------------------------
//  Studio Environment Map (for glass reflections)
// -------------------------------------------------------
function createStudioEnvironment(renderer) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x080808);

    const panel = (color, w, h) => {
        const g = new THREE.PlaneGeometry(w, h);
        const m = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
        return new THREE.Mesh(g, m);
    };

    const p1 = panel(new THREE.Color(2.0, 1.9, 1.6), 3, 3);
    p1.position.set(5, 4, 3); p1.lookAt(0, 0, 0);
    envScene.add(p1);

    const p2 = panel(new THREE.Color(0.5, 0.7, 1.3), 2.5, 2.5);
    p2.position.set(-4, 3, 3); p2.lookAt(0, 0, 0);
    envScene.add(p2);

    const p3 = panel(new THREE.Color(1.6, 0.2, 0.5), 3, 3);
    p3.position.set(0, 2, -5); p3.lookAt(0, 0, 0);
    envScene.add(p3);

    const p4 = panel(new THREE.Color(0.7, 0.7, 0.8), 8, 8);
    p4.position.set(0, 8, 0); p4.rotation.x = Math.PI / 2;
    envScene.add(p4);

    const p5 = panel(new THREE.Color(1.0, 0.85, 0.4), 1.5, 4);
    p5.position.set(7, 0, -2); p5.lookAt(0, 0, 0);
    envScene.add(p5);

    const envMap = pmrem.fromScene(envScene, 0, 0.1, 100).texture;
    envScene.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
    });
    pmrem.dispose();
    return envMap;
}

/**
 * Resize handler — renderer, camera, composer, bloom.
 */
export function handleResize(renderer, camera, composer, bloomPass) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (composer) composer.setSize(w, h);
    if (bloomPass) bloomPass.resolution.set(w, h);
}
