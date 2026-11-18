import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createPlayground } from "./playground.js";
import { startFactory } from "./factory.js";
import "./experience.css";

const palette = { rose: "#f58faa", yellow: "#ffe34b", orange: "#ff882e" };
const defaults = { color: "yellow", label: "MADE BY YOU", finish: "satin" };
export function startExperience() {
  let stored;
  try {
    stored = JSON.parse(localStorage.getItem("sweet-tape-design"));
  } catch {}
  const state = { ...defaults };
  if (stored && palette[stored.color]) {
    state.color = stored.color;
    state.label = String(stored.label || defaults.label).slice(0, 18);
    state.finish = stored.finish === "gloss" ? "gloss" : "satin";
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const main = document.querySelector("main");
  document.querySelector(".spotlight").insertAdjacentHTML(
    "afterend",
    `
  <section class="studio paper" id="studio" aria-labelledby="studio-title">
    <div class="studio-heading"><span class="experience-kicker">THE SWEET LAB / 01</span><span class="handwritten">a small roll, entirely you.</span></div>
    <div class="studio-grid"><div class="roll-showroom"><span class="showroom-ring" aria-hidden="true"></span><div class="roll-view studio-roll" role="img" aria-label="Interactive 3D preview of your custom tape"><div class="roll-fallback"><span class="fallback-label"></span></div></div><div class="showroom-caption"><span>DRAG TO TURN · MOVE TO SHINE</span><button type="button" class="spin-roll" aria-label="Spin the 3D tape roll">↻ SPIN IT</button></div></div>
    <div class="studio-controls"><h2 id="studio-title">MAKE IT<br><em>YOURS.</em></h2><p>A little colour. A few words. A whole lot of you.</p><fieldset class="color-options"><legend>01 / PICK YOUR COLOUR</legend>${Object.entries(
      palette,
    )
      .map(
        ([name, color]) =>
          `<button type="button" data-tape-color="${name}" aria-label="${name} tape" aria-pressed="false" style="--swatch:${color}"><span></span>${name}</button>`,
      )
      .join(
        "",
      )}</fieldset><label class="design-label" for="tape-label">02 / GIVE IT A NAME <span class="label-count">11/18</span></label><input id="tape-label" maxlength="18" autocomplete="off" spellcheck="false" placeholder="YOUR NEXT BIG IDEA"><fieldset class="finish-options"><legend>03 / THE FINISHING TOUCH</legend><button type="button" data-finish="satin" aria-pressed="false">SOFT SATIN</button><button type="button" data-finish="gloss" aria-pressed="false">HIGH GLOSS ↗</button></fieldset><button class="send-roll" type="button">LET IT ROLL <span>↘</span></button><span class="studio-saved" role="status">Your design stays with you on this device.</span></div></div>
  </section>`,
  );
  document.querySelector(".collection").insertAdjacentHTML(
    "afterend",
    `
  <section class="play-lab paper" id="play" aria-labelledby="play-title"><div class="play-heading"><div><span class="experience-kicker">THE SWEET LAB / 02</span><h2 id="play-title">A LITTLE<br><em>STICK & PLAY.</em></h2></div><p class="handwritten">Make a mess.<br>Make it yours.</p></div><div class="play-toolbar" role="group" aria-label="Collage tools"><button data-tool="tape" aria-pressed="true">↗ TAPE</button><button data-tool="arrange" aria-pressed="false">✥ MOVE</button><button data-tool="peel" aria-pressed="false">⌁ PEEL</button><span></span><button data-board-action="add">+ ADD STRIP</button><button data-board-action="undo" disabled>↶ UNDO</button><button data-board-action="reset">RESET</button></div><p id="board-help">Drag across the board to lay down tape. Connect two photos, then move them together.</p><div class="tape-board" aria-label="Interactive tape collage" aria-describedby="board-help"><div class="board-grid" aria-hidden="true"></div><span class="board-stamp" aria-hidden="true">GOOD THINGS<br>STICK TOGETHER.</span>${["create", "contact", "move"].map((name, i) => `<button class="board-photo" data-photo="${i}" aria-label="Move photo ${i + 1}. Use the Move tool or arrow keys." style="--photo-angle:${[-9, 7, -5][i]}deg"><img src="${import.meta.env.BASE_URL}reference/${name}.webp" alt="${["Make something", "A colourful collection", "A fresh start"][i]}" draggable="false"><span>${["make something.", "keep the good stuff.", "start somewhere."][i]}</span></button>`).join("")}<div class="board-strips"></div><span class="board-corner" aria-hidden="true">↑ THIS IS YOUR SPACE</span></div><p class="board-status" role="status" aria-live="polite">No rules. Just possibilities.</p></section>
  <section class="finale paper" id="finale" aria-labelledby="finale-title"><span class="experience-kicker">ONE LAST LITTLE TWIST.</span><h2 id="finale-title">YOUR IDEAS.<br><em>ON A ROLL.</em></h2><p class="finale-copy">From your imagination, into the world.</p><div class="finale-traveller"><div class="roll-view finale-roll" role="img" aria-label="Your personalised tape rolling into the finale"><div class="roll-fallback"><span class="fallback-label"></span></div></div></div><span class="finale-instruction">KEEP SCROLLING. YOUR ROLL IS COMING WITH YOU. ↓</span></section>`,
  );
  document
    .querySelector(".contact")
    .insertAdjacentElement("afterend", document.querySelector(".finale"));
  const footer = document.querySelector(".footer-playground");
  footer.insertAdjacentHTML(
    "beforeend",
    `<button class="pack physics-pack custom-pack" data-custom-return aria-label="Edit your custom tape"><span class="pack-hole"></span><span class="pack-rimtext">ONE OF A KIND. JUST LIKE YOU.</span><span class="pack-label"><span class="brand">SWEET<br>TAPE</span><strong class="custom-pack-label"></strong><span class="barcode"></span></span><span class="pack-type">MADE BY YOU</span></button>`,
  );
  document
    .querySelector('#menu a[href="#contact"]')
    .insertAdjacentHTML(
      "beforebegin",
      '<a href="#studio">MAKE IT YOURS <span>03</span></a><a href="#play">STICK & PLAY <span>04</span></a>',
    );
  document
    .querySelector(".hero-intro")
    .insertAdjacentHTML(
      "beforebegin",
      '<a href="#studio" class="hero-lab-link">ENTER THE SWEET LAB ↗</a>',
    );
  main.insertAdjacentHTML(
    "afterbegin",
    '<svg class="continuous-tape" aria-hidden="true"><defs><filter id="tape-shadow"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-opacity=".12"/></filter></defs><path class="thread-shadow"/><path class="thread-body"/><path class="thread-seam"/><circle class="thread-tip" r="12"/></svg>',
  );
  document
    .querySelector(".journey-world")
    .insertAdjacentHTML(
      "afterbegin",
      '<svg class="journey-thread" aria-hidden="true"><path/></svg>',
    );
  const input = document.querySelector("#tape-label");
  input.value = state.label;
  const views = new Set();
  function sync() {
    const color = palette[state.color];
    document.documentElement.style.setProperty("--custom-tape", color);
    document
      .querySelectorAll("[data-tape-color]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.tapeColor === state.color),
        ),
      );
    document
      .querySelectorAll("[data-finish]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.finish === state.finish),
        ),
      );
    document.querySelector(".label-count").textContent =
      `${input.value.length}/18`;
    document
      .querySelectorAll(".fallback-label,.custom-pack-label")
      .forEach((el) => (el.textContent = state.label || defaults.label));
    document.querySelector(".custom-pack").style.setProperty("--pack", color);
    document
      .querySelector(".custom-pack")
      .style.setProperty(
        "--rim",
        state.color === "rose"
          ? "#ba506d"
          : state.color === "orange"
            ? "#bf521e"
            : "#c18a25",
      );
    views.forEach((view) => view.update({ ...state, color }));
    document.querySelector(".studio").dataset.designColor = state.color;
    try {
      localStorage.setItem("sweet-tape-design", JSON.stringify(state));
    } catch {}
    document.dispatchEvent(
      new CustomEvent("tape-design-change", { detail: { ...state, color } }),
    );
  }
  document.querySelectorAll("[data-tape-color]").forEach((b) =>
    b.addEventListener("click", () => {
      state.color = b.dataset.tapeColor;
      sync();
    }),
  );
  document.querySelectorAll("[data-finish]").forEach((b) =>
    b.addEventListener("click", () => {
      state.finish = b.dataset.finish;
      sync();
    }),
  );
  input.addEventListener("input", () => {
    state.label = input.value
      .replace(/[\u0000-\u001f]/g, "")
      .slice(0, 18)
      .toUpperCase();
    sync();
  });
  sync();
  createPlayground(() => ({
    color: palette[state.color],
    label: state.label || defaults.label,
  }));
  // Load the actual mesh renderer only near a visible roll; the CSS ring is a working fallback.
  const hero = document.querySelector(".hero-roll");
  hero.insertAdjacentHTML(
    "beforeend",
    '<div class="roll-view hero-webgl" role="img" aria-label="A tape roll turning in three dimensions"><div class="roll-fallback"><span class="fallback-label"></span></div></div>',
  );
  const lazy = new IntersectionObserver(
    (entries) =>
      entries.forEach(async (entry) => {
        if (!entry.isIntersecting) return;
        if (
          entry.target.classList.contains("finale-roll") &&
          document.querySelector(".finale").getBoundingClientRect().bottom < 10
        )
          return;
        lazy.unobserve(entry.target);
        if (document.body.classList.contains("intro-playing"))
          await new Promise((resolve) =>
            document.addEventListener("intro-complete", resolve, {
              once: true,
            }),
          );
        const rect = entry.target.getBoundingClientRect();
        if (rect.bottom < -250 || rect.top > innerHeight + 250) {
          lazy.observe(entry.target);
          return;
        }
        try {
          const { mountRoll } = await import("./roll3d.js");
          const view = mountRoll(
            entry.target,
            { ...state, color: palette[state.color] },
            reduced,
          );
          views.add(view);
          if (entry.target.classList.contains("studio-roll"))
            document
              .querySelector(".spin-roll")
              .addEventListener("click", view.spin);
        } catch {
          entry.target.dataset.renderer = "fallback";
        }
      }),
    { rootMargin: "250px" },
  );
  document.querySelectorAll(".roll-view").forEach((el) => lazy.observe(el));
  sync();
  startFactory();
  tactileMenu(reduced);
  setupThread(reduced);
  setupFinale(reduced);
  document
    .querySelector("[data-custom-return]")
    .addEventListener("click", (e) => {
      if (e.currentTarget.dataset.dragged === "true") {
        e.currentTarget.dataset.dragged = "false";
        return;
      }
      document
        .querySelector(".studio")
        .scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
    });
  document.querySelector(".send-roll").addEventListener("click", () => {
    const target =
      document.querySelector("footer").getBoundingClientRect().top + scrollY;
    if (reduced) {
      scrollTo({ top: target, behavior: "instant" });
      document.dispatchEvent(new Event("custom-roll-drop"));
      return;
    }
    document
      .querySelector(".finale")
      .scrollIntoView({ behavior: "instant", block: "start" });
    const position = { y: scrollY };
    let tween;
    const cancel = () => tween?.kill();
    tween = gsap.to(position, {
      y: target,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: () => scrollTo({ top: position.y, behavior: "instant" }),
      onComplete: () => {
        removeEventListener("wheel", cancel);
        removeEventListener("touchstart", cancel);
      },
    });
    addEventListener("wheel", cancel, { once: true, passive: true });
    addEventListener("touchstart", cancel, { once: true, passive: true });
  });
}

function tactileMenu(reduced) {
  const pull = document.querySelector(".menu-pull");
  let start,
    delta = 0,
    moved = false;
  pull.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    start = e.clientY;
    delta = 0;
    moved = false;
    pull.setPointerCapture(e.pointerId);
  });
  pull.addEventListener("pointermove", (e) => {
    if (start === undefined) return;
    delta = Math.max(0, Math.min(170, e.clientY - start));
    moved = delta > 12;
    pull.style.setProperty("--pull-distance", `${delta * 0.65}px`);
    if (!reduced) gsap.set(pull, { rotation: Math.min(6, delta * 0.035) });
  });
  const release = () => {
    if (start === undefined) return;
    start = undefined;
    pull.style.setProperty("--pull-distance", "0px");
    gsap.to(pull, {
      rotation: 0,
      duration: reduced ? 0 : 0.65,
      ease: "elastic.out(1,.4)",
    });
    if (moved) {
      pull.dataset.suppressClick = "true";
      if (delta > 48) pull.click();
      setTimeout(() => {
        delete pull.dataset.suppressClick;
      }, 50);
    }
  };
  pull.addEventListener("pointerup", release);
  pull.addEventListener("pointercancel", () => {
    start = undefined;
    pull.style.setProperty("--pull-distance", "0px");
    gsap.set(pull, { rotation: 0 });
  });
}

function setupThread(reduced) {
  const main = document.querySelector("main"),
    svg = document.querySelector(".continuous-tape"),
    paths = [...svg.querySelectorAll("path")],
    tip = svg.querySelector("circle");
  let length = 0,
    raf;
  function measure() {
    const width = main.clientWidth,
      height =
        document.querySelector("footer").offsetTop +
        document.querySelector("footer").offsetHeight;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.height = `${height}px`;
    const mainTop = main.getBoundingClientRect().top + scrollY;
    const points = [{ x: width * 0.92, y: innerHeight * 0.7 }];
    for (const [selector, xs] of [
      [".story", [0.93, 0.06]],
      [".spotlight", [0.06, 0.94]],
      [".studio", [0.96, 0.96]],
      [".manifesto", [0.95, 0.04]],
      [".collection", [0.025, 0.025]],
      [".play-lab", [0.03, 0.96]],
      [".finale", [0.94, 0.5]],
    ]) {
      const el = document.querySelector(selector),
        top = el.getBoundingClientRect().top + scrollY - mainTop;
      if (selector === ".play-lab") {
        const board = el.querySelector(".tape-board");
        points.push(
          { x: width * 0.025, y: top + 70 },
          {
            x: width * 0.025,
            y: board.getBoundingClientRect().top + scrollY - mainTop + 60,
          },
          { x: width * 0.96, y: top + el.offsetHeight - 40 },
        );
      } else
        points.push(
          { x: width * xs[0], y: top + 70 },
          { x: width * xs[1], y: top + el.offsetHeight - 70 },
        );
    }
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1],
        b = points[i];
      d += ` C ${a.x} ${a.y + (b.y - a.y) * 0.6}, ${b.x} ${b.y - (b.y - a.y) * 0.6}, ${b.x} ${b.y}`;
    }
    paths.forEach((p) => p.setAttribute("d", d));
    length = paths[0].getTotalLength();
    paths.forEach((p) => (p.style.strokeDasharray = `${length}`));
    update();
    const local = document.querySelector(".journey-thread");
    const unit = innerWidth * (innerWidth <= 800 ? 1.5 : 1),
      h = innerHeight;
    local.setAttribute("viewBox", `0 0 ${unit * 7.8} ${h * 1.8}`);
    local.style.width = `${unit * 7.8}px`;
    local.style.height = `${h * 1.8}px`;
    local
      .querySelector("path")
      .setAttribute(
        "d",
        `M0 ${h * 0.8} C${unit} ${h * 1.1},${unit * 1.6} ${-h * 0.1},${unit * 2.3} ${h * 0.6} S${unit * 2.8} ${h * 1.6},${unit * 3.6} ${h * 1.55} S${unit * 4.6} ${h * 1.7},${unit * 5.15} ${h * 0.65} S${unit * 6.5} ${-h * 0.2},${unit * 7.8} ${h * 0.6}`,
      );
  }
  function update() {
    const y = scrollY + innerHeight * 0.72;
    let lo = 0,
      hi = length;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (paths[0].getPointAtLength(mid).y < y) lo = mid;
      else hi = mid;
    }
    const drawn = reduced ? length : lo;
    paths.forEach((p) => (p.style.strokeDashoffset = length - drawn));
    const p = paths[0].getPointAtLength(drawn);
    tip.setAttribute("cx", p.x);
    tip.setAttribute("cy", p.y);
    svg.dataset.drawn = Math.round(drawn);
    raf = undefined;
  }
  addEventListener(
    "scroll",
    () => {
      if (!raf) raf = requestAnimationFrame(update);
    },
    { passive: true },
  );
  addEventListener("resize", measure);
  document.fonts.ready.then(measure);
  ScrollTrigger.addEventListener("refresh", measure);
  measure();
}

function setupFinale(reduced) {
  const finale = document.querySelector(".finale"),
    traveller = document.querySelector(".finale-traveller"),
    custom = document.querySelector(".custom-pack");
  if (reduced) {
    finale.dataset.motion = "reduced";
    custom.classList.add("landed");
    return;
  }
  let landed = false;
  const drop = () => {
    if (landed) return;
    landed = true;
    custom.classList.add("landed");
    document.dispatchEvent(new Event("custom-roll-drop"));
  };
  gsap
    .timeline({
      scrollTrigger: {
        trigger: finale,
        start: "top 60%",
        end: "bottom top",
        scrub: 0.55,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          finale.dataset.flight = self.progress.toFixed(3);
          if (self.progress > 0.94) drop();
          if (self.progress < 0.8) {
            landed = false;
            custom.classList.remove("landed");
          }
        },
      },
    })
    .fromTo(
      traveller,
      { y: 0, scale: 1, rotation: -20 },
      {
        y: () => {
          const area = document.querySelector(".footer-playground");
          return (
            area.getBoundingClientRect().top +
            scrollY +
            Math.max(custom.offsetWidth / 2 + 5, area.clientHeight * 0.12) -
            (finale.getBoundingClientRect().top +
              scrollY +
              traveller.offsetTop +
              traveller.offsetHeight / 2)
          );
        },
        scale: 0.42,
        rotation: 320,
        ease: "power1.inOut",
        duration: 0.68,
      },
      0.32,
    )
    .to(traveller, { opacity: 0, duration: 0.08 }, 0.92);
}
