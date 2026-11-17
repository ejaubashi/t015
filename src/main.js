import "@fontsource/anton/latin-400.css";
import "@fontsource/caveat/latin-400.css";
import "./style.css";
import { products, logo, pack } from "./catalog.js";
import { startMotion } from "./motion.js";
import { startExperience } from "./experience.js";
const asset = (path) => `${import.meta.env.BASE_URL}reference/${path}`;
const arrow = `<svg viewBox="0 0 360 180" fill="none" aria-hidden="true"><path d="M8 14C95 21 222 31 332 153M293 145l43 12-7-45" stroke="currentColor" stroke-width="1.2"/></svg>`;
const photo = (name, cls = "", tape = "") =>
  `<figure class="lifestyle ${cls}"><img src="${asset(name + ".webp")}" alt="${name === "create" ? "Paintbrushes and masking tape ready for a creative project" : name === "fix" ? "Cloth tape and tools for everyday repairs" : "Boxes and packing tape for a fresh start"}" loading="eager" draggable="false"><span class="photo-tape ${tape}"></span></figure>`;
const roll = `<div class="roll-assembly">${Array.from({ length: 20 }, (_, i) => `<span class="roll-slice" style="transform:translateZ(${i * 3 - 30}px)"></span>`).join("")}${pack(products[3], "roll-front")}<span class="roll-back"></span></div>`;
document.querySelector("#app").innerHTML = `
<div class="opening" aria-hidden="true"><div class="opening-cover">${logo}</div>${["#f58faa", "#ff882e", "#ffe34b", "#ffb1c3", "#ffab52", "#ed6c91"].map((color, i) => `<div class="opening-band" style="--band:${color};--band-index:${i}"></div>`).join("")}</div><button class="skip-intro">SKIP INTRO ↗</button>
<header><p class="header-note">STICK WITH YOU THROUGH<br>THREE GENERATIONS.</p><button class="menu-pull" aria-expanded="false" aria-controls="menu"><span class="perforation"></span><span class="menu-label">PULL ME</span><span class="pull-arrow">↓</span></button></header>
<nav id="menu" inert><span class="eyebrow">A LITTLE TAPE. A LOT OF POSSIBILITY.</span><a href="#story">OUR STORY <span>01</span></a><a href="#collection">THE GOOD STUFF <span>02</span></a><a href="#contact">SAY HELLO <span>03</span></a><p>Whatever life throws at you,<br>we’re sticking around.</p></nav>
<main>
<section class="hero paper" id="home"><div class="hero-lockup"><div class="hero-intro"><span>WE’RE</span><a href="#home" aria-label="Sweet Tape home">${logo}</a><span>HERE TO</span></div><h1 aria-label="Stick by you"><span class="hero-word stick" data-letters>STICK</span><span class="hero-word by-you" data-letters>BY YOU</span></h1></div><a href="#story" class="scroll-cue">A LITTLE SCROLL GOES A LONG WAY <span>↓</span></a></section>
<section class="story paper" id="story"><div class="hero-roll">${roll}</div><div class="story-canvas"><div class="sticky-note"><span class="photo-tape"></span><h3>TO-DO LIST</h3><p>○ chase up plans</p><p>○ daily yoga 30 minutes</p><p>○ mend things</p><span class="note-smile">☺</span></div><div class="story-board"><span class="photo-tape"></span><h2>DIY FAIL,<br>MOVING DAY<br>CHAOS. SCHOOL<br>PROJECT<br>EMERGENCY.<br>LAST-MINUTE<br>FIXES. WE<br>ALWAYS STICK<br>BY YOU.</h2></div><div class="lemon-print"><span class="photo-tape"></span>${Array.from({ length: 6 }, () => "<i>●</i>").join("")}</div><div class="gift"><span></span><i>for you.</i></div><div class="story-caption handwritten">The little things<br>that hold life together.</div></div><svg class="ribbon" viewBox="0 0 1600 250" preserveAspectRatio="none" aria-hidden="true"><defs><path id="ribbon-path" d="M-100 100Q350 290 800 125T1700 110"/></defs><use href="#ribbon-path" stroke="var(--rose)" stroke-width="108" fill="none"/><text><textPath href="#ribbon-path" startOffset="0">LIFE GETS MESSY. ✳ SOMETHING SWEET STICKS. ✳ LIFE GETS MESSY. ✳ SOMETHING SWEET STICKS.</textPath></text></svg></section>
<section class="spotlight paper" aria-label="Explore the tape family"><div class="spotlight-copy"><span class="tag">MEET YOUR NEW SIDEKICK</span><h2>THE<br><span>CREATIVE</span></h2></div><div class="spotlight-product">${pack(products[0])}</div><div class="spotlight-side"><span class="eyebrow">SMALL ROLL.<br>ENDLESS POSSIBILITIES.</span><p>From a spark of an idea<br>to something made by you.</p><button class="explore-button" data-product="masking">EXPLORE <span>↗</span></button></div><div class="family-picker" aria-label="Choose a tape">${products.map((p, i) => `<button data-family="${i}" aria-label="Show ${p.name.replaceAll("<br>", " ")}" aria-pressed="${i === 0}" style="--swatch:${p.color}"><span></span></button>`).join("")}</div></section>
<section class="manifesto paper"><span class="tag">WHY WE EXIST</span><h2 data-letters>WE’RE HERE<br>FOR THE EVERYDAY<br>MOMENTS.</h2></section>
<section class="collection" id="collection" aria-label="Scroll to explore: create, fix, and protect"><div class="journey-viewport paper"><div class="journey-world"><article class="product-scene create"><span class="scene-number">①</span><h2>TO CREATE</h2>${photo("create", "create-photo")}<span class="scene-note handwritten">every masterpiece<br>starts here.</span>${pack(products[0], "scene-pack first")}${pack(products[1], "scene-pack second")}${photo("create", "create-photo-small")}<span class="scene-note second-note handwritten">A little imagination.<br>A lot of possibility.</span>${pack(products[3], "scene-pack third")}<a href="#" class="scene-link" data-product="masking">EXPLORE THE CREATIVE SIDE ↗</a></article><div class="journey-arrow arrow-one">${arrow}</div><article class="product-scene fix"><span class="scene-number">②</span><h2>TO FIX</h2>${pack(products[2], "scene-pack first")}${photo("fix", "fix-photo", "black")}${photo("fix-hand", "fix-photo-small", "black")}<span class="scene-note handwritten">the quick fix<br>that outlasts<br>the thing it fixed.</span><a href="#" class="scene-link" data-product="cloth">MEET YOUR QUICK FIX ↗</a></article><div class="journey-arrow arrow-two">${arrow}</div><article class="product-scene move"><span class="scene-number">③</span><h2>TO PROTECT</h2>${photo("move", "move-photo")}${pack(products[3], "scene-pack first")}${pack(products[3], "scene-pack second")}<span class="scene-note handwritten">from our hands<br>to theirs.</span><a href="#" class="scene-link" data-product="opp">PACK UP THE POSSIBILITIES ↗</a></article></div><div class="journey-caption"><span class="chapter-label">01 — TO CREATE</span><span>KEEP SCROLLING <b>↘</b></span></div></div></section>
<section class="contact paper" id="contact"><div class="contact-cards"><div class="contact-photo">${photo("contact")}</div><a href="mailto:hello@sweettape.example" class="contact-card"><h2 data-letters>LET’S<br>MAKE IT<br>STICK!</h2><span>For the big ideas and the little everyday things. ↗</span></a><span class="contact-tape"></span></div></section>
<footer class="paper"><nav class="footer-nav" aria-label="Footer"><a href="#collection">OUR FAMILY</a><a href="#story">ABOUT</a><a href="#contact">CONTACT</a><a href="#home">BACK TO TOP ↑</a></nav><div class="footer-lockup">${logo}<h2 data-letters>STICK<br>BY YOU</h2></div><div class="footer-playground" aria-label="Play with the tape packs">${pack(products[2], "physics-pack")}${pack(products[1], "physics-pack")}${pack(products[0], "physics-pack")}${pack(products[3], "physics-pack")}<button class="physics-social" data-action="top" aria-label="Back to top">↑</button><a class="physics-social" href="mailto:hello@sweettape.example" aria-label="Email us">@</a></div><span class="play-hint handwritten">give us a little nudge.</span><p class="copyright">© ${new Date().getFullYear()} SWEET TAPE — RECREATED FROM YOUR RECORDINGS</p></footer>
</main><button class="sound" aria-label="Enable sound" aria-pressed="false"><span>♪</span><span class="sound-status">SOUND OFF</span><i></i></button><div class="progress" aria-hidden="true"></div><dialog id="product-dialog"><button class="dialog-close" aria-label="Close product details">✕</button><div class="dialog-product"></div><div class="dialog-copy"></div></dialog>`;
startExperience();
const pull = document.querySelector(".menu-pull"),
  menu = document.querySelector("#menu");
function toggleMenu(open) {
  pull.setAttribute("aria-expanded", open);
  menu.inert = !open;
  document.body.classList.toggle("menu-open", open);
  document.querySelector(".menu-label").textContent = open
    ? "CLOSE"
    : "PULL ME";
  if (open) menu.querySelector("a").focus();
}
pull.addEventListener("click", (event) => {
  if (event.isTrusted && pull.dataset.suppressClick === "true") return;
  toggleMenu(pull.getAttribute("aria-expanded") !== "true");
});
menu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", (event) => {
    event.preventDefault();
    toggleMenu(false);
    const target = document.querySelector(a.hash);
    target?.scrollIntoView({ behavior: "instant", block: "start" });
    history.replaceState(null, "", a.hash);
  }),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab" && pull.getAttribute("aria-expanded") === "true") {
    const links = [...menu.querySelectorAll("a"), pull];
    const first = links[0],
      last = links.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  if (e.key === "Escape") {
    if (pull.getAttribute("aria-expanded") === "true") {
      toggleMenu(false);
      pull.focus();
    }
  }
});
const dialog = document.querySelector("dialog");
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-product]");
  if (!el || el.disabled || el.closest("dialog")) return;
  e.preventDefault();
  if (el.dataset.dragged === "true") {
    el.dataset.dragged = "false";
    return;
  }
  const p = products.find((p) => p.id === el.dataset.product);
  document.querySelector(".dialog-product").innerHTML = pack(p);
  document.querySelector(".dialog-product button").disabled = true;
  document.querySelector(".dialog-copy").innerHTML =
    `<span class="eyebrow">YOUR EVERYDAY SIDEKICK</span><h2>${p.name}</h2><p>${p.desc}</p><span class="use">${p.use}</span><span class="handwritten">${p.note}</span>`;
  dialog.showModal();
});
document
  .querySelector(".dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
const personas = ["CREATIVE", "MAKER", "FIXER", "MOVER"];
document.querySelectorAll("[data-family]").forEach((button) =>
  button.addEventListener("click", () => {
    const i = Number(button.dataset.family),
      p = products[i];
    document
      .querySelectorAll("[data-family]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    document.querySelector(".spotlight-product").innerHTML = pack(p);
    document.querySelector(".spotlight-copy h2>span").textContent = personas[i];
    document.querySelector(".explore-button").dataset.product = p.id;
  }),
);
document.querySelector('[data-action="top"]').addEventListener("click", () =>
  document.querySelector("#home").scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  }),
);
let audio;
document.querySelector(".sound").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  const enabled = btn.getAttribute("aria-pressed") !== "true";
  if (enabled) {
    audio ??= new AudioContext();
    await audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(440, audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(660, audio.currentTime + 0.12);
    g.gain.setValueAtTime(0.06, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.4);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.4);
  }
  btn.setAttribute("aria-pressed", enabled);
  btn.setAttribute("aria-label", enabled ? "Disable sound" : "Enable sound");
  btn.querySelector(".sound-status").textContent = enabled
    ? "SOUND ON"
    : "SOUND OFF";
});
startMotion();
