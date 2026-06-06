// ============================================================
//  particles.js — Floating Particle System
// ============================================================
import * as THREE from 'three';

/**
 * Creates a floating particle system with white, frost-blue,
 * and raspberry-pink particles distributed around the bottle.
 * Returns an object with the mesh and an update() method.
 */
export function createParticles(scene) {
    const COUNT = 1200;

    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);   // animation phase offsets
    const speeds = new Float32Array(COUNT);   // animation speed multipliers

    const colorWhite = new THREE.Color(1.0, 1.0, 1.0);
    const colorFrost = new THREE.Color(0.7, 0.82, 1.0);
    const colorRaspberry = new THREE.Color(0.91, 0.12, 0.39);

    for (let i = 0; i < COUNT; i++) {
        // Distribute in a spherical shell around the scene center
        const radius = 2.5 + Math.random() * 7;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

        // Color distribution: 55% white, 28% frost, 17% raspberry
        const roll = Math.random();
        const color = roll < 0.55 ? colorWhite
            : roll < 0.83 ? colorFrost
            : colorRaspberry;

        colors[i * 3 + 0] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Varied sizes — mostly tiny dust, some larger motes
        sizes[i] = 1.0 + Math.pow(Math.random(), 1.5) * 3.0;

        // Random phase & speed for organic-looking animation
        phases[i] = Math.random() * Math.PI * 2;
        speeds[i] = 0.15 + Math.random() * 0.7;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.018,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.35,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const mesh = new THREE.Points(geometry, material);
    scene.add(mesh);

    // Store original positions for animation offsets
    const basePositions = new Float32Array(positions);

    return {
        mesh,

        /**
         * Gentle floating motion — called each frame with time in ms.
         */
        update(timeMs) {
            const t = timeMs * 0.001; // convert to seconds
            const posArray = geometry.attributes.position.array;

            for (let i = 0; i < COUNT; i++) {
                const i3 = i * 3;
                const spd = speeds[i];
                const ph = phases[i];

                // Y: gentle sine float
                posArray[i3 + 1] = basePositions[i3 + 1]
                    + Math.sin(t * 0.3 * spd + ph) * 0.35;

                // X: subtle horizontal drift
                posArray[i3 + 0] = basePositions[i3 + 0]
                    + Math.sin(t * 0.2 * spd + ph * 1.3) * 0.18;

                // Z: subtle depth drift
                posArray[i3 + 2] = basePositions[i3 + 2]
                    + Math.cos(t * 0.2 * spd + ph * 0.7) * 0.18;
            }

            geometry.attributes.position.needsUpdate = true;

            // Very slow rotation of the entire system
            mesh.rotation.y = t * 0.012;
        },
    };
}
