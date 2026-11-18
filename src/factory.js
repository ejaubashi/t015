import { gsap } from "gsap";
import "./factory.css";

const palette = { rose: "#f58faa", yellow: "#ffe34b", orange: "#ff882e" };
const stationCopy = [
  [
    "THE COLOUR PRESS",
    "Where a little colour becomes a big idea.",
    "Choose your colour. Watch it travel through the line.",
  ],
  [
    "THE LABEL ROOM",
    "Every good roll has a story.",
    "Your words, printed fresh. Up to 18 characters.",
  ],
  [
    "THE DISPATCH DECK",
    "Made here. Imagined by you.",
    "Break the factory into a little magic. Bring it back as your roll.",
  ],
];
export function startFactory() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelector(".studio").insertAdjacentHTML(
    "afterend",
    `
  <section class="factory-experiment" id="factory" aria-labelledby="factory-title"><div class="factory-heading"><span class="experience-kicker">THE IMPOSSIBLE DEPARTMENT / EXPERIMENT 02</span><span class="handwritten">there’s a whole world in here.</span></div><div class="factory-stage" data-phase="paper" data-ready="false" aria-label="Tear the paper, enter a tape roll, and explore the Sweet Factory">
    <div class="factory-viewport" role="img" aria-label="A miniature rose, yellow, and orange tape factory behind a tape-roll portal"><div class="factory-fallback" aria-hidden="true"><div class="fallback-portal"></div><div class="fallback-factory"><i class="fallback-building b1"></i><i class="fallback-building b2"></i><i class="fallback-building b3"></i><span>SWEET<br>FACTORY</span><div class="fallback-belt"></div></div><div class="fallback-product"><span></span></div></div></div>
    <div class="paper-cover"><div class="paper-leaf paper-left"><span class="cover-edition">SWEET TAPE / THE OTHER SIDE</span><h2 id="factory-title">THERE’S<br>MORE<br><em>UNDER</em></h2><span class="paper-fibres"></span></div><div class="paper-leaf paper-right"><span class="cover-mark">✳</span><p>THE<br><em>SURFACE.</em></p><span class="cover-small">A SMALL TEAR.<br>A BIG POSSIBILITY.</span><span class="paper-fibres"></span></div><div class="tear-invitation"><span class="handwritten">go on. pull it.</span><button type="button" class="tear-handle" aria-label="Pull to tear open the paper"><span>TEAR<br>HERE</span><b>↓</b></button></div></div>
    <div class="factory-topbar"><ol class="factory-steps" aria-label="Journey progress"><li data-step="paper" aria-current="step">01 / TEAR</li><li data-step="portal">02 / ENTER</li><li data-step="world">03 / EXPLORE</li><li data-step="product">04 / BECOME</li></ol><button type="button" class="factory-reset">START AGAIN ↺</button></div>
    <div class="tear-tools"><label for="tear-progress">OPEN A LITTLE POSSIBILITY <span class="tear-percent">0%</span></label><input type="range" id="tear-progress" min="0" max="100" value="0" aria-label="Tear open the paper"><button type="button" class="tear-open">TEAR IT OPEN <span>↘</span></button></div>
    <div class="portal-invitation" hidden><span class="experience-kicker">THAT’S A DOOR. DISGUISED AS A ROLL.</span><h3>A SMALL WAY<br><em>INTO SOMETHING BIG.</em></h3><button type="button" class="portal-enter">ENTER THE ROLL <span>→</span></button></div>
    <div class="factory-world-ui" hidden><div class="factory-world-title"><span class="experience-kicker">WELCOME TO THE SWEET FACTORY</span><h3>Little machines.<br><em>Big possibilities.</em></h3></div><div class="station-panel"><span class="station-number">01 / THE COLOUR PRESS</span><h4>Where a little colour becomes a big idea.</h4><p class="station-help">Choose your colour. Watch it travel through the line.</p><div class="station-colours">${Object.entries(
      palette,
    )
      .map(
        ([name, color]) =>
          `<button type="button" data-factory-color="${name}" aria-label="Factory ${name} tape" aria-pressed="false" style="--swatch:${color}"></button>`,
      )
      .join(
        "",
      )}</div><label class="factory-label-wrap" hidden for="factory-label">YOUR WORDS, FRESHLY PRINTED<input id="factory-label" maxlength="18" autocomplete="off" spellcheck="false"></label><button type="button" class="factory-dispatch" hidden>LET’S MAKE MAGIC <span>↗</span></button></div><div class="factory-stations" role="group" aria-label="Explore the factory"><button type="button" data-station="0" aria-pressed="true">01 / COLOUR</button><button type="button" data-station="1" aria-pressed="false">02 / LABEL</button><button type="button" data-station="2" aria-pressed="false">03 / DISPATCH</button></div><span class="factory-drag-hint">DRAG THE WORLD TO LOOK AROUND · CHOOSE A STATION TO VISIT</span></div>
    <div class="factory-particle-ui" hidden><span class="experience-kicker">EVERY LITTLE PIECE HAS A PURPOSE.</span><h3 class="particle-title">Nothing lost.<br><em>Everything possible.</em></h3><button type="button" class="particle-assemble">BRING IT TOGETHER <span>→</span></button></div>
    <div class="factory-product-ui" hidden><span class="experience-kicker">FROM A WHOLE WORLD. TO ONE LITTLE ROLL.</span><h3>Made of possibilities.<br><em>Made by you.</em></h3><span class="factory-result-label"></span><div><button type="button" class="factory-replay">PLAY IT AGAIN ↺</button><a href="#studio" class="factory-edit">MAKE IT YOURS ↗</a></div></div>
    <span class="factory-loading" role="status" hidden>WARMING UP THE MACHINES…</span><span class="factory-status" role="status" aria-live="polite">Pull the tab, use the slider, or choose Tear It Open.</span>
  </div><div class="factory-footnote"><span>ONE CONTINUOUS JOURNEY. A FEW IMPOSSIBLE THINGS.</span><span>ROSE / YELLOW / ORANGE</span></div></section>`,
  );
  document
    .querySelector('#menu a[href="#play"]')
    .insertAdjacentHTML(
      "afterend",
      '<a href="#factory">THE OTHER SIDE <span>05</span></a>',
    );
  const stage = document.querySelector(".factory-stage"),
    range = document.querySelector("#tear-progress"),
    status = stage.querySelector(".factory-status");
  const design = () => ({
    color:
      palette[
        document.querySelector("[data-tape-color][aria-pressed=true]")?.dataset
          .tapeColor
      ] || palette.yellow,
    label:
      document.querySelector("#tape-label").value.toUpperCase() ||
      "MADE BY YOU",
    finish:
      document.querySelector("[data-finish][aria-pressed=true]")?.dataset
        .finish || "satin",
  });
  let tear = 0,
    phase = "paper",
    world,
    worldPromise,
    modulePromise,
    dragStart,
    dragInitial,
    busy = false,
    activeStation = 0,
    tearTween;
  function setPhase(next) {
    const hadFocus = stage.contains(document.activeElement);
    phase = next;
    stage.dataset.phase = next;
    stage.querySelector(".tear-tools").hidden = next !== "paper";
    stage.querySelector(".portal-invitation").hidden = next !== "portal";
    stage.querySelector(".factory-world-ui").hidden = next !== "world";
    stage.querySelector(".factory-particle-ui").hidden = next !== "particles";
    stage.querySelector(".factory-product-ui").hidden = next !== "product";
    stage.querySelector(".paper-cover").inert = next !== "paper";
    stage.querySelectorAll("[data-step]").forEach((el) => {
      const selected =
        el.dataset.step === (next === "particles" ? "product" : next);
      if (selected) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });
    stage.querySelector(".factory-result-label").textContent = design().label;
    if (hadFocus) {
      stage.tabIndex = -1;
      stage.focus({ preventScroll: true });
      const rect = stage.getBoundingClientRect();
      if (next !== "paper" && rect.bottom > 0 && rect.top < innerHeight)
        stage.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }
  const preload = () => (modulePromise ??= import("./factory-world.js"));
  async function ensureWorld() {
    if (world) return world;
    if (worldPromise) return worldPromise;
    stage.querySelector(".factory-loading").hidden = false;
    worldPromise = preload()
      .then(({ mountFactory }) => {
        world = mountFactory(
          stage.querySelector(".factory-viewport"),
          design(),
          reduced,
          { station: selectStation },
        );
        world.setTear(tear);
        stage.dataset.ready = "true";
        return world;
      })
      .catch(() => {
        stage.querySelector(".factory-viewport").dataset.renderer = "fallback";
        stage.dataset.ready = "true";
        world = {
          setTear() {},
          enter: () => Promise.resolve(),
          focusStation() {},
          burst: () => Promise.resolve(),
          assemble: () => Promise.resolve(),
          reset() {},
          update() {},
        };
        return world;
      })
      .finally(() => {
        stage.querySelector(".factory-loading").hidden = true;
      });
    return worldPromise;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        preload();
        observer.disconnect();
      }
    },
    { rootMargin: "150px" },
  );
  observer.observe(stage);
  function setTear(value) {
    tear = Math.max(0, Math.min(1, value));
    stage.style.setProperty("--tear", tear);
    stage.dataset.tear = tear.toFixed(3);
    range.value = Math.round(tear * 100);
    stage.querySelector(".tear-percent").textContent =
      `${Math.round(tear * 100)}%`;
    world?.setTear(tear);
    if (tear > 0.04) ensureWorld();
    if (tear >= 0.995) {
      setPhase("portal");
      status.textContent = "The paper is open. Step through the tape roll.";
    } else if (phase === "portal") {
      setPhase("paper");
    }
  }
  function openPaper() {
    if (busy || phase !== "paper") return;
    ensureWorld();
    tearTween = gsap.to(
      { value: tear },
      {
        value: 1,
        duration: reduced ? 0 : 1.15,
        ease: "power2.inOut",
        onUpdate() {
          setTear(this.targets()[0].value);
        },
      },
    );
  }
  range.addEventListener("input", () => {
    tearTween?.kill();
    setTear(Number(range.value) / 100);
  });
  stage.querySelector(".tear-open").addEventListener("click", openPaper);
  const handle = stage.querySelector(".tear-handle");
  handle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || phase !== "paper") return;
    dragStart = e.clientY;
    dragInitial = tear;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener("pointermove", (e) => {
    if (dragStart === undefined) return;
    setTear(
      dragInitial +
        (e.clientY - dragStart) / Math.min(380, stage.clientHeight * 0.45),
    );
  });
  handle.addEventListener("pointerup", () => {
    if (dragStart === undefined) return;
    dragStart = undefined;
    if (tear > 0.55) {
      const from = { value: tear };
      tearTween = gsap.to(from, {
        value: 1,
        duration: reduced ? 0 : 0.5,
        onUpdate: () => setTear(from.value),
      });
    }
  });
  handle.addEventListener("pointercancel", () => {
    dragStart = undefined;
  });
  handle.addEventListener("click", (e) => {
    if (e.detail === 0) openPaper();
  });
  stage.querySelector(".portal-enter").addEventListener("click", async () => {
    if (busy || phase !== "portal") return;
    busy = true;
    stage.classList.add("factory-busy");
    status.textContent = "Entering the Sweet Factory.";
    try {
      const scene = await ensureWorld();
      await scene.enter();
      setPhase("world");
      selectStation(0, false);
      status.textContent =
        "You’re inside. Drag to explore, or choose one of the three stations.";
    } finally {
      busy = false;
      stage.classList.remove("factory-busy");
    }
  });
  function selectStation(index, focus = true) {
    if (phase !== "world") return;
    activeStation = index;
    const [name, title, help] = stationCopy[index];
    stage.dataset.station = index;
    stage.querySelector(".station-number").textContent =
      `0${index + 1} / ${name}`;
    stage.querySelector(".station-panel h4").textContent = title;
    stage.querySelector(".station-help").textContent = help;
    stage.querySelector(".station-colours").hidden = index !== 0;
    stage.querySelector(".factory-label-wrap").hidden = index !== 1;
    stage.querySelector(".factory-dispatch").hidden = index !== 2;
    stage.querySelector("#factory-label").value = design().label;
    stage
      .querySelectorAll("[data-station]")
      .forEach((el) =>
        el.setAttribute(
          "aria-pressed",
          String(Number(el.dataset.station) === index),
        ),
      );
    if (focus) world?.focusStation(index);
  }
  stage
    .querySelectorAll("[data-station]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        selectStation(Number(b.dataset.station)),
      ),
    );
  stage
    .querySelectorAll("[data-factory-color]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        document
          .querySelector(`[data-tape-color="${b.dataset.factoryColor}"]`)
          .click(),
      ),
    );
  stage.querySelector("#factory-label").addEventListener("input", (e) => {
    const input = document.querySelector("#tape-label");
    input.value = e.target.value.slice(0, 18);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  function sync() {
    const current = design();
    world?.update(current);
    stage.querySelector(".factory-result-label").textContent = current.label;
    stage.querySelector(".fallback-product>span").textContent = current.label;
    stage
      .querySelectorAll("[data-factory-color]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(palette[b.dataset.factoryColor] === current.color),
        ),
      );
    stage.style.setProperty("--factory-tape", current.color);
  }
  document.addEventListener("tape-design-change", sync);
  sync();
  stage
    .querySelector(".factory-dispatch")
    .addEventListener("click", async () => {
      if (busy || phase !== "world") return;
      busy = true;
      setPhase("particles");
      stage.querySelector(".particle-assemble").disabled = true;
      status.textContent = reduced
        ? "Your design is ready to assemble."
        : "The factory is becoming a field of possibilities.";
      try {
        await world.burst();
        stage.dataset.burst = "complete";
        stage.querySelector(".particle-assemble").disabled = false;
        status.textContent =
          "Bring the pieces together to make your personalised roll.";
      } finally {
        busy = false;
      }
    });
  stage
    .querySelector(".particle-assemble")
    .addEventListener("click", async () => {
      if (busy || phase !== "particles") return;
      busy = true;
      stage.querySelector(".particle-assemble").disabled = true;
      status.textContent = "Assembling your roll.";
      try {
        await world.assemble();
        setPhase("product");
        stage.dataset.assembled = "true";
        status.textContent = `${design().label}. Your roll, made from a world of possibilities.`;
      } finally {
        busy = false;
      }
    });
  function reset() {
    if (busy) return;
    tearTween?.kill();
    world?.reset();
    stage.removeAttribute("data-assembled");
    stage.removeAttribute("data-burst");
    setPhase("paper");
    setTear(0);
    status.textContent = "Ready for another little tear.";
  }
  stage.querySelector(".factory-reset").addEventListener("click", reset);
  stage.querySelector(".factory-replay").addEventListener("click", reset);
  setPhase("paper");
  setTear(0);
}
