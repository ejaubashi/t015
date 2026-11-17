# Recording analysis

The supplied recordings are the visual reference, not evidence of the original site's implementation language or libraries.

| Recording | Observed motion | Recreation |
| --- | --- | --- |
| 100415, 0–4.4s | Centred logo, then layered curved colour bands sweep upward | GSAP opening timeline with six staggered curved layers |
| 100415, 4.6–5.7s | Characters assemble independently into the hero | Split-character translation, rotation, scale and stagger |
| 100415, 6.2–8.7s | Rounded hero leaves; tape roll turns in depth; collage scrolls at varying speeds | CSS 3D layered roll, GSAP scroll transforms, independently moving collage |
| 100415, 8.6–9.8s | Curved text ribbon leads into an orange product scene | SVG textPath controlled by scrolling; interactive orange family selector |
| 100415, 10–11.3s | Manifesto letters resolve as the collection enters | Scrubbed character reveal before the pinned collection |
| 100451, 0.3–3.2s | Create title and product collages travel right-to-left while the viewport stays pinned | Sticky viewport with a smoothed, scroll-driven camera and product rotation |
| 100451, 3.2–5.0s | Create exits upper-left; fix enters lower-right | Camera travels diagonally down-right across the continuous canvas |
| 100451, 5.7–7.8s | Fix exits lower-left; protect enters upper-right | Camera reverses its vertical direction while continuing right |
| 100451, 9.8–10.6s | Paired photo/contact cards, rounded lower edge, character assembly | Two joined cards with a scroll reveal and curved section boundary |
| 100451, 10.9–13.7s | Packs and social circles roll, tumble, and collide over the footer | Matter.js circles with rotation, collision, pointer drag and release |

The route is defined explicitly in `src/motion.js`; its camera is reversible, so scrolling up retraces the same path. This replaces the earlier independent vertical product panels.

Remaining approximations: exact easing and scroll distances cannot be recovered from recordings alone. The original 3D model and full-resolution artwork were not supplied; the roll uses layered CSS geometry and lifestyle images use cropped recording stills. Reduced-motion mode intentionally presents the products in normal document flow.
