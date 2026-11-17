import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export function mountRoll(host, initial, reduced) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: innerWidth > 800,
      powerPreference: "low-power",
    });
  } catch {
    host.dataset.renderer = "fallback";
    return {
      update(next) {
        host.dataset.label = next.label;
      },
      spin() {
        const fallback = host.querySelector(".roll-fallback");
        fallback.animate([{ rotate: "0deg" }, { rotate: "360deg" }], {
          duration: reduced ? 0 : 850,
          easing: "ease-out",
        });
        host.dataset.turned = "fallback-spin";
      },
    };
  }
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth > 800 ? 1.25 : 1),
  );
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  host.dataset.renderer = "webgl";
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  camera.position.set(0, 0, 7.6);
  const pmrem = new THREE.PMREMGenerator(renderer),
    environment = new RoomEnvironment();
  const environmentTarget = pmrem.fromScene(environment, 0.04);
  scene.environment = environmentTarget.texture;
  environment.dispose();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight("#fff2df", 0.5));
  const key = new THREE.DirectionalLight("#fff5dd", 2);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#ffb2c6", 1);
  rim.position.set(3, -1, -3);
  scene.add(rim);
  const group = new THREE.Group();
  scene.add(group);
  const outer = 1.72,
    inner = 0.68,
    depth = 0.73;
  const profile = [
    new THREE.Vector2(inner, -depth / 2),
    new THREE.Vector2(outer - 0.025, -depth / 2),
    new THREE.Vector2(outer, -depth / 2 + 0.025),
    new THREE.Vector2(outer, depth / 2 - 0.025),
    new THREE.Vector2(outer - 0.025, depth / 2),
    new THREE.Vector2(inner, depth / 2),
    new THREE.Vector2(inner, -depth / 2),
  ];
  const surface = document.createElement("canvas");
  surface.width = 1024;
  surface.height = 128;
  const sideCtx = surface.getContext("2d");
  sideCtx.fillStyle = "#f9d18c";
  sideCtx.fillRect(0, 0, 1024, 128);
  for (let y = 0; y < 128; y++) {
    sideCtx.fillStyle = `rgba(94,49,18,${0.05 + (Math.sin(y * 11) * 0.5 + 0.5) * 0.12})`;
    sideCtx.fillRect(0, y, 1024, 1);
  }
  const sideTexture = new THREE.CanvasTexture(surface);
  sideTexture.colorSpace = THREE.SRGBColorSpace;
  sideTexture.wrapS = THREE.RepeatWrapping;
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    map: sideTexture,
    roughness: 0.38,
    metalness: 0.02,
    clearcoat: 0.28,
    clearcoatRoughness: 0.3,
  });
  const body = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 112),
    bodyMaterial,
  );
  body.rotation.x = Math.PI / 2;
  group.add(body);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: "#c9a777",
    roughness: 0.95,
    side: THREE.DoubleSide,
  });
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(inner, inner, depth + 0.015, 96, 1, true),
    coreMaterial,
  );
  core.rotation.x = Math.PI / 2;
  group.add(core);
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = labelCanvas.height = 1024;
  const ctx = labelCanvas.getContext("2d");
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  labelTexture.anisotropy = Math.min(
    8,
    renderer.capabilities.getMaxAnisotropy(),
  );
  const labelMaterial = new THREE.MeshPhysicalMaterial({
    map: labelTexture,
    envMapIntensity: 0.5,
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.4,
    side: THREE.DoubleSide,
  });
  const face = new THREE.Mesh(
    new THREE.RingGeometry(inner, outer - 0.018, 112),
    labelMaterial,
  );
  face.position.z = depth / 2 + 0.008;
  group.add(face);
  const back = face.clone();
  back.rotation.y = Math.PI;
  back.position.z = -depth / 2 - 0.008;
  group.add(back);
  let design = initial,
    visible = false,
    frame,
    last = 0,
    drag,
    rotation = 0,
    spinVelocity = 0,
    hover = { x: 0, y: 0 },
    angleX = -0.3,
    angleY = -0.45;
  function update(next) {
    design = next;
    ctx.clearRect(0, 0, 1024, 1024);
    ctx.fillStyle = next.color;
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = "rgba(89,30,50,.4)";
    ctx.lineWidth = 2;
    [481, 460, 218].forEach((r) => {
      ctx.beginPath();
      ctx.arc(512, 512, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.fillStyle = "#591e32";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 25px Arial";
    ctx.fillText("SWEET TAPE  /  THE SWEET LAB", 512, 130);
    const words = (next.label || "MADE BY YOU").toUpperCase();
    const pieces = words.split(" ");
    let a = "",
      b = "";
    for (const word of pieces) {
      if (a.length < words.length / 2) a += (a ? " " : "") + word;
      else b += (b ? " " : "") + word;
    }
    if (!b) {
      a = words;
      b = "ONE OF A KIND";
    }
    const fit = (text, y, maxSize) => {
      let size = maxSize;
      do {
        ctx.font = `${size}px Anton, Impact, sans-serif`;
        size -= 2;
      } while (ctx.measureText(text).width > 760 && size > 28);
      ctx.fillText(text, 512, y);
    };
    fit(a, 272, 112);
    fit(b, 760, 112);
    ctx.font = "700 24px Arial";
    ctx.fillText("STICK WITH WHAT MAKES YOU, YOU.", 512, 867);
    ctx.font = "20px Arial";
    ctx.fillText(
      next.finish === "gloss"
        ? "HIGH GLOSS  ·  MADE BY YOU"
        : "SOFT SATIN  ·  MADE BY YOU",
      512,
      919,
    );
    labelTexture.needsUpdate = true;
    labelMaterial.roughness = next.finish === "gloss" ? 0.12 : 0.58;
    labelMaterial.clearcoat = next.finish === "gloss" ? 1 : 0.18;
    bodyMaterial.clearcoat = next.finish === "gloss" ? 0.9 : 0.15;
    host.dataset.label = next.label;
    render();
  }
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  }
  function render() {
    group.rotation.set(
      angleX + hover.y * 0.18,
      angleY + hover.x * 0.3,
      rotation - 0.2,
    );
    if (host.classList.contains("hero-webgl"))
      group.rotation.y += (scrollY / Math.max(1, innerHeight)) * 3;
    renderer.render(scene, camera);
  }
  function animate(time) {
    if (
      !visible ||
      document.hidden ||
      (host.classList.contains("finale-roll") &&
        Number(document.querySelector(".finale").dataset.flight) > 0.99)
    ) {
      frame = undefined;
      last = 0;
      return;
    }
    if (last && time - last < 32 && !reduced) {
      frame = requestAnimationFrame(animate);
      return;
    }
    const dt = last ? Math.min((time - last) / 16.67, 3) : 1;
    last = time;
    if (!drag && !reduced) {
      rotation += 0.0017 * dt;
      angleY += spinVelocity * dt;
      spinVelocity *= Math.pow(0.96, dt);
    }
    render();
    frame = undefined;
    if (!reduced || Math.abs(spinVelocity) > 0.001)
      frame = requestAnimationFrame(animate);
  }
  function resume() {
    if (visible && !frame && !document.hidden)
      frame = requestAnimationFrame(animate);
  }
  host.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY };
    host.setPointerCapture(e.pointerId);
  });
  host.addEventListener("pointermove", (e) => {
    const rect = host.getBoundingClientRect();
    hover = {
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    };
    if (drag) {
      angleY += (e.clientX - drag.x) * 0.012;
      angleX += (e.clientY - drag.y) * 0.008;
      drag = { x: e.clientX, y: e.clientY };
      host.dataset.turned = String(angleY);
    }
    render();
  });
  const release = () => {
    drag = undefined;
  };
  host.addEventListener("pointerup", release);
  host.addEventListener("pointercancel", release);
  host.addEventListener("lostpointercapture", release);
  host.addEventListener("pointerleave", () => {
    hover = { x: 0, y: 0 };
    render();
  });
  host.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    host.dataset.renderer = "fallback";
    visible = false;
    renderer.domElement.style.display = "none";
  });
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      resume();
    },
    { rootMargin: "100px" },
  ).observe(host);
  new ResizeObserver(resize).observe(host);
  document.addEventListener("visibilitychange", resume);
  if (host.classList.contains("finale-roll"))
    addEventListener("scroll", resume, { passive: true });
  const spin = () => {
    angleY += reduced ? Math.PI / 2 : 0;
    spinVelocity = reduced ? 0 : 0.16;
    render();
    resume();
  };
  update(initial);
  resize();
  document.fonts.ready.then(() => update(design));
  return { update, spin };
}
