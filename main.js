gsap.registerPlugin(ScrollTrigger);

// --- THREE.JS SCENE SETUP ---
const canvas = document.querySelector('#canvas-3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// Minimalist Low-Poly Mountain
const geometry = new THREE.ConeGeometry(2, 4, 4); // Low-poly pyramid/mountain
const material = new THREE.MeshStandardMaterial({ 
    color: 0x2c4a3b, // Alpine Green
    flatShading: true,
    wireframe: false,
    transparent: true,
    opacity: 0.8
});
const mountain = new THREE.Mesh(geometry, material);
mountain.rotation.x = 0.2;
scene.add(mountain);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Atmospheric Fog
scene.fog = new THREE.FogExp2(0xf4f4f0, 0.05);

// Handle Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// --- CURSOR LOGIC (Lerp + Magnetic) ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorFollower = document.querySelector('.cursor-follower');

let mouse = { x: 0, y: 0 };
let dotPos = { x: 0, y: 0 };
let followerPos = { x: 0, y: 0 };
let targetScale = 1;

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Magnetic Effect
const magneticElements = document.querySelectorAll('.magnetic, .milestone, .summit-card, .arsenal-item');
magneticElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        targetScale = 1.8;
        cursorFollower.style.backgroundColor = 'rgba(44, 74, 59, 0.1)';
        cursorFollower.style.borderColor = 'transparent';
    });
    el.addEventListener('mouseleave', () => {
        targetScale = 1;
        cursorFollower.style.backgroundColor = 'transparent';
        cursorFollower.style.borderColor = 'var(--accent-green)';
    });
});

function animate() {
    // Three.js Render
    mountain.rotation.y += 0.005;
    renderer.render(scene, camera);

    // Cursor Lerp
    dotPos.x += (mouse.x - dotPos.x) * 0.3;
    dotPos.y += (mouse.y - dotPos.y) * 0.3;
    
    followerPos.x += (mouse.x - followerPos.x) * 0.15;
    followerPos.y += (mouse.y - followerPos.y) * 0.15;
    
    cursorDot.style.transform = `translate(${dotPos.x}px, ${dotPos.y}px)`;
    cursorFollower.style.transform = `translate(${followerPos.x - 20}px, ${followerPos.y - 20}px) scale(${targetScale})`;
    
    requestAnimationFrame(animate);
}
animate();

// --- GSAP SCROLL MAGIC ---
// Hero Entry
const tlHero = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.5 }});
tlHero.from(".title", { y: 150, opacity: 0, skewY: 10, stagger: 0.2 })
      .from(".hero-bg", { scale: 1.5, opacity: 0 }, 0)
      .from(".tagline", { opacity: 0, y: 20 }, "-=1")
      .from(".subtitle", { opacity: 0, y: 30 }, "-=1.2")
      .from(".scroll-prompt", { opacity: 0, y: -20 }, "-=1");

// Three.js Ascent Interaction
gsap.to(camera.position, {
    z: 2,
    y: 2,
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

gsap.to(mountain.rotation, {
    x: 1.5,
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// Milestone Reveals
const milestones = gsap.utils.toArray('.milestone');
milestones.forEach((m) => {
    gsap.from(m, {
        scrollTrigger: {
            trigger: m,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out"
    });
});

// SVG Trek Line Drawing
const path = document.querySelector('#route');
const pathLength = path.getTotalLength();
gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

gsap.to(path, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
        trigger: ".pathway",
        start: "top center",
        end: "bottom center",
        scrub: 1 
    }
});

// Parallax Section Backgrounds
gsap.to(".hero-bg", {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        scrub: true
    }
});

gsap.to(".summit-bg", {
    yPercent: -20,
    ease: "none",
    scrollTrigger: {
        trigger: ".summit",
        scrub: true
    }
});

// Final Summit Reveal
gsap.from(".summit-card", {
    scrollTrigger: {
        trigger: ".summit",
        start: "top 60%"
    },
    y: 50,
    opacity: 0,
    stagger: 0.3,
    duration: 1,
    ease: "power2.out"
});
