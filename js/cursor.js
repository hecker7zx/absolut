// ============================================================
//  cursor.js — Cinematic Custom Cursor & Magnetic Interactions
// ============================================================

const { gsap } = window;

/**
 * Creates a premium custom cursor with smooth GSAP interpolation,
 * hover reactions, click feedback, and velocity-based skew.
 * Returns null on touch devices.
 */
export function initCursor() {
    if (matchMedia('(hover: none)').matches) return null;

    document.documentElement.classList.add('has-cursor');

    // --- DOM ---
    const el = document.createElement('div');
    el.className = 'cursor';

    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    el.appendChild(ring);

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    el.appendChild(dot);

    document.body.appendChild(el);

    // --- State ---
    const pos    = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { x: pos.x, y: pos.y };
    let hidden = true; // hide until first move

    // --- Events ---
    document.addEventListener('mousemove', (e) => {
        target.x = e.clientX;
        target.y = e.clientY;
        hidden = false;
    });

    document.addEventListener('mouseleave', () => { hidden = true; });
    document.addEventListener('mouseenter', () => { hidden = false; });

    // Hover states
    const addHoverListeners = () => {
        document.querySelectorAll('a, button, .magnetic, [data-cursor]').forEach(node => {
            node.addEventListener('mouseenter', () => {
                gsap.to(ring, {
                    width: 64, height: 64,
                    borderColor: 'rgba(233,30,99,0.55)',
                    duration: 0.4, ease: 'power3.out',
                });
                gsap.to(dot, { scale: 3, opacity: 0.35, duration: 0.35 });
            });
            node.addEventListener('mouseleave', () => {
                gsap.to(ring, {
                    width: 40, height: 40,
                    borderColor: 'rgba(255,255,255,0.35)',
                    duration: 0.4, ease: 'power3.out',
                });
                gsap.to(dot, { scale: 1, opacity: 1, duration: 0.35 });
            });
        });
    };
    addHoverListeners();

    // Click feedback
    document.addEventListener('mousedown', () => {
        gsap.to(ring, { scale: 0.78, duration: 0.12, ease: 'power2.in' });
    });
    document.addEventListener('mouseup', () => {
        gsap.to(ring, { scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.35)' });
    });

    // --- Public ---
    return {
        /** Call every frame from the render loop. */
        update() {
            pos.x += (target.x - pos.x) * 0.12;
            pos.y += (target.y - pos.y) * 0.12;

            el.style.left = `${pos.x}px`;
            el.style.top  = `${pos.y}px`;

            // Velocity-based skew for dynamic feel
            const dx = target.x - pos.x;
            const dy = target.y - pos.y;
            ring.style.transform =
                `translate(-50%,-50%) skew(${dx * 0.06}deg,${dy * 0.06}deg)`;

            el.style.opacity = hidden ? '0' : '1';
        },

        /** Mouse position normalised to [-1, 1]. */
        getNormalized() {
            return {
                x:  (pos.x / window.innerWidth)  * 2 - 1,
                y: -(pos.y / window.innerHeight) * 2 + 1,
            };
        },
    };
}

/**
 * Magnetic pull effect for elements with class `.magnetic`.
 * Element drifts toward the cursor on hover, snaps back on leave.
 */
export function setupMagnetics() {
    if (matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top  + r.height / 2);
            gsap.to(el, {
                x: dx * 0.35, y: dy * 0.35,
                duration: 0.4, ease: 'power3.out',
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0, y: 0,
                duration: 0.7, ease: 'elastic.out(1, 0.4)',
            });
        });
    });
}
