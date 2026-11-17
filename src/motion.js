import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Matter from "matter-js";

gsap.registerPlugin(ScrollTrigger);
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const noise = (i) => Math.sin(i * 12.9898 + 78.233) * 0.5 + 0.5;

function splitLetters(element) {
  element.setAttribute("aria-label", element.innerText.replace(/\n/g, " "));
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    for (const char of node.textContent) {
      const span = document.createElement("span");
      span.className = char === " " ? "letter letter-space" : "letter";
      span.setAttribute("aria-hidden", "true");
      span.textContent = char;
      fragment.append(span);
    }
    node.replaceWith(fragment);
  });
  return [...element.querySelectorAll(".letter")];
}

function opening(reduced) {
  const cover = document.querySelector(".opening");
  const skip = document.querySelector(".skip-intro");
  const letters = [...document.querySelectorAll(".hero-word .letter")];
  let timeline;
  const finish = () => {
    timeline?.kill();
    document.body.classList.remove("intro-playing");
    document.body.classList.add("intro-finished");
    gsap.set(letters, { clearProps: "transform,opacity" });
    gsap.set(["header", ".hero-intro", ".scroll-cue"], {
      clearProps: "opacity,transform",
    });
    cover.remove();
    skip.remove();
    ScrollTrigger.refresh();
    document.dispatchEvent(new Event("intro-complete"));
  };
  if (reduced || location.hash || scrollY > 20) {
    finish();
    return;
  }
  document.body.classList.add("intro-playing");
  gsap.set(letters, {
    opacity: 0,
    yPercent: (i) => 80 + noise(i) * 90,
    x: (i) => (noise(i + 4) - 0.5) * 100,
    rotation: (i) => (noise(i + 11) - 0.5) * 70,
    scale: 0.7,
  });
  gsap.set(["header", ".hero-intro", ".scroll-cue"], { opacity: 0 });
  timeline = gsap.timeline({ onComplete: finish });
  timeline
    .fromTo(
      ".opening-cover>.brand",
      { rotationY: -95, scale: 0.9 },
      { rotationY: 0, scale: 1, duration: 0.75, ease: "back.out(1.3)" },
      0,
    )
    .to(
      ".opening-cover",
      { yPercent: -118, duration: 1.3, ease: "power3.inOut" },
      0.9,
    )
    .to(
      ".opening-band",
      { yPercent: -118, duration: 1.3, stagger: 0.09, ease: "power3.inOut" },
      1,
    )
    .to(["header", ".hero-intro"], { opacity: 1, duration: 0.4 }, 2.05)
    .to(
      letters,
      {
        opacity: 1,
        yPercent: 0,
        x: 0,
        rotation: 0,
        scale: 1,
        duration: 0.85,
        stagger: { each: 0.045, from: "random" },
        ease: "back.out(1.1)",
      },
      2.08,
    )
    .to(".scroll-cue", { opacity: 1, duration: 0.4 }, 2.8);
  skip.addEventListener("click", finish, { once: true });
}

function journey(reduced) {
  const section = document.querySelector(".collection");
  if (reduced) {
    section.dataset.motion = "reduced";
    return;
  }
  const viewport = section.querySelector(".journey-viewport");
  const world = section.querySelector(".journey-world");
  const label = section.querySelector(".chapter-label");
  // Coordinates are camera positions, in viewport-width units and viewport heights.
  // The connectors deliberately take the camera down-right, then up-right.
  const route = [
    { p: 0, x: 0, y: 0 },
    { p: 0.28, x: 1.85, y: 0 },
    { p: 0.42, x: 2.85, y: 0.8 },
    { p: 0.59, x: 4.02, y: 0.8 },
    { p: 0.74, x: 5.1, y: 0 },
    { p: 1, x: 7.2, y: 0 },
  ];
  let top = 0,
    travel = 1,
    unit = innerWidth,
    height = innerHeight,
    target = 0,
    current = 0,
    frame;
  const packs = [...world.querySelectorAll(".scene-pack")];
  const baseRotations = packs.map(
    (_, i) => [-14, 17, -16, 18, -15, 12][i] || 0,
  );
  const arrowPaths = [...world.querySelectorAll(".journey-arrow path")];
  arrowPaths.forEach((path) => {
    path.style.strokeDasharray = path.getTotalLength();
    path.style.strokeDashoffset = path.getTotalLength();
  });
  function measure() {
    top = section.getBoundingClientRect().top + scrollY;
    height = viewport.offsetHeight;
    travel = section.offsetHeight - height;
    unit = innerWidth * (innerWidth <= 800 ? 1.5 : 1);
    target = clamp((scrollY - top) / travel);
    current = target;
    render(true);
  }
  function render(instant = false) {
    current = instant ? target : current + (target - current) * 0.13;
    if (Math.abs(target - current) < 0.00005) current = target;
    let b = route.findIndex((point) => point.p >= current);
    b = Math.max(1, b);
    const a = route[b - 1],
      z = route[b],
      p = clamp((current - a.p) / (z.p - a.p));
    const x = (a.x + (z.x - a.x) * p) * unit,
      y = (a.y + (z.y - a.y) * p) * height;
    world.style.transform = `translate3d(${-x}px,${-y}px,0)`;
    section.dataset.progress = current.toFixed(4);
    section.dataset.cameraX = x.toFixed(2);
    section.dataset.cameraY = y.toFixed(2);
    label.textContent =
      current < 0.36
        ? "01 — TO CREATE"
        : current < 0.68
          ? "02 — TO FIX"
          : "03 — TO PROTECT";
    packs.forEach((pack, i) => {
      const turn = baseRotations[i] + Math.sin(current * 15 + i) * 12;
      pack.style.transform = `translate3d(0,${Math.sin(current * 17 + i * 1.8) * height * 0.025}px,0) rotate(${turn}deg)`;
    });
    arrowPaths.forEach((path, i) => {
      const start = i < 2 ? 0.24 : 0.6;
      path.style.strokeDashoffset =
        path.getTotalLength() * (1 - clamp((current - start) / 0.12));
    });
    frame = undefined;
    if (current !== target) frame = requestAnimationFrame(() => render());
  }
  function onScroll() {
    target = clamp((scrollY - top) / travel);
    if (!frame) frame = requestAnimationFrame(() => render());
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", measure);
  // Tab navigation must bring a product in the wide scene into the camera.
  // Native scrollIntoView cannot translate a pinned, clipped world correctly.
  section.addEventListener("focusin", (event) => {
    if (!event.target.matches("button:focus-visible,a:focus-visible")) return;
    const rect = event.target.getBoundingClientRect();
    if (rect.right > 0 && rect.left < innerWidth) return;
    const worldX = event.target.getBoundingClientRect().left + xPosition();
    const desired = clamp((worldX - innerWidth * 0.4) / unit, 0, 7.2);
    let j = route.findIndex((point) => point.x >= desired);
    j = Math.max(1, j);
    const a = route[j - 1],
      b = route[j];
    const p = a.p + ((desired - a.x) / (b.x - a.x)) * (b.p - a.p);
    scrollTo({ top: top + p * travel, behavior: "instant" });
    target = p;
    render(true);
  });
  function xPosition() {
    return Number(section.dataset.cameraX) || 0;
  }
  measure();
  ScrollTrigger.addEventListener("refresh", measure);
}

function footerPhysics(reduced) {
  const area = document.querySelector(".footer-playground");
  if (reduced) {
    area.dataset.motion = "reduced";
    return;
  }
  const { Engine, Bodies, Body, Composite } = Matter;
  const engine = Engine.create({ gravity: { x: 0, y: 0.13 } });
  let width = 0,
    height = 0,
    walls = [],
    items = [],
    frame,
    last = 0,
    accumulator = 0,
    visible = false,
    drag,
    dragLast,
    dragStart;
  const elements = [...area.querySelectorAll(".physics-pack,.physics-social")];
  const initial = [
    [0.16, 0.13],
    [0.65, 0.43],
    [0.84, 0.08],
    [0.43, 0.65],
    [0.07, 0.57],
    [0.88, 0.65],
  ];
  function reset() {
    width = area.clientWidth;
    height = area.clientHeight;
    Composite.clear(engine.world, false);
    items = [];
    walls = [
      Bodies.rectangle(width / 2, height + 45, width + 200, 90, {
        isStatic: true,
      }),
      Bodies.rectangle(-50, height / 2, 100, height * 3, { isStatic: true }),
      Bodies.rectangle(width + 50, height / 2, 100, height * 3, {
        isStatic: true,
      }),
      Bodies.rectangle(width / 2, -120, width + 200, 100, { isStatic: true }),
    ];
    Composite.add(engine.world, walls);
    elements.forEach((el, i) => {
      const radius = el.offsetWidth / 2;
      const x = clamp(
        width * (initial[i]?.[0] ?? 0.5),
        radius + 10,
        width - radius - 10,
      );
      const y = clamp(
        height * (initial[i]?.[1] ?? 0.12),
        radius + 5,
        height - radius - 5,
      );
      const body = Bodies.circle(x, y, radius, {
        restitution: 0.95,
        friction: 0.015,
        frictionAir: 0.002,
        density: 0.001,
        isSensor:
          el.classList.contains("custom-pack") &&
          !el.classList.contains("landed"),
      });
      Body.setAngle(body, (noise(i + 9) - 0.5) * 3);
      Body.setVelocity(body, { x: (i % 2 ? -1 : 1) * 1.6, y: -2 - i * 0.2 });
      Body.setAngularVelocity(body, i % 2 ? -0.012 : 0.014);
      Composite.add(engine.world, body);
      el.style.left = "0";
      el.style.top = "0";
      items.push({ el, body, radius });
    });
    paint();
  }
  function paint() {
    items.forEach(({ el, body, radius }) => {
      el.style.transform = `translate3d(${body.position.x - radius}px,${body.position.y - radius}px,0) rotate(${body.angle}rad)`;
    });
  }
  function animate(time) {
    if (!visible || document.hidden) {
      frame = undefined;
      last = 0;
      return;
    }
    accumulator += last ? Math.min(time - last, 50) : 1000 / 60;
    last = time;
    while (accumulator >= 1000 / 60) {
      Engine.update(engine, 1000 / 60);
      accumulator -= 1000 / 60;
    }
    paint();
    frame = requestAnimationFrame(animate);
  }
  function resume() {
    if (visible && !frame && !document.hidden)
      frame = requestAnimationFrame(animate);
  }
  elements.forEach((el) => {
    el.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const item = items.find((item) => item.el === el);
      drag = item;
      dragStart = { x: event.clientX, y: event.clientY };
      dragLast = { ...dragStart };
      el.dataset.dragged = "false";
      Body.setStatic(item.body, true);
      el.setPointerCapture(event.pointerId);
    });
    el.addEventListener("pointermove", (event) => {
      if (!drag || drag.el !== el) return;
      const dx = event.clientX - dragLast.x,
        dy = event.clientY - dragLast.y;
      if (
        Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) > 7
      )
        el.dataset.dragged = "true";
      Body.setPosition(drag.body, {
        x: clamp(drag.body.position.x + dx, drag.radius, width - drag.radius),
        y: clamp(drag.body.position.y + dy, drag.radius, height - drag.radius),
      });
      drag.velocity = { x: clamp(dx, -14, 14), y: clamp(dy, -14, 14) };
      dragLast = { x: event.clientX, y: event.clientY };
      paint();
    });
    const release = () => {
      if (!drag || drag.el !== el) return;
      Body.setStatic(drag.body, false);
      Body.setVelocity(drag.body, drag.velocity || { x: 1, y: -2 });
      Body.setAngularVelocity(drag.body, 0.025);
      drag = null;
    };
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("lostpointercapture", release);
    el.addEventListener(
      "click",
      (event) => {
        if (el.dataset.dragged === "true" && !el.dataset.product) {
          event.preventDefault();
          event.stopImmediatePropagation();
          el.dataset.dragged = "false";
        }
      },
      true,
    );
  });
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      area.dataset.motion = visible ? "running" : "paused";
      resume();
    },
    { threshold: 0.02 },
  ).observe(area);
  function checkVisibility() {
    const rect = area.getBoundingClientRect();
    visible = rect.top < innerHeight && rect.bottom > 0;
    area.dataset.motion = visible ? "running" : "paused";
    resume();
  }
  addEventListener("scroll", checkVisibility, { passive: true });
  addEventListener("resize", reset);
  document.addEventListener("visibilitychange", resume);
  reset();
  document.addEventListener("custom-roll-drop", () => {
    const custom = items.find((item) =>
      item.el.classList.contains("custom-pack"),
    );
    if (!custom) return;
    custom.body.isSensor = false;
    Body.setPosition(custom.body, { x: width * 0.5, y: custom.radius + 5 });
    Body.setVelocity(custom.body, { x: 2.5, y: 3 });
    Body.setAngularVelocity(custom.body, 0.075);
  });
}

export function startMotion() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.body.classList.toggle("reduced-motion", reduced);
  document.querySelectorAll("[data-letters]").forEach(splitLetters);
  if (!reduced) {
    gsap.to(".hero-lockup", {
      yPercent: -12,
      rotation: 2,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.4,
      },
    });
    gsap.fromTo(
      ".roll-assembly",
      { rotationY: -25, rotationZ: -18 },
      {
        rotationY: 335,
        rotationZ: 25,
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: ".story",
          start: "top 85%",
          end: "top -30%",
          scrub: 0.5,
        },
      },
    );
    gsap.to(".sticky-note", {
      y: -70,
      rotation: 4,
      ease: "none",
      scrollTrigger: {
        trigger: ".story",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.7,
      },
    });
    gsap.to(".story-board", {
      y: -140,
      rotation: -3,
      ease: "none",
      scrollTrigger: {
        trigger: ".story",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      },
    });
    gsap.to(".lemon-print", {
      y: -70,
      rotation: -3,
      ease: "none",
      scrollTrigger: {
        trigger: ".story",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });
    gsap.to(".gift", {
      y: -130,
      rotation: 15,
      ease: "none",
      scrollTrigger: {
        trigger: ".story",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });
    gsap.fromTo(
      ".spotlight-product",
      { rotation: -15, y: 100 },
      {
        rotation: 15,
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: ".spotlight",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        },
      },
    );
    const ribbon = document.querySelector("textPath");
    gsap.to(ribbon, {
      attr: { startOffset: "-37%" },
      ease: "none",
      scrollTrigger: {
        trigger: ".story",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });
    [".manifesto h2", ".contact-card h2", ".footer-lockup h2"].forEach(
      (selector, index) => {
        const element = document.querySelector(selector),
          letters = element.querySelectorAll(".letter");
        gsap.from(letters, {
          yPercent: (i) => 60 + noise(i + index) * 130,
          x: (i) => (noise(i + 5) - 0.5) * 65,
          rotation: (i) => (noise(i + 13) - 0.5) * 60,
          opacity: 0,
          scale: 0.75,
          stagger: { each: 0.018, from: "random" },
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 95%",
            end: "top 48%",
            scrub: 0.55,
          },
        });
      },
    );
    // Keep the collage transition rounded as it leaves the screen.
    gsap.fromTo(
      ".contact-cards",
      { y: 90, rotation: -2 },
      {
        y: 0,
        rotation: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".contact",
          start: "top bottom",
          end: "top 15%",
          scrub: 0.5,
        },
      },
    );
  }
  journey(reduced);
  footerPhysics(reduced);
  opening(reduced);
  const progress = document.querySelector(".progress");
  const updateProgress = () => {
    const travel = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${travel > 0 ? (scrollY / travel) * 100 : 0}%`;
  };
  addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
