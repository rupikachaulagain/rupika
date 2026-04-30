gsap.registerPlugin(ScrollTrigger);

// Custom Cursor Logic
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX - 10,
        y: e.clientY - 10,
        duration: 0.1
    });
});

// Hero Animation on Load
gsap.from(".title", { y: 100, opacity: 0, duration: 1.5, ease: "power4.out" });
gsap.from(".subtitle", { y: 50, opacity: 0, duration: 1.5, delay: 0.3, ease: "power4.out" });

// The Trek (Experience) Reveal
const milestones = gsap.utils.toArray('.milestone');
milestones.forEach((milestone) => {
    gsap.to(milestone, {
        scrollTrigger: {
            trigger: milestone,
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
    });
});

// Draw the SVG Path as you scroll
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
