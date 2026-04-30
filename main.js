gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. LANGUAGE SWITCHER
// ==========================================
const langBtns = document.querySelectorAll('.lang-btn');
const body = document.body;

langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        body.className = `lang-${lang}`;
        
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Harsh snap transition
        gsap.fromTo('.glass-panel', 
            { filter: "brightness(1.5)", opacity: 0.5 },
            { filter: "brightness(1)", opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.05 }
        );
    });
});

// ==========================================
// 2. BRUTAL CURSOR PHYSICS
// ==========================================
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
let dotPos = { x: window.innerWidth/2, y: window.innerHeight/2 };
let ringPos = { x: window.innerWidth/2, y: window.innerHeight/2 };

// For parallax
let normalizedMouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    normalizedMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    normalizedMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

document.querySelectorAll('.interactive').forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(ring, { width: 50, height: 50, background: 'rgba(31, 58, 77, 0.1)', duration: 0.2 });
        gsap.to(dot, { scale: 0, duration: 0.2 });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(ring, { width: 40, height: 40, background: 'transparent', duration: 0.2 });
        gsap.to(dot, { scale: 1, duration: 0.2 });
    });
});

// ==========================================
// 3. THREE.JS ARCHITECTURE: ALPINE BRUTALISM
// ==========================================
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// Set scene background to Blinding Snow
scene.background = new THREE.Color(0xffffff);
scene.fog = new THREE.FogExp2(0xffffff, 0.008);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- The Mountain (Low-Poly Plane) ---
const mountainGeom = new THREE.PlaneGeometry(300, 300, 40, 40);
const positions = mountainGeom.attributes.position;

// Create jagged displacement
for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    // High frequency noise for "jagged" look
    const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 20 
                + Math.sin(x * 0.05) * 30
                + Math.cos(y * 0.07) * 15;
    
    // Create a central towering peak structure
    const distFromCenter = Math.sqrt(x*x + y*y);
    const peakBoost = Math.max(0, 100 - distFromCenter) * 0.8;
    
    positions.setZ(i, noise + peakBoost);
}
mountainGeom.computeVertexNormals();

const mountainMat = new THREE.MeshStandardMaterial({ 
    color: 0x1f3a4d, // Deep Frostbite Blue
    flatShading: true,
    roughness: 0.8,
    metalness: 0.1
});

const mountain = new THREE.Mesh(mountainGeom, mountainMat);
mountain.rotation.x = -Math.PI / 2;
mountain.position.y = -60;
mountain.position.z = -80;
scene.add(mountain);

// --- The Blizzard (Particle System) ---
const particleCount = 2000;
const particleGeom = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);

for(let i=0; i < particleCount * 3; i+=3) {
    particlePos[i] = (Math.random() - 0.5) * 400; // x
    particlePos[i+1] = Math.random() * 200 - 50;  // y
    particlePos[i+2] = (Math.random() - 0.5) * 400; // z
}

particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    transparent: true,
    opacity: 0.8
});

const blizzard = new THREE.Points(particleGeom, particleMat);
scene.add(blizzard);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(50, 100, -50);
scene.add(dirLight);

const iceLight = new THREE.DirectionalLight(0xa4c8e1, 1.0); // Glacial Ice reflection
iceLight.position.set(-50, 20, 50);
scene.add(iceLight);

// --- Physics & Render Loop ---
camera.position.set(0, 10, 50);

// Parallax target variables
let targetCamX = 0;
let targetCamY = 10;
let targetMountainRotX = -Math.PI / 2;
let targetMountainRotY = 0;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function render() {
    // Cursor Physics
    dotPos.x += (mouse.x - dotPos.x) * 0.3;
    dotPos.y += (mouse.y - dotPos.y) * 0.3;
    ringPos.x += (mouse.x - ringPos.x) * 0.15;
    ringPos.y += (mouse.y - ringPos.y) * 0.15;
    
    dot.style.transform = `translate(calc(${dotPos.x}px - 50%), calc(${dotPos.y}px - 50%))`;
    ring.style.transform = `translate(calc(${ringPos.x}px - 50%), calc(${ringPos.y}px - 50%))`;

    // Blizzard Physics
    const pPositions = blizzard.geometry.attributes.position.array;
    for(let i=1; i < particleCount * 3; i+=3) {
        pPositions[i] -= 0.5; // fall speed
        pPositions[i-1] += Math.sin(pPositions[i]*0.01) * 0.2; // wind sway
        if(pPositions[i] < -50) {
            pPositions[i] = 150; // reset to top
        }
    }
    blizzard.geometry.attributes.position.needsUpdate = true;

    // Mouse Parallax Logic
    targetMountainRotX = (-Math.PI / 2) + (normalizedMouse.y * 0.05);
    targetMountainRotY = (normalizedMouse.x * 0.05);
    
    targetCamX = normalizedMouse.x * 5;

    // Lerp Mountain Rotation
    mountain.rotation.x += (targetMountainRotX - mountain.rotation.x) * 0.05;
    mountain.rotation.z += (targetMountainRotY - mountain.rotation.z) * 0.05;
    
    // Lerp Camera X (Y is handled by GSAP)
    camera.position.x += (targetCamX - camera.position.x) * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();

// ==========================================
// 4. GSAP SCROLL ASCENT (The Mad Scientist Physics)
// ==========================================

// As user scrolls, camera ascends the mountain visually
gsap.to(camera.position, {
    y: 80, // Ascend
    z: -10, // Move into the scene
    ease: "none",
    scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// Tilt camera down slightly as we climb higher
gsap.to(camera.rotation, {
    x: -0.3,
    ease: "none",
    scrollTrigger: {
        trigger: "#scroll-container",
        start: "center center",
        end: "bottom bottom",
        scrub: 1
    }
});

// Intro Animation
gsap.from(".hud", { y: -50, opacity: 0, duration: 1.5, delay: 0.5, ease: "power4.out" });

// 3D Glass Panel Hover
document.querySelectorAll('.glass-panel').forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        gsap.to(panel, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1000,
            ease: "power2.out",
            duration: 0.4
        });
    });
    
    panel.addEventListener('mouseleave', () => {
        gsap.to(panel, {
            rotationX: 0,
            rotationY: 0,
            ease: "power2.out",
            duration: 0.8
        });
    });
});

// Stagger reveals for timeline nodes
gsap.utils.toArray('.timeline-node').forEach((node) => {
    gsap.from(node, {
        scrollTrigger: {
            trigger: node,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 80,
        opacity: 0,
        duration: 1.0,
        ease: "power3.out"
    });
});
