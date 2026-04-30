gsap.registerPlugin(ScrollTrigger);

// Custom Cursor Trail
const cursorDot = document.querySelector('.cursor-dot');
const cursorFollower = document.querySelector('.cursor-follower');

let mouseX = 0;
let mouseY = 0;
let dotX = 0;
let dotY = 0;
let followerX = 0;
let followerY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth Cursor Animation loop
function animateCursor() {
    // Dot moves fast
    dotX += (mouseX - dotX) * 0.4;
    dotY += (mouseY - dotY) * 0.4;
    
    // Follower moves slower (lerped)
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;
    cursorFollower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Hero Animations on Load
const tlHero = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.5 }});

tlHero.from(".title", { y: 100, opacity: 0, skewY: 7, stagger: 0.2 })
      .from(".tagline", { opacity: 0, y: 20 }, "-=1")
      .from(".subtitle", { opacity: 0, y: 30 }, "-=1.2")
      .from(".scroll-prompt", { opacity: 0, y: -20 }, "-=1");

// Scroll-triggered Reveal Animations
const reveals = gsap.utils.toArray('.reveal-up, .reveal-left, .reveal-right, .milestone');

reveals.forEach((el) => {
    let xOffset = 0;
    let yOffset = 50;

    if (el.classList.contains('reveal-left')) xOffset = -50;
    if (el.classList.contains('reveal-right')) xOffset = 50;

    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        x: xOffset,
        y: yOffset,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
    });
});

// Draw the SVG Path (The Trek)
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

// Parallax effects for that "buttery" feel
gsap.utils.toArray(".panel").forEach((panel, i) => {
    if (i !== 0) { // Skip hero
        gsap.from(panel, {
            scrollTrigger: {
                trigger: panel,
                start: "top bottom",
                end: "top top",
                scrub: true
            },
            yPercent: 20,
            opacity: 0.5,
            ease: "none"
        });
    }
});

// Interactive hover states for cursor
const interactiveElements = document.querySelectorAll('a, button, .milestone, .summit-card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(cursorFollower, { scale: 1.5, backgroundColor: "rgba(44, 74, 59, 0.1)", duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(cursorFollower, { scale: 1, backgroundColor: "transparent", duration: 0.3 });
    });
});
