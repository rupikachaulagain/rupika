gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. LANGUAGE SWITCHER LOGIC
// ==========================================
const langBtns = document.querySelectorAll('.lang-btn');
const body = document.body;

langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        body.className = `lang-${lang}`;
        
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Play a glitch sound/effect on UI when switching
        gsap.fromTo('.glass-panel', 
            { opacity: 0.5, scale: 0.98, filter: "brightness(2)" },
            { opacity: 1, scale: 1, filter: "brightness(1)", duration: 0.5, ease: "power4.out", stagger: 0.05 }
        );
    });
});

// ==========================================
// 2. INSANE CURSOR PHYSICS
// ==========================================
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
let dotPos = { x: window.innerWidth/2, y: window.innerHeight/2 };
let ringPos = { x: window.innerWidth/2, y: window.innerHeight/2 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Magnetic interactions
document.querySelectorAll('.interactive').forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(ring, { width: 60, height: 60, background: 'rgba(74, 222, 128, 0.1)', duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(ring, { width: 30, height: 30, background: 'transparent', duration: 0.3 });
    });
});

// ==========================================
// 3. 3D CYBER-HIMALAYA ENGINE (Three.js)
// ==========================================
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050806, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Procedural Mountain Terrain (Wireframe + Solid)
const geometry = new THREE.PlaneGeometry(200, 200, 60, 60);

// Displace vertices to create mountains
const positionAttribute = geometry.attributes.position;
const vertex = new THREE.Vector3();

for (let i = 0; i < positionAttribute.count; i++) {
    vertex.fromBufferAttribute(positionAttribute, i);
    // Complex noise function using Math sin/cos to fake terrain
    const dist = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y);
    const z = Math.sin(vertex.x * 0.1) * Math.cos(vertex.y * 0.1) * 10 
            + Math.sin(vertex.x * 0.02) * 20
            - dist * 0.2; // Push edges down
            
    // Central peak
    const peak = Math.max(0, 30 - dist * 0.5) * 2;
    
    positionAttribute.setZ(i, z + peak);
}
geometry.computeVertexNormals();

const materialSolid = new THREE.MeshStandardMaterial({ 
    color: 0x0a0f0c,
    roughness: 0.8,
    metalness: 0.2,
    flatShading: true
});

const materialWire = new THREE.MeshBasicMaterial({ 
    color: 0x4ade80,
    wireframe: true,
    transparent: true,
    opacity: 0.1
});

const terrainSolid = new THREE.Mesh(geometry, materialSolid);
const terrainWire = new THREE.Mesh(geometry, materialWire);

// Group terrain to rotate together
const terrain = new THREE.Group();
terrain.add(terrainSolid);
terrain.add(terrainWire);

terrain.rotation.x = -Math.PI / 2;
terrain.position.y = -20;
terrain.position.z = -50;
scene.add(terrain);

// Snow / Speed Particles
const particleCount = 2000;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);

for(let i=0; i < particleCount * 3; i++) {
    particlePos[i] = (Math.random() - 0.5) * 200;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({
    color: 0x4ade80,
    size: 0.2,
    transparent: true,
    opacity: 0.6
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0x4ade80, 2);
dirLight.position.set(0, 50, -20);
scene.add(dirLight);

// Setup Camera Start
camera.position.set(0, 5, 20);

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render Loop
let time = 0;
function render() {
    time += 0.01;
    
    // Physics cursor
    dotPos.x += (mouse.x - dotPos.x) * 0.2;
    dotPos.y += (mouse.y - dotPos.y) * 0.2;
    ringPos.x += (mouse.x - ringPos.x) * 0.1;
    ringPos.y += (mouse.y - ringPos.y) * 0.1;
    
    dot.style.transform = `translate(calc(${dotPos.x}px - 50%), calc(${dotPos.y}px - 50%))`;
    ring.style.transform = `translate(calc(${ringPos.x}px - 50%), calc(${ringPos.y}px - 50%))`;

    // Dynamic camera parallax based on mouse
    const targetCamX = (mouse.x - window.innerWidth / 2) * 0.05;
    const targetCamY = (mouse.y - window.innerHeight / 2) * 0.05 + 5; // Base height
    
    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    // Don't mess with Y too much, ScrollTrigger handles it mostly, but add slight wobble
    
    // Terrain breathing
    terrain.rotation.z = Math.sin(time * 0.5) * 0.05;
    
    // Particles flowing towards camera (Speed effect)
    const positions = particles.geometry.attributes.position.array;
    for(let i=2; i < particleCount * 3; i+=3) {
        positions[i] += 0.5;
        if(positions[i] > 50) {
            positions[i] = -150;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();

// ==========================================
// 4. GSAP SCROLL & GAME-LIKE FEEL
// ==========================================

// Animate 3D scene on scroll
gsap.to(camera.position, {
    z: -30, // Fly through the mountains
    y: 15,  // Ascend
    ease: "none",
    scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// Rotate mountain aggressively as we climb
gsap.to(terrain.rotation, {
    x: -Math.PI / 2.2,
    ease: "none",
    scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// HUD Entry
gsap.from(".hud", { y: -50, opacity: 0, duration: 1, delay: 0.5, ease: "power4.out" });

// Glass panels 3D tilt effect on hover
document.querySelectorAll('.glass-panel').forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;

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
            duration: 0.6
        });
    });
});

// Stagger reveals for nodes
gsap.utils.toArray('.timeline-node').forEach(node => {
    gsap.from(node, {
        scrollTrigger: {
            trigger: node,
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)"
    });
});
