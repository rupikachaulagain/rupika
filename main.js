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

        // Soft transition effect
        gsap.fromTo('.glass-panel', 
            { opacity: 0.8, y: 10 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }
        );
    });
});

// ==========================================
// 2. ADVENTURE CURSOR PHYSICS
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
        gsap.to(ring, { width: 60, height: 60, background: 'rgba(255, 140, 105, 0.1)', borderColor: 'rgba(255, 140, 105, 0.8)', duration: 0.4, ease: "power2.out" });
        gsap.to(dot, { scale: 1.5, duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(ring, { width: 40, height: 40, background: 'transparent', borderColor: 'rgba(255, 140, 105, 0.4)', duration: 0.4, ease: "power2.out" });
        gsap.to(dot, { scale: 1, duration: 0.3 });
    });
});

// ==========================================
// 3. 3D FIREWATCH MOUNTAIN ENGINE (Three.js)
// ==========================================
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
// Deep sunset purple fog
scene.fog = new THREE.FogExp2(0x1a1025, 0.012);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Procedural Stylized Terrain
const geometry = new THREE.PlaneGeometry(300, 300, 80, 80);

// Displace vertices and apply colors based on height
const positionAttribute = geometry.attributes.position;
const colors = [];
const colorObj = new THREE.Color();

// Firewatch Color Palette for terrain
const colorSnow = new THREE.Color(0xffffff); // White
const colorRock = new THREE.Color(0xff8c69); // Sunset Orange
const colorValley = new THREE.Color(0x2a1b38); // Deep Purple

for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    
    // Perlin-ish noise combination for rolling mountains
    const dist = Math.sqrt(x*x + y*y);
    const noise = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 15 
                + Math.sin(x * 0.02) * 25
                + Math.cos(y * 0.03) * 10;
    
    // Create a central "valley" path
    const valleyEffect = Math.max(0, 30 - Math.abs(x)) * 0.5;
    const z = noise - valleyEffect;
    
    positionAttribute.setZ(i, z);

    // Color mixing based on height (z)
    // Max height approx 40, min approx -20
    let normalizedHeight = (z + 20) / 60; 
    normalizedHeight = Math.max(0, Math.min(1, normalizedHeight));

    if (normalizedHeight > 0.7) {
        // Snow capped
        colorObj.lerpColors(colorRock, colorSnow, (normalizedHeight - 0.7) / 0.3);
    } else {
        // Valley to Rock
        colorObj.lerpColors(colorValley, colorRock, normalizedHeight / 0.7);
    }
    
    colors.push(colorObj.r, colorObj.g, colorObj.b);
}

geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
geometry.computeVertexNormals();

// Stylized Material
const material = new THREE.MeshLambertMaterial({ 
    vertexColors: true,
    flatShading: true,
    roughness: 1.0
});

const terrain = new THREE.Mesh(geometry, material);
terrain.rotation.x = -Math.PI / 2;
terrain.position.y = -25;
terrain.position.z = -80;
scene.add(terrain);

// Golden Hour Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffeebb, 1.5); // Warm sun
dirLight.position.set(50, 100, -50);
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0xd45d79, 1.0); // Pink rim light
rimLight.position.set(-50, 20, 50);
scene.add(rimLight);

// Setup Camera Start
camera.position.set(0, 5, 20);

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render Loop & Animation
let time = 0;
function render() {
    time += 0.005; // Slower, elegant flow
    
    // Physics cursor
    dotPos.x += (mouse.x - dotPos.x) * 0.15;
    dotPos.y += (mouse.y - dotPos.y) * 0.15;
    ringPos.x += (mouse.x - ringPos.x) * 0.08;
    ringPos.y += (mouse.y - ringPos.y) * 0.08;
    
    dot.style.transform = `translate(calc(${dotPos.x}px - 50%), calc(${dotPos.y}px - 50%))`;
    ring.style.transform = `translate(calc(${ringPos.x}px - 50%), calc(${ringPos.y}px - 50%))`;

    // Parallax camera movement
    const targetCamX = (mouse.x - window.innerWidth / 2) * 0.03;
    const targetCamY = (window.innerHeight / 2 - mouse.y) * 0.03 + 5; // Base height 5
    
    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
    
    // Beautiful flowing mountain animation (moving vertices)
    const positions = terrain.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i) + time * 50; // Scroll effect over time
        
        const noise = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 15 
                    + Math.sin(x * 0.02) * 25
                    + Math.cos(y * 0.03) * 10;
        
        const valleyEffect = Math.max(0, 30 - Math.abs(x)) * 0.5;
        positions.setZ(i, noise - valleyEffect);
    }
    positions.needsUpdate = true;
    terrain.geometry.computeVertexNormals(); // Recompute for lighting

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();

// ==========================================
// 4. GSAP SCROLL & ADVENTURE FEEL
// ==========================================

// Fly through the terrain on scroll
gsap.to(terrain.position, {
    z: 50, // Move terrain towards camera
    ease: "none",
    scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// Tilt camera down as we reach the "summit"
gsap.to(camera.rotation, {
    x: -0.2,
    ease: "none",
    scrollTrigger: {
        trigger: "#scroll-container",
        start: "center top",
        end: "bottom bottom",
        scrub: 1
    }
});

// HUD Entry
gsap.from(".hud", { y: -50, opacity: 0, duration: 1.5, delay: 0.5, ease: "power4.out" });

// Glass panels 3D tilt effect on hover
document.querySelectorAll('.glass-panel').forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5; // Soft 5 deg tilt
        const rotateY = ((x - centerX) / centerX) * 5;

        gsap.to(panel, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1000,
            ease: "power2.out",
            duration: 0.5
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
gsap.utils.toArray('.timeline-node').forEach((node, i) => {
    gsap.from(node, {
        scrollTrigger: {
            trigger: node,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
    });
});
