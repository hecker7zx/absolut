// ============================================================
//  bottle.js — Procedural Absolut Bottle Geometry & Materials
// ============================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Creates the complete Absolut Raspberri bottle as a Three.js Group.
 * Includes: glass body, liquid, cap, label, condensation droplets.
 */
export function createBottle(scene) {
    const bottleGroup = new THREE.Group();
        // -------------------------------------------------------
        //  Build glass body using LatheGeometry for photorealistic PBR glass
        // -------------------------------------------------------
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            transmission: 1.0,          // full glass
            thickness: 0.003,           // ~3mm glass thickness
            ior: 1.52,
            roughness: 0.08,
            metalness: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.04,
            envMapIntensity: 1.0,
            transparent: true,
        });
        const glassGeometry = new THREE.LatheGeometry(createBottleProfile(), 128);
        const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
        glassMesh.rotation.x = Math.PI; // flip to match label orientation
        bottleGroup.add(glassMesh);

        // -------------------------------------------------------
        //  Liquid (raspberry vodka) – slightly inset geometry
        // -------------------------------------------------------
        const liquidMaterial = new THREE.MeshPhysicalMaterial({
            transmission: 0.6,
            thickness: 0.1,
            ior: 1.33,
            color: new THREE.Color(0xc2185b), // raspberry hue
            roughness: 0.2,
            metalness: 0.0,
            envMapIntensity: 1.0,
            transparent: true,
        });
        const liquidGeometry = new THREE.LatheGeometry(createLiquidProfile(), 128);
        const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquidMesh.rotation.x = Math.PI;
        bottleGroup.add(liquidMesh);

        // -------------------------------------------------------
        //  Add cap and label (existing functions)
        // -------------------------------------------------------
        const cap = createCap();
        bottleGroup.add(cap);
        const label = createLabel();
        bottleGroup.add(label);

        // -------------------------------------------------------
        //  Condensation droplets (instanced mesh)
        // -------------------------------------------------------
        const condensation = createCondensation();
        bottleGroup.add(condensation);
scene.add(bottleGroup);
    return bottleGroup;
}

// -------------------------------------------------------
//  Bottle Profile (LatheGeometry cross-section)
// -------------------------------------------------------

/**
 * Defines the 2D profile of the Absolut bottle for revolution.
 * Height: ~3 units (-1.5 to 1.5), Radius: ~0.48 units.
 */
function createBottleProfile() {
    const pts = [];

    // Bottom — flat base with slight bevel
    pts.push(new THREE.Vector2(0.00, -1.50));
    pts.push(new THREE.Vector2(0.40, -1.50));
    pts.push(new THREE.Vector2(0.43, -1.49));
    pts.push(new THREE.Vector2(0.45, -1.47));
    pts.push(new THREE.Vector2(0.465, -1.43));

    // Lower body transition
    pts.push(new THREE.Vector2(0.475, -1.35));
    pts.push(new THREE.Vector2(0.48, -1.20));

    // Main body — characteristic Absolut straight cylinder
    pts.push(new THREE.Vector2(0.48, -1.00));
    pts.push(new THREE.Vector2(0.48, -0.50));
    pts.push(new THREE.Vector2(0.48, 0.00));
    pts.push(new THREE.Vector2(0.48, 0.40));
    pts.push(new THREE.Vector2(0.48, 0.60));

    // Shoulder — smooth, definite Absolut curve
    pts.push(new THREE.Vector2(0.478, 0.67));
    pts.push(new THREE.Vector2(0.472, 0.74));
    pts.push(new THREE.Vector2(0.458, 0.80));
    pts.push(new THREE.Vector2(0.435, 0.86));
    pts.push(new THREE.Vector2(0.40, 0.92));
    pts.push(new THREE.Vector2(0.36, 0.97));
    pts.push(new THREE.Vector2(0.31, 1.02));
    pts.push(new THREE.Vector2(0.27, 1.06));

    // Upper shoulder → neck
    pts.push(new THREE.Vector2(0.23, 1.10));
    pts.push(new THREE.Vector2(0.20, 1.14));
    pts.push(new THREE.Vector2(0.185, 1.18));

    // Neck — relatively wide for Absolut
    pts.push(new THREE.Vector2(0.175, 1.24));
    pts.push(new THREE.Vector2(0.17, 1.32));
    pts.push(new THREE.Vector2(0.17, 1.38));

    // Lip / rim
    pts.push(new THREE.Vector2(0.175, 1.40));
    pts.push(new THREE.Vector2(0.185, 1.42));
    pts.push(new THREE.Vector2(0.185, 1.45));
    pts.push(new THREE.Vector2(0.17, 1.46));
    pts.push(new THREE.Vector2(0.15, 1.46));

    return pts;
}

/**
 * Slightly inset liquid profile — fills ~67% of the bottle body.
 */
function createLiquidProfile() {
    const inset = 0.028;
    const pts = [];

    pts.push(new THREE.Vector2(0.00, -1.47));
    pts.push(new THREE.Vector2(0.40 - inset, -1.47));
    pts.push(new THREE.Vector2(0.45 - inset, -1.43));
    pts.push(new THREE.Vector2(0.48 - inset, -1.20));
    pts.push(new THREE.Vector2(0.48 - inset, -1.00));
    pts.push(new THREE.Vector2(0.48 - inset, -0.50));
    pts.push(new THREE.Vector2(0.48 - inset, 0.00));
    pts.push(new THREE.Vector2(0.48 - inset, 0.40));
    pts.push(new THREE.Vector2(0.48 - inset, 0.50));
    pts.push(new THREE.Vector2(0.00, 0.50));

    return pts;
}

// -------------------------------------------------------
//  Cap
// -------------------------------------------------------
function createCap() {
    const group = new THREE.Group();

    // Main cap cylinder
    const capGeo = new THREE.CylinderGeometry(0.195, 0.185, 0.20, 32);
    const capMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.92,
        roughness: 0.12,
    });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.y = 1.55;
    group.add(capMesh);

    // Cap top disc
    const topGeo = new THREE.CylinderGeometry(0.18, 0.195, 0.035, 32);
    const topMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.95,
        roughness: 0.08,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 1.67;
    group.add(topMesh);

    // Gold accent ring
    const ringGeo = new THREE.TorusGeometry(0.19, 0.007, 8, 48);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 1.0,
        roughness: 0.18,
        emissive: 0xd4af37,
        emissiveIntensity: 0.05,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 1.445;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    return group;
}

// -------------------------------------------------------
//  Label (Canvas Texture)
// -------------------------------------------------------
function createLabel() {
    const group = new THREE.Group();

    // --- Draw label texture ---
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Transparent background
    ctx.clearRect(0, 0, 600, 800);

    // Semi-transparent label backing
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    roundRect(ctx, 40, 40, 520, 720, 6);
    ctx.fill();

    // Inner border
    ctx.strokeStyle = 'rgba(180, 160, 140, 0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, 55, 55, 490, 690, 4);
    ctx.stroke();

    // Top decorative line
    ctx.strokeStyle = '#c2185b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(120, 120);
    ctx.lineTo(480, 120);
    ctx.stroke();

    // "ABSOLUT" — main brand
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '900 72px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ABSOLUT', 300, 230);

    // Gold divider with diamond
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(140, 295);
    ctx.lineTo(270, 295);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(330, 295);
    ctx.lineTo(460, 295);
    ctx.stroke();

    // Diamond ornament
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(300, 285);
    ctx.lineTo(310, 295);
    ctx.lineTo(300, 305);
    ctx.lineTo(290, 295);
    ctx.closePath();
    ctx.fill();

    // "RASPBERRI" — flavor
    ctx.fillStyle = '#c2185b';
    ctx.font = 'italic 48px Georgia, "Times New Roman", serif';
    ctx.fillText('RASPBERRI', 300, 380);

    // Subtitle
    ctx.fillStyle = '#666666';
    ctx.font = '300 18px Arial, sans-serif';
    ctx.fillText('COUNTRY OF SWEDEN', 300, 460);

    // Raspberry icon (simple circle cluster)
    drawRaspberryIcon(ctx, 300, 540, 25);

    // Bottom decorative line
    ctx.strokeStyle = '#c2185b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 630);
    ctx.lineTo(480, 630);
    ctx.stroke();

    // Volume
    ctx.fillStyle = '#888888';
    ctx.font = '300 15px Arial, sans-serif';
    ctx.fillText('700 ML  ·  40% VOL', 300, 680);

    // --- Create texture ---
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    // --- Map to cylinder section ---
    const arcAngle = Math.PI * 0.58;
    const labelGeo = new THREE.CylinderGeometry(
        0.49, 0.49,    // match bottle radius (slightly outside)
        1.1,            // label height
        64, 1,          // segments
        true,           // open-ended
        -arcAngle / 2,  // start angle (centered on front)
        arcAngle        // sweep angle
    );

    const labelMat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.3,
        metalness: 0.0,
        side: THREE.FrontSide,
        depthWrite: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
    });

    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.y = -0.3;
    group.add(labelMesh);

    return group;
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawRaspberryIcon(ctx, cx, cy, size) {
    // Simple cluster of circles to suggest a raspberry
    ctx.fillStyle = '#c2185b';
    const positions = [
        [0, -0.6], [-0.5, -0.2], [0.5, -0.2],
        [-0.3, 0.3], [0.3, 0.3], [0, 0],
    ];
    positions.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx * size, cy + dy * size, size * 0.28, 0, Math.PI * 2);
        ctx.fill();
    });
    // Leaf
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.ellipse(cx, cy - size * 0.9, size * 0.25, size * 0.12, -0.3, 0, Math.PI * 2);
    ctx.fill();
}

// -------------------------------------------------------
//  Condensation Droplets (InstancedMesh)
// -------------------------------------------------------
function createCondensation() {
    const dropGeo = new THREE.SphereGeometry(1, 6, 6);
    const dropMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.25,
        roughness: 0.0,
        metalness: 0.0,
        ior: 1.33,
        thickness: 0.005,
        transparent: true,
        opacity: 0.55,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
    });

    const count = 220;
    const drops = new THREE.InstancedMesh(dropGeo, dropMat, count);
    const dummy = new THREE.Object3D();
    const bottleRadius = 0.485;

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Concentrate on the cold body section (-1.2 to 0.4)
        const y = -1.2 + Math.random() * 1.6;
        const r = bottleRadius + 0.003;

        dummy.position.set(
            Math.cos(angle) * r,
            y,
            Math.sin(angle) * r
        );

        // Varied droplet sizes — mostly small, some larger
        const baseScale = 0.002 + Math.pow(Math.random(), 2) * 0.007;
        dummy.scale.set(
            baseScale,
            baseScale * (0.4 + Math.random() * 0.6), // flatten slightly
            baseScale
        );

        dummy.rotation.set(
            Math.random() * 0.2,
            0,
            Math.random() * 0.2
        );

        dummy.updateMatrix();
        drops.setMatrixAt(i, dummy.matrix);
    }

    drops.instanceMatrix.needsUpdate = true;
    return drops;
}
