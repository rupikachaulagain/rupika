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

        // Harsh snap transition
        gsap.fromTo('.editorial-card', 
            { x: -20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, ease: "power4.out", stagger: 0.05 }
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

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Magnetic interactions
document.querySelectorAll('.interactive').forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(ring, { width: 60, height: 60, background: 'rgba(255, 140, 105, 0.2)', scale: 1.2, duration: 0.2, ease: "power2.out" });
        gsap.to(dot, { scale: 0, duration: 0.2 });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(ring, { width: 40, height: 40, background: 'transparent', scale: 1, duration: 0.2, ease: "power2.out" });
        gsap.to(dot, { scale: 1, duration: 0.2 });
    });
});

// ==========================================
// 3. 3D FIREWATCH MOUNTAIN ENGINE (Three.js)
// ==========================================
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1a1025, 0.012);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Procedural Stylized Terrain
const geometry = new THREE.PlaneGeometry(300, 300, 80, 80);
const positionAttribute = geometry.attributes.position;
const colors = [];
const colorObj = new THREE.Color();

const colorSnow = new THREE.Color(0xffffff); 
const colorRock = new THREE.Color(0xff8c69); 
const colorValley = new THREE.Color(0x2a1b38); 

for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    
    const dist = Math.sqrt(x*x + y*y);
    const noise = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 15 
                + Math.sin(x * 0.02) * 25
                + Math.cos(y * 0.03) * 10;
    
    const valleyEffect = Math.max(0, 30 - Math.abs(x)) * 0.5;
    const z = noise - valleyEffect;
    
    positionAttribute.setZ(i, z);

    let normalizedHeight = (z + 20) / 60; 
    normalizedHeight = Math.max(0, Math.min(1, normalizedHeight));

    if (normalizedHeight > 0.7) {
        colorObj.lerpColors(colorRock, colorSnow, (normalizedHeight - 0.7) / 0.3);
    } else {
        colorObj.lerpColors(colorValley, colorRock, normalizedHeight / 0.7);
    }
    
    colors.push(colorObj.r, colorObj.g, colorObj.b);
}

geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
geometry.computeVertexNormals();

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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffeebb, 1.5); 
dirLight.position.set(50, 100, -50);
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0xd45d79, 1.0); 
rimLight.position.set(-50, 20, 50);
scene.add(rimLight);

camera.position.set(0, 5, 20);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let time = 0;
function render() {
    time += 0.005; 
    
    // Snappy cursor
    dotPos.x += (mouse.x - dotPos.x) * 0.3;
    dotPos.y += (mouse.y - dotPos.y) * 0.3;
    ringPos.x += (mouse.x - ringPos.x) * 0.15;
    ringPos.y += (mouse.y - ringPos.y) * 0.15;
    
    dot.style.transform = `translate(calc(${dotPos.x}px - 50%), calc(${dotPos.y}px - 50%))`;
    ring.style.transform = `translate(calc(${ringPos.x}px - 50%), calc(${ringPos.y}px - 50%))`;

    // Parallax camera movement
    const targetCamX = (mouse.x - window.innerWidth / 2) * 0.03;
    const targetCamY = (window.innerHeight / 2 - mouse.y) * 0.03 + 5; 
    
    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
    
    const positions = terrain.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i) + time * 50; 
        
        const noise = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 15 
                    + Math.sin(x * 0.02) * 25
                    + Math.cos(y * 0.03) * 10;
        
        const valleyEffect = Math.max(0, 30 - Math.abs(x)) * 0.5;
        positions.setZ(i, noise - valleyEffect);
    }
    positions.needsUpdate = true;
    terrain.geometry.computeVertexNormals();

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();

// ==========================================
// 4. GSAP SCROLL & ADVENTURE FEEL
// ==========================================

gsap.to(terrain.position, {
    z: 50, 
    ease: "none",
    scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

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

gsap.from(".hud", { y: -50, opacity: 0, duration: 1.5, delay: 0.5, ease: "power4.out" });

// Asset Parallax
gsap.to(".summit-asset", {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
        trigger: ".summit-asset-container",
        start: "top bottom",
        end: "bottom top",
        scrub: true
    }
});

gsap.from(".summit-massive-text", {
    x: -200,
    opacity: 0,
    scrollTrigger: {
        trigger: ".summit-asset-container",
        start: "top center",
        end: "center center",
        scrub: 1
    }
});

gsap.utils.toArray('.timeline-node').forEach((node, i) => {
    gsap.from(node, {
        scrollTrigger: {
            trigger: node,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        x: -50,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
    });
});
