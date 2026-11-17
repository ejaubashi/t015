import { gsap } from "gsap";
export function createPlayground(design) {
  const board = document.querySelector(".tape-board"),
    stripLayer = document.querySelector(".board-strips"),
    status = document.querySelector(".board-status"),
    help = document.querySelector("#board-help");
  const cards = [...board.querySelectorAll(".board-photo")];
  const initial = [
    { x: 0.1, y: 0.3 },
    { x: 0.39, y: 0.16 },
    { x: 0.67, y: 0.35 },
  ];
  let photos = structuredClone(initial),
    strips = [],
    history = [],
    tool = "tape",
    gesture,
    sequence = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const snapshot = () => JSON.stringify({ photos, strips });
  const remember = () => {
    history.push(snapshot());
    if (history.length > 40) history.shift();
    document.querySelector('[data-board-action="undo"]').disabled = false;
  };
  const point = (e) => {
    const rect = board.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  };
  function anchors(a, b) {
    return photos.flatMap((p, i) => {
      for (let t = 0; t <= 1; t += 0.04) {
        const x = a.x + (b.x - a.x) * t,
          y = a.y + (b.y - a.y) * t;
        if (x >= p.x && x <= p.x + 0.23 && y >= p.y && y <= p.y + 0.44)
          return [i];
      }
      return [];
    });
  }
  function render() {
    cards.forEach((card, i) => {
      card.style.left = `${photos[i].x * 100}%`;
      card.style.top = `${photos[i].y * 100}%`;
    });
    const present = new Set(strips.map((s) => String(s.id)));
    stripLayer.querySelectorAll("[data-strip]").forEach((el) => {
      if (!present.has(el.dataset.strip)) el.remove();
    });
    strips.forEach((s) => {
      let el = stripLayer.querySelector(`[data-strip="${s.id}"]`);
      if (!el) {
        el = document.createElement("button");
        el.type = "button";
        el.className = "tape-strip";
        el.dataset.strip = s.id;
        el.innerHTML = "<span></span><i></i>";
        stripLayer.append(el);
      }
      const dx = (s.b.x - s.a.x) * board.clientWidth,
        dy = (s.b.y - s.a.y) * board.clientHeight;
      el.style.left = `${s.a.x * 100}%`;
      el.style.top = `${s.a.y * 100}%`;
      el.style.width = `${Math.hypot(dx, dy)}px`;
      el.style.setProperty("--strip-color", s.color);
      el.style.transform = `translateY(-50%) rotate(${Math.atan2(dy, dx)}rad)`;
      el.querySelector("span").textContent =
        `${s.label} · ${s.label} · ${s.label}`;
      el.setAttribute("aria-label", `Peel tape strip ${s.id}`);
    });
    board.dataset.stripCount = strips.length;
    board.dataset.connections = strips.filter(
      (s) => s.anchors.length > 1,
    ).length;
    const connections = Number(board.dataset.connections);
    status.textContent = connections
      ? `${connections} connection${connections > 1 ? "s" : ""} made. Switch to Move to carry your photos together.`
      : strips.length
        ? `${strips.length} strip${strips.length > 1 ? "s" : ""} of possibility. Peel one back whenever you like.`
        : "No rules. Just possibilities.";
  }
  function selectTool(value) {
    tool = value;
    board.dataset.tool = tool;
    document
      .querySelectorAll("[data-tool]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.tool === tool)),
      );
    help.textContent =
      tool === "tape"
        ? "Drag across the board to lay down tape. Connect two photos, then move them together."
        : tool === "arrange"
          ? "Drag a photo to move it. Photos joined by tape travel together. You can also use a focused photo’s arrow keys."
          : "Click a tape strip to peel it away. Your photos are free again.";
  }
  function connected(index) {
    const set = new Set([index]);
    let changed = true;
    while (changed) {
      changed = false;
      strips.forEach((strip) => {
        if (strip.anchors.some((id) => set.has(id)))
          strip.anchors.forEach((id) => {
            if (!set.has(id)) {
              set.add(id);
              changed = true;
            }
          });
      });
    }
    return set;
  }
  function moveGroup(
    indices,
    dx,
    dy,
    baselinePhotos = photos,
    baselineStrips = strips,
  ) {
    // Clamp the whole connected group, preserving the glue between its photos.
    dx = Math.max(
      ...[...indices].map((i) => -baselinePhotos[i].x),
      Math.min(dx, ...[...indices].map((i) => 0.77 - baselinePhotos[i].x)),
    );
    dy = Math.max(
      ...[...indices].map((i) => -baselinePhotos[i].y),
      Math.min(dy, ...[...indices].map((i) => 0.54 - baselinePhotos[i].y)),
    );
    photos = baselinePhotos.map((p, i) =>
      indices.has(i) ? { x: p.x + dx, y: p.y + dy } : { ...p },
    );
    strips = baselineStrips.map((s) =>
      s.anchors.some((id) => indices.has(id))
        ? {
            ...s,
            a: { x: s.a.x + dx, y: s.a.y + dy },
            b: { x: s.b.x + dx, y: s.b.y + dy },
          }
        : structuredClone(s),
    );
    render();
  }
  board.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || tool === "peel") return;
    const p = point(e);
    const card = e.target.closest(".board-photo");
    if (tool === "arrange" && !card) return;
    const before = snapshot();
    board.setPointerCapture(e.pointerId);
    gesture = {
      before,
      start: p,
      mode: tool,
      photos: structuredClone(photos),
      strips: structuredClone(strips),
    };
    if (tool === "arrange") {
      gesture.indices = connected(Number(card.dataset.photo));
      return;
    }
    const current = design();
    const strip = {
      id: ++sequence,
      a: p,
      b: p,
      color: current.color,
      label: current.label,
      anchors: [],
    };
    gesture.strip = strip;
    strips.push(strip);
    render();
  });
  board.addEventListener("pointermove", (e) => {
    if (!gesture) return;
    const p = point(e);
    if (gesture.mode === "tape") {
      gesture.strip.b = p;
      render();
    } else
      moveGroup(
        gesture.indices,
        p.x - gesture.start.x,
        p.y - gesture.start.y,
        gesture.photos,
        gesture.strips,
      );
  });
  function end(cancel = false) {
    if (!gesture) return;
    if (cancel) {
      const previous = JSON.parse(gesture.before);
      photos = previous.photos;
      strips = previous.strips;
    } else if (gesture.mode === "tape") {
      const s = gesture.strip;
      if (
        Math.hypot(
          (s.b.x - s.a.x) * board.clientWidth,
          (s.b.y - s.a.y) * board.clientHeight,
        ) < 25
      )
        strips = strips.filter((strip) => strip.id !== s.id);
      else {
        s.anchors = anchors(s.a, s.b);
        history.push(gesture.before);
      }
    } else if (snapshot() !== gesture.before) history.push(gesture.before);
    gesture = undefined;
    document.querySelector('[data-board-action="undo"]').disabled =
      !history.length;
    render();
  }
  board.addEventListener("pointerup", () => end());
  board.addEventListener("pointercancel", () => end(true));
  board.addEventListener("lostpointercapture", () => end(true));
  stripLayer.addEventListener("click", (e) => {
    if (tool !== "peel") return;
    const el = e.target.closest("[data-strip]");
    if (!el || el.dataset.peeling) return;
    remember();
    el.dataset.peeling = "true";
    gsap.to(el, {
      scaleX: 0,
      rotationY: -80,
      opacity: 0.1,
      duration: reduced ? 0 : 0.45,
      ease: "power2.in",
      onComplete: () => {
        strips = strips.filter((s) => String(s.id) !== el.dataset.strip);
        render();
      },
    });
  });
  cards.forEach((card, i) =>
    card.addEventListener("keydown", (e) => {
      const moves = {
        ArrowLeft: [-0.015, 0],
        ArrowRight: [0.015, 0],
        ArrowUp: [0, -0.015],
        ArrowDown: [0, 0.015],
      };
      if (!moves[e.key]) return;
      e.preventDefault();
      remember();
      const [dx, dy] = moves[e.key];
      moveGroup(connected(i), dx, dy);
    }),
  );
  document
    .querySelectorAll("[data-tool]")
    .forEach((b) =>
      b.addEventListener("click", () => selectTool(b.dataset.tool)),
    );
  document
    .querySelector('[data-board-action="add"]')
    .addEventListener("click", () => {
      remember();
      const current = design();
      const a = { x: photos[0].x + 0.12, y: photos[0].y + 0.2 },
        b = { x: photos[1].x + 0.12, y: photos[1].y + 0.2 };
      strips.push({ id: ++sequence, a, b, ...current, anchors: anchors(a, b) });
      render();
    });
  document
    .querySelector('[data-board-action="undo"]')
    .addEventListener("click", () => {
      if (!history.length) return;
      const previous = JSON.parse(history.pop());
      photos = previous.photos;
      strips = previous.strips;
      document.querySelector('[data-board-action="undo"]').disabled =
        !history.length;
      render();
    });
  document
    .querySelector('[data-board-action="reset"]')
    .addEventListener("click", () => {
      remember();
      photos = structuredClone(initial);
      strips = [];
      render();
    });
  addEventListener("resize", render);
  selectTool("tape");
  render();
}
