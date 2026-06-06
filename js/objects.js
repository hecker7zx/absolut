// ============================================================
//  objects.js — Scene-Specific 3D Objects
//  Raspberries · Ice Cubes · Liquid Splash · Cold Fog
// ============================================================
import * as THREE from 'three';

// -------------------------------------------------------
//  RASPBERRIES  (Scene 2)
// -------------------------------------------------------
export function createRaspberries(scene) {
    const group = new THREE.Group();
    group.visible = false;

    const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0.76, 0.09, 0.36),
        roughness: 0.35,
        metalness: 0.0,
        clearcoat: 0.8,
        clearcoatRoughness: 0.12,
        transparent: true,
        opacity: 0,
    });

    const configs = [
        { x:  1.6,  y:  0.5,  z:  1.0,  size: 0.35, rs: 0.30 },
        { x: -1.9,  y: -0.2,  z:  0.8,  size: 0.42, rs: 0.20 },
        { x:  0.6,  y:  1.3,  z:  1.6,  size: 0.26, rs: 0.40 },
        { x: -1.3,  y:  0.9,  z:  1.2,  size: 0.32, rs: 0.35 },
        { x:  1.9,  y: -0.6,  z: -0.5,  size: 0.38, rs: 0.25 },
        { x: -0.9,  y: -1.1,  z:  1.7,  size: 0.28, rs: 0.32 },
    ];

    const berries = [];
    configs.forEach((cfg, idx) => {
        const mesh = buildRaspberryMesh(cfg.size, material);
        mesh.position.set(cfg.x, cfg.y, cfg.z);
        mesh.userData.rotSpeed = cfg.rs;
        mesh.userData.baseY = cfg.y;
        mesh.userData.phase = idx * 1.1;
        group.add(mesh);
        berries.push(mesh);
    });

    scene.add(group);

    return {
        group,
        material,
        update(timeMs) {
            const t = timeMs * 0.001;
            berries.forEach(b => {
                b.rotation.y = t * b.userData.rotSpeed;
                b.rotation.x = Math.sin(t * 0.45 + b.userData.phase) * 0.12;
                b.position.y = b.userData.baseY
                    + Math.sin(t * 0.35 + b.userData.phase) * 0.18;
            });
        },
    };
}

function buildRaspberryMesh(size, material) {
    const geo = new THREE.IcosahedronGeometry(size, 3);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const len = Math.sqrt(x * x + y * y + z * z);
        const nx = x / len, ny = y / len, nz = z / len;

        // Drupelet bump pattern
        const freq = 14;
        const bump = Math.sin(nx * freq) * Math.sin(ny * freq) * Math.sin(nz * freq);
        const r = size * (0.86 + 0.14 * Math.abs(bump));

        pos.setXYZ(i, nx * r, ny * r * 1.12, nz * r);
    }

    geo.computeVertexNormals();
    return new THREE.Mesh(geo, material);
}

// -------------------------------------------------------
//  ICE CUBES  (Scene 3)
// -------------------------------------------------------
export function createIceCubes(scene) {
    const group = new THREE.Group();
    group.visible = false;

    const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0.82, 0.92, 1.0),
        roughness: 0.08,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        envMapIntensity: 2.5,
        transparent: true,
        opacity: 0,
    });

    const configs = [
        { x:  1.3,  y: -0.3,  z:  1.0,  s: 0.32, rs: 0.40 },
        { x: -1.6,  y:  0.3,  z:  0.7,  s: 0.38, rs: 0.30 },
        { x:  0.4,  y:  0.9,  z:  1.4,  s: 0.26, rs: 0.50 },
        { x: -0.9,  y: -0.7,  z:  1.2,  s: 0.30, rs: 0.35 },
        { x:  1.7,  y:  0.6,  z: -0.4,  s: 0.34, rs: 0.28 },
    ];

    const cubes = [];
    configs.forEach((cfg, idx) => {
        const geo = new THREE.BoxGeometry(cfg.s, cfg.s, cfg.s, 2, 2, 2);
        // Displace for irregular ice
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
            p.setX(i, p.getX(i) + (Math.random() - 0.5) * cfg.s * 0.07);
            p.setY(i, p.getY(i) + (Math.random() - 0.5) * cfg.s * 0.07);
            p.setZ(i, p.getZ(i) + (Math.random() - 0.5) * cfg.s * 0.07);
        }
        geo.computeVertexNormals();

        const cube = new THREE.Mesh(geo, material);
        cube.position.set(cfg.x, cfg.y, cfg.z);
        cube.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        cube.userData.rotSpeed = cfg.rs;
        cube.userData.baseY = cfg.y;
        cube.userData.phase = idx * 1.4;
        group.add(cube);
        cubes.push(cube);
    });

    scene.add(group);

    return {
        group,
        material,
        update(timeMs) {
            const t = timeMs * 0.001;
            cubes.forEach(c => {
                c.rotation.x += 0.0008 * c.userData.rotSpeed;
                c.rotation.z += 0.0012 * c.userData.rotSpeed;
                c.position.y = c.userData.baseY
                    + Math.sin(t * 0.25 + c.userData.phase) * 0.12;
            });
        },
    };
}

// -------------------------------------------------------
//  COLD FOG  (Scene 3)
// -------------------------------------------------------
export function createColdFog(scene) {
    const group = new THREE.Group();
    group.visible = false;

    // Soft circular gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(200,220,255,0.35)');
    grad.addColorStop(0.5, 'rgba(200,220,255,0.1)');
    grad.addColorStop(1, 'rgba(200,220,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    const COUNT = 55;
    const positions = new Float32Array(COUNT * 3);
    const phases = [];

    for (let i = 0; i < COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.4 + Math.random() * 3;
        positions[i * 3]     = Math.cos(angle) * radius;
        positions[i * 3 + 1] = -1.55 + Math.random() * 0.9;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        phases.push(Math.random() * Math.PI * 2);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 1.6,
        map: texture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    });

    group.add(new THREE.Points(geometry, material));
    scene.add(group);

    const base = new Float32Array(positions);

    return {
        group,
        material,
        update(timeMs) {
            const t = timeMs * 0.001;
            const arr = geometry.attributes.position.array;
            for (let i = 0; i < COUNT; i++) {
                const i3 = i * 3;
                arr[i3]     = base[i3]     + Math.sin(t * 0.12 + phases[i]) * 0.5;
                arr[i3 + 2] = base[i3 + 2] + Math.cos(t * 0.10 + phases[i]) * 0.4;
            }
            geometry.attributes.position.needsUpdate = true;
        },
    };
}

// -------------------------------------------------------
//  LIQUID SPLASH  (Scene 4)
// -------------------------------------------------------
export function createSplashParticles(scene) {
    const group = new THREE.Group();
    group.visible = false;

    const COUNT = 450;
    const positions = new Float32Array(COUNT * 3);
    const velocities = [];

    for (let i = 0; i < COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const t = Math.random();                        // trajectory parameter
        const radius = 0.3 + t * 2.2;                   // expand outward
        const height = Math.sin(t * Math.PI) * 1.6 * (1 - t * 0.35); // parabolic arc

        positions[i * 3]     = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height - 0.4 + (Math.random() - 0.5) * 0.35;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        velocities.push({
            angle,
            speed: 0.08 + Math.random() * 0.25,
            ySpeed: (Math.random() - 0.3) * 0.06,
        });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.035,
        color: 0xe91e63,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    });

    group.add(new THREE.Points(geometry, material));
    scene.add(group);

    const base = new Float32Array(positions);

    return {
        group,
        material,
        update(timeMs) {
            const t = timeMs * 0.001;
            const arr = geometry.attributes.position.array;
            for (let i = 0; i < COUNT; i++) {
                const i3 = i * 3;
                const v = velocities[i];
                arr[i3]     = base[i3]     + Math.sin(t * v.speed + v.angle) * 0.18;
                arr[i3 + 1] = base[i3 + 1] + Math.sin(t * 0.4 + i * 0.1) * 0.08;
                arr[i3 + 2] = base[i3 + 2] + Math.cos(t * v.speed + v.angle) * 0.18;
            }
            geometry.attributes.position.needsUpdate = true;
        },
    };
}
