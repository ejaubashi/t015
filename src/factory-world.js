import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { gsap } from "gsap";

const colors = {
  ink: "#591e32",
  rose: "#f58faa",
  yellow: "#ffe34b",
  orange: "#ff882e",
  cream: "#fff7e8",
};
export function mountFactory(host, initial, reduced, hooks) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: innerWidth > 800,
      powerPreference: "low-power",
    });
  } catch {
    host.dataset.renderer = "fallback";
    return {
      setTear() {},
      enter: () => Promise.resolve(),
      focusStation() {},
      burst: () => Promise.resolve(),
      assemble: () => Promise.resolve(),
      reset() {},
      update(next) {
        host.style.setProperty("--factory-tape", next.color);
      },
    };
  }
  host.append(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.dataset.renderer = "webgl";
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth > 800 ? 1.25 : 1),
  );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const factoryScene = new THREE.Scene();
  factoryScene.background = new THREE.Color("#f7d8c3");
  factoryScene.fog = new THREE.Fog("#f7d8c3", 26, 65);
  factoryScene.add(new THREE.HemisphereLight("#fff8ec", "#a45672", 2));
  const sun = new THREE.DirectionalLight("#fff0c4", 2.7);
  sun.position.set(-8, 12, 8);
  factoryScene.add(sun);
  const fill = new THREE.DirectionalLight("#ffc5d4", 1);
  fill.position.set(9, 3, -5);
  factoryScene.add(fill);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 150);
  camera.position.set(12, 10, 15);
  camera.lookAt(0, 0.8, 0);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.8, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.minDistance = 7;
  controls.maxDistance = 29;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.minPolarAngle = 0.25;
  controls.enabled = false;
  const gateScene = new THREE.Scene();
  gateScene.background = new THREE.Color("#35172a");
  gateScene.add(new THREE.HemisphereLight("#fff4d7", "#71314e", 2.4));
  const gateLight = new THREE.DirectionalLight("#ffe6b0", 3);
  gateLight.position.set(-3, 5, 6);
  gateScene.add(gateLight);
  const gateCamera = new THREE.PerspectiveCamera(40, 1, 0.01, 50);
  gateCamera.position.z = 9.4;
  const target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  const aperture = new THREE.Mesh(
    new THREE.CircleGeometry(1.04, 96),
    new THREE.ShaderMaterial({
      uniforms: { uScene: { value: target.texture } },
      vertexShader:
        "varying vec4 vScreen;void main(){vScreen=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position=vScreen;}",
      fragmentShader:
        "uniform sampler2D uScene;varying vec4 vScreen;void main(){vec2 uv=vScreen.xy/vScreen.w*.5+.5;gl_FragColor=texture2D(uScene,uv);\n#include <colorspace_fragment>\n}",
      toneMapped: false,
    }),
  );
  aperture.position.z = 0.43;
  const gateAssembly = new THREE.Group();
  gateAssembly.position.y = 1.1;
  gateScene.add(gateAssembly);
  gateAssembly.add(aperture);
  const gateRoll = new THREE.Group();
  gateAssembly.add(gateRoll);
  const gateProfile = [
    new THREE.Vector2(1.06, -0.38),
    new THREE.Vector2(1.92, -0.38),
    new THREE.Vector2(1.96, -0.33),
    new THREE.Vector2(1.96, 0.33),
    new THREE.Vector2(1.92, 0.38),
    new THREE.Vector2(1.06, 0.38),
    new THREE.Vector2(1.06, -0.38),
  ];
  const gateBody = new THREE.Mesh(
    new THREE.LatheGeometry(gateProfile, 96),
    new THREE.MeshStandardMaterial({
      color: colors.yellow,
      roughness: 0.42,
      metalness: 0.12,
    }),
  );
  gateBody.rotation.x = Math.PI / 2;
  gateRoll.add(gateBody);
  const gateLabel = signTexture(
    "SWEET",
    "FACTORY",
    colors.yellow,
    colors.ink,
    true,
  );
  const gateFace = new THREE.Mesh(
    new THREE.RingGeometry(1.06, 1.93, 96),
    new THREE.MeshBasicMaterial({ map: gateLabel, side: THREE.DoubleSide }),
  );
  gateFace.position.z = 0.385;
  gateRoll.add(gateFace);
  for (let i = 0; i < 3; i++) {
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(2.2 + i * 0.26, 0.009, 5, 96),
      new THREE.MeshBasicMaterial({
        color: colors.rose,
        transparent: true,
        opacity: 0.35 - i * 0.08,
      }),
    );
    halo.position.z = -0.5 - i * 0.2;
    gateAssembly.add(halo);
  }
  const root = new THREE.Group();
  factoryScene.add(root);
  const materials = {};
  for (const [name, color] of Object.entries(colors))
    materials[name] = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0.05,
    });
  materials.metal = new THREE.MeshStandardMaterial({
    color: "#b2a7a8",
    roughness: 0.28,
    metalness: 0.8,
  });
  materials.glow = new THREE.MeshStandardMaterial({
    color: "#ffe7a5",
    emissive: "#ffb24e",
    emissiveIntensity: 0.65,
    roughness: 0.25,
  });
  function box(w, h, d, material, x, y, z, parent = root) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  function cylinder(r, h, material, x, y, z, parent = root, r2 = r) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r2, h, 32),
      material,
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  function sphere(r, material, x, y, z, parent = root) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  function torus(r, t, material, x, y, z, parent = root) {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(r, t, 12, 48),
      material,
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  const base = box(15, 0.55, 9, materials.rose, 0, -0.38, 0);
  base.name = "platform";
  box(14.5, 0.08, 8.5, materials.cream, 0, -0.055, 0);
  // Three recognisable stations: a colour press, a label printer, and dispatch.
  const stations = [];
  for (let i = 0; i < 3; i++) {
    const group = new THREE.Group();
    group.position.set((i - 1) * 4.2, 0, -0.7);
    group.userData.station = i;
    root.add(group);
    stations.push(group);
  }
  const press = stations[0];
  cylinder(1.05, 1.8, materials.orange, 0, 0.9, 0, press);
  cylinder(1.2, 0.2, materials.ink, 0, 1.85, 0, press);
  cylinder(0.74, 0.75, materials.rose, 0, 2.3, 0, press);
  cylinder(0.84, 0.15, materials.yellow, 0, 2.75, 0, press);
  box(0.28, 2.6, 0.28, materials.metal, -1.35, 1.3, 0, press);
  box(0.28, 2.6, 0.28, materials.metal, 1.35, 1.3, 0, press);
  box(3, 0.25, 0.7, materials.yellow, 0, 2.55, 0, press);
  const piston = cylinder(0.22, 0.7, materials.metal, 0, 3.2, 0, press);
  piston.name = "piston";
  const printer = stations[1];
  box(2.7, 2.1, 1.9, materials.rose, 0, 1.05, 0, printer);
  box(2.9, 0.25, 2.1, materials.orange, 0, 2.2, 0, printer);
  box(1.9, 0.7, 0.12, materials.ink, 0, 1.25, 1.01, printer);
  box(1.7, 0.34, 0.16, materials.glow, 0, 1.27, 1.1, printer);
  const reel = torus(0.6, 0.19, materials.yellow, 0, 2.95, 0, printer);
  box(0.2, 0.75, 0.2, materials.metal, -0.8, 2.5, 0, printer);
  box(0.2, 0.75, 0.2, materials.metal, 0.8, 2.5, 0, printer);
  box(1.5, 0.12, 1.05, materials.cream, 0, 0.5, 1.3, printer);
  const dispatch = stations[2];
  box(2.6, 1.8, 2, materials.orange, 0, 0.9, 0, dispatch);
  box(2.85, 0.2, 2.2, materials.yellow, 0, 1.9, 0, dispatch);
  for (let j = 0; j < 3; j++) {
    const parcel = box(
      0.65,
      0.5,
      0.6,
      materials.cream,
      (j - 1) * 0.76,
      2.25,
      0.1,
      dispatch,
    );
    box(
      0.1,
      0.52,
      0.62,
      materials.rose,
      parcel.position.x,
      2.25,
      0.1,
      dispatch,
    );
  }
  torus(0.42, 0.12, materials.rose, 0, 1.1, 1.06, dispatch);
  const customMaterial = new THREE.MeshStandardMaterial({
    color: initial.color,
    roughness: 0.4,
  });
  const track = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-5.8, 0.48, 2),
      new THREE.Vector3(5.8, 0.48, 2),
      new THREE.Vector3(6.2, 0.48, -2.9),
      new THREE.Vector3(-6.2, 0.48, -2.9),
    ],
    true,
    "catmullrom",
    0.2,
  );
  root.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(track, 128, 0.22, 8, true),
      materials.ink,
    ),
  );
  const rolls = [];
  for (let i = 0; i < 12; i++) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(0.27, 0.13, 8, 22),
      customMaterial,
    );
    root.add(r);
    r.position.copy(track.getPointAt(i / 12));
    r.rotation.x = Math.PI / 3;
    rolls.push(r);
  }
  const signs = [];
  function placeSign(textA, textB, x, y, z, width, height) {
    const texture = signTexture(textA, textB, colors.cream, colors.ink);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture }),
    );
    mesh.position.set(x, y, z);
    root.add(mesh);
    signs.push(mesh);
    return mesh;
  }
  placeSign("COLOUR", "PRESS", -4.2, 1.1, 0.4, 1.5, 0.72);
  const labelSign = placeSign(
    initial.label,
    "PRINTED FRESH",
    0,
    2.03,
    1.08,
    2.2,
    0.53,
  );
  placeSign("DISPATCH", "GOOD THINGS AHEAD", 4.2, 0.6, 1.02, 1.75, 0.55);
  placeSign("SWEET", "FACTORY", 0, 4, -1.8, 4.8, 1.45);
  for (const x of [-2.9, 2.9]) {
    cylinder(0.07, 3.8, materials.metal, x, 1.9, -1.8);
    sphere(0.18, materials.glow, x, 3.9, -1.8);
  }
  for (let i = 0; i < 5; i++) {
    const x = -6.6 + i * 3.3;
    box(0.15, 0.8, 0.15, materials.metal, x, 0.4, 3.7);
    sphere(0.18, materials.glow, x, 0.92, 3.7);
  }
  for (const [x, z] of [
    [-6.7, -3.4],
    [6.7, 3.3],
    [-6.8, 3.1],
    [6.5, -3.3],
  ]) {
    cylinder(0.1, 0.7, materials.ink, x, 0.35, z);
    sphere(0.45, materials.rose, x, 0.9, z);
    sphere(0.3, materials.orange, x, 1.32, z);
  }
  const vents = [];
  for (let i = 0; i < 3; i++) {
    const vent = cylinder(
      0.21,
      1 + i * 0.3,
      materials.rose,
      -0.85 + i * 0.8,
      2.75 + i * 0.15,
      -1.1,
      printer,
    );
    vents.push(vent);
    const cloud = new THREE.Group();
    for (let j = 0; j < 3; j++)
      sphere(
        0.18 + j * 0.06,
        materials.cream,
        -0.1 + j * 0.14,
        j * 0.18,
        0,
        cloud,
      );
    cloud.position.set(-0.85 + i * 0.8, 3.8 + i * 0.3, -1.1);
    printer.add(cloud);
  }
  // Discrete floor markings and a looping line give the scene scale without external assets.
  for (let i = 0; i < 13; i++)
    box(0.48, 0.012, 0.05, materials.rose, -5.8 + i * 0.95, 0.012, 3.25);
  const product = makeRoll(initial);
  product.visible = false;
  factoryScene.add(product);
  let design = initial,
    phase = "gate",
    tear = 0,
    visible = false,
    frame,
    last = 0,
    clock = 0,
    particles,
    tweens = [],
    dragStart;
  const transition = { entry: 0, burst: 0, assemble: 0 };
  function trackTween(tween) {
    tweens.push(tween);
    return tween;
  }
  function tweenCamera(position, targetPoint, duration = 1.3) {
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);
    return new Promise((resolve) => {
      if (reduced) {
        camera.position.copy(position);
        controls.target.copy(targetPoint);
        controls.update();
        render();
        resolve();
        return;
      }
      trackTween(
        gsap.to(camera.position, {
          x: position.x,
          y: position.y,
          z: position.z,
          duration,
          ease: "power2.inOut",
          onUpdate: () => {
            camera.lookAt(controls.target);
            render();
          },
        }),
      );
      trackTween(
        gsap.to(controls.target, {
          x: targetPoint.x,
          y: targetPoint.y,
          z: targetPoint.z,
          duration,
          ease: "power2.inOut",
          onComplete: resolve,
        }),
      );
    });
  }
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.zoom = Math.min(1, camera.aspect / 0.95);
    camera.updateProjectionMatrix();
    gateCamera.aspect = w / h;
    gateCamera.zoom = Math.min(1, gateCamera.aspect / 0.8);
    gateCamera.updateProjectionMatrix();
    target.setSize(
      Math.max(1, Math.floor(w * Math.min(devicePixelRatio, 1))),
      Math.max(1, Math.floor(h * Math.min(devicePixelRatio, 1))),
    );
    render();
  }
  function render() {
    if (phase === "gate" || phase === "entering") {
      renderer.setRenderTarget(target);
      renderer.render(factoryScene, camera);
      renderer.setRenderTarget(null);
      renderer.render(gateScene, gateCamera);
    } else {
      renderer.setRenderTarget(null);
      renderer.setScissorTest(false);
      renderer.setClearColor(factoryScene.background, 1);
      renderer.clear(true, true, true);
      renderer.render(factoryScene, camera);
    }
  }
  function animate(time) {
    if (!visible || document.hidden || tear <= 0) {
      frame = undefined;
      last = 0;
      return;
    }
    if (last && time - last < 40 && !reduced) {
      frame = requestAnimationFrame(animate);
      return;
    }
    const dt = last ? Math.min((time - last) / 1000, 0.08) : 0.016;
    last = time;
    clock += dt;
    if (!reduced) {
      rolls.forEach((roll, i) => {
        const p = (clock * 0.028 + i / rolls.length) % 1;
        roll.position.copy(track.getPointAt(p));
        roll.rotation.set(Math.PI / 3, 0, p * Math.PI * 24);
      });
      piston.position.y = 3.2 + Math.sin(clock * 2.5) * 0.25;
      reel.rotation.z = clock * 0.7;
      if (phase === "product") {
        product.rotation.z = Math.sin(clock * 0.3) * 0.05;
        product.rotation.y = Math.sin(clock * 0.4) * 0.15;
      }
    }
    if (particles) particles.material.uniforms.uTime.value = clock;
    controls.update();
    render();
    frame = undefined;
    if (!reduced) frame = requestAnimationFrame(animate);
  }
  function resume() {
    if (visible && !frame && !document.hidden && tear > 0)
      frame = requestAnimationFrame(animate);
  }
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      resume();
    },
    { rootMargin: "80px" },
  ).observe(host);
  new ResizeObserver(resize).observe(host);
  document.addEventListener("visibilitychange", resume);
  renderer.domElement.addEventListener("pointerdown", (e) => {
    dragStart = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (
      phase !== "world" ||
      !dragStart ||
      Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) > 8
    )
      return;
    const rect = host.getBoundingClientRect(),
      mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(stations, true)[0];
    if (hit) {
      let p = hit.object;
      while (p && p.userData.station === undefined) p = p.parent;
      if (p) hooks.station(p.userData.station);
    }
  });
  host.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    host.dataset.renderer = "fallback";
    renderer.domElement.style.display = "none";
    visible = false;
  });
  function update(next) {
    design = next;
    customMaterial.color.set(next.color);
    labelSign.material.map.dispose();
    labelSign.material.map = signTexture(
      next.label,
      "PRINTED FRESH",
      colors.cream,
      colors.ink,
    );
    updateRoll(product, next);
    if (particles) {
      const targets = particleTargets(
        particles.geometry.attributes.position.count,
        next,
      );
      particles.geometry.setAttribute(
        "aEnd",
        new THREE.BufferAttribute(targets.positions, 3),
      );
      particles.geometry.setAttribute(
        "aEndColor",
        new THREE.BufferAttribute(targets.colors, 3),
      );
    }
    render();
  }
  function reset() {
    tweens.forEach((t) => t.kill());
    tweens = [];
    phase = "gate";
    transition.entry = transition.burst = transition.assemble = 0;
    gateCamera.position.z = 9.4;
    gateCamera.position.y = 0;
    gateRoll.rotation.z = 0;
    camera.position.set(12, 10, 15);
    controls.target.set(0, 0.8, 0);
    controls.enabled = false;
    root.visible = true;
    root.traverse((o) => {
      if (o.isMesh) o.material.opacity = 1;
    });
    product.visible = false;
    if (particles) {
      factoryScene.remove(particles);
      particles.geometry.dispose();
      particles.material.dispose();
      particles = undefined;
    }
    camera.lookAt(controls.target);
    host.dataset.scene = "portal";
    render();
  }
  async function enter() {
    phase = "entering";
    host.dataset.scene = "entering";
    return new Promise((resolve) => {
      const complete = () => {
        phase = "world";
        host.dataset.scene = "factory";
        controls.enabled = !reduced;
        controls.update();
        render();
        resume();
        resolve();
      };
      if (reduced) {
        gateCamera.position.z = 0.52;
        gateCamera.position.y = 1.1;
        complete();
        return;
      }
      trackTween(
        gsap.to(transition, {
          entry: 1,
          duration: 2.25,
          ease: "power2.inOut",
          onUpdate: () => {
            gateCamera.position.z = THREE.MathUtils.lerp(
              7.8,
              0.52,
              transition.entry,
            );
            gateCamera.position.y = 1.1 * transition.entry;
            host.dataset.entry = transition.entry.toFixed(3);
            gateRoll.rotation.z = -transition.entry * 0.1;
            render();
          },
          onComplete: complete,
        }),
      );
    });
  }
  function focusStation(index) {
    if (phase !== "world") return;
    const point = new THREE.Vector3((index - 1) * 4.2, 1, 0);
    controls.enabled = false;
    tweenCamera(new THREE.Vector3(point.x + 5, 5.2, 8.2), point).then(() => {
      controls.enabled = !reduced;
      resume();
    });
  }
  async function burst() {
    phase = "particles";
    host.dataset.scene = "particles";
    controls.enabled = false;
    product.visible = false;
    createParticles();
    const duration = reduced ? 0 : 1.8;
    tweenCamera(
      new THREE.Vector3(0, 4.2, 15),
      new THREE.Vector3(0, 2, 0),
      duration,
    );
    root.visible = false;
    particles.visible = true;
    return new Promise((resolve) =>
      trackTween(
        gsap.to(transition, {
          burst: 1,
          duration,
          ease: "power2.out",
          onUpdate: () => {
            particles.material.uniforms.uBurst.value = transition.burst;
            render();
          },
          onComplete: () => {
            host.dataset.burst = "complete";
            resolve();
          },
        }),
      ),
    );
  }
  async function assemble() {
    phase = "assembling";
    host.dataset.scene = "assembling";
    return new Promise((resolve) =>
      trackTween(
        gsap.to(transition, {
          assemble: 1,
          duration: reduced ? 0 : 2.3,
          ease: "power3.inOut",
          onUpdate: () => {
            particles.material.uniforms.uAssemble.value = transition.assemble;
            render();
          },
          onComplete: () => {
            phase = "product";
            product.visible = true;
            product.position.set(0, 2, 0);
            product.rotation.set(-0.1, -0.15, 0);
            particles.visible = false;
            host.dataset.scene = "product";
            render();
            resume();
            resolve();
          },
        }),
      ),
    );
  }
  function createParticles() {
    if (particles) {
      factoryScene.remove(particles);
      particles.geometry.dispose();
      particles.material.dispose();
    }
    const count = innerWidth > 800 ? 9000 : 4200;
    const starts = new Float32Array(count * 3),
      startColors = new Float32Array(count * 3),
      seeds = new Float32Array(count * 3);
    const candidates = [];
    let total = 0;
    root.updateMatrixWorld(true);
    root.traverse((mesh) => {
      if (
        !mesh.isMesh ||
        mesh.name === "platform" ||
        mesh.geometry.type === "TubeGeometry"
      )
        return;
      mesh.geometry.computeBoundingSphere();
      const area = Math.max(0.05, mesh.geometry.boundingSphere.radius ** 2);
      total += area;
      candidates.push({
        mesh,
        sampler: new MeshSurfaceSampler(mesh).build(),
        end: total,
      });
    });
    const point = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const pick = Math.random() * total,
        item = candidates.find((c) => c.end >= pick);
      item.sampler.sample(point);
      item.mesh.localToWorld(point);
      starts.set(point.toArray(), i * 3);
      const color = item.mesh.material.color || new THREE.Color(colors.rose);
      startColors.set(color.toArray(), i * 3);
      seeds.set(
        [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1],
        i * 3,
      );
    }
    const targets = particleTargets(count, design);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(starts, 3));
    geometry.setAttribute(
      "aEnd",
      new THREE.BufferAttribute(targets.positions, 3),
    );
    geometry.setAttribute("aColor", new THREE.BufferAttribute(startColors, 3));
    geometry.setAttribute(
      "aEndColor",
      new THREE.BufferAttribute(targets.colors, 3),
    );
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uBurst: { value: 0 },
        uAssemble: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: innerWidth > 800 ? 3.4 : 4.3 },
      },
      vertexShader: `attribute vec3 aEnd;attribute vec3 aColor;attribute vec3 aEndColor;attribute vec3 aSeed;uniform float uBurst;uniform float uAssemble;uniform float uTime;uniform float uSize;varying vec3 vColor;void main(){vec3 scatter=position+aSeed*vec3(8.0,6.0,5.0)*uBurst;scatter+=vec3(sin(uTime*.7+aSeed.x*9.0),cos(uTime*.5+aSeed.y*8.0),sin(uTime*.6+aSeed.z*7.0))*.45*uBurst;vec3 p=mix(scatter,aEnd,uAssemble);vColor=mix(aColor,aEndColor,uAssemble);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(uSize*22.0/-mv.z,1.2,8.0);}`,
      fragmentShader: `varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vColor,1.0-smoothstep(.35,.5,d));}`,
      transparent: true,
      depthWrite: false,
    });
    particles = new THREE.Points(geometry, material);
    particles.frustumCulled = false;
    factoryScene.add(particles);
    host.dataset.particleCount = count;
  }
  reset();
  update(initial);
  resize();
  document.fonts.ready.then(() => update(design));
  return {
    setTear(value) {
      tear = value;
      render();
      resume();
    },
    enter,
    focusStation,
    burst,
    assemble,
    reset,
    update,
  };
}

function signTexture(top, bottom, bg, ink, ring = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = ring ? 1024 : 384;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  function line(text, y, size) {
    ctx.font = `${size}px Anton, Impact, sans-serif`;
    while (ctx.measureText(text).width > (ring ? 620 : 880) && size > 24) {
      size -= 2;
      ctx.font = `${size}px Anton, Impact, sans-serif`;
    }
    ctx.fillText(text, 512, y);
  }
  line(top, ring ? 165 : 130, ring ? 100 : 95);
  line(bottom, ring ? 855 : 280, ring ? 100 : 48);
  if (ring) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = ink;
    for (const radius of [470, 450, 290]) {
      ctx.beginPath();
      ctx.arc(512, 512, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.font = "700 22px Arial";
    ctx.fillText("THE OTHER SIDE IS WAITING.", 512, 910);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function makeRoll(design) {
  const group = new THREE.Group();
  group.userData.body = new THREE.Mesh(
    new THREE.TorusGeometry(1.7, 0.5, 24, 96),
    new THREE.MeshStandardMaterial({ color: design.color, roughness: 0.4 }),
  );
  group.add(group.userData.body);
  const label = new THREE.Mesh(
    new THREE.RingGeometry(1.18, 2.19, 96),
    new THREE.MeshBasicMaterial({
      map: signTexture(
        design.label,
        "MADE BY YOU",
        design.color,
        colors.ink,
        true,
      ),
      side: THREE.DoubleSide,
    }),
  );
  label.position.z = 0.515;
  group.add(label);
  group.userData.label = label;
  return group;
}
function updateRoll(group, design) {
  group.userData.body.material.color.set(design.color);
  const material = group.userData.label.material;
  material.map.dispose();
  material.map = signTexture(
    design.label,
    "MADE BY YOU",
    design.color,
    colors.ink,
    true,
  );
}
function particleTargets(count, design) {
  const positions = new Float32Array(count * 3),
    outColors = new Float32Array(count * 3),
    body = new THREE.Color(design.color),
    ink = new THREE.Color(colors.ink);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "46px Anton, Impact, sans-serif";
  let text = design.label || "MADE BY YOU";
  while (ctx.measureText(text).width > 380) {
    const size = parseInt(ctx.font) - 2;
    ctx.font = `${size}px Anton, Impact, sans-serif`;
  }
  ctx.fillText(text, 256, 94);
  ctx.font = "35px Anton, Impact, sans-serif";
  ctx.fillText("MADE BY YOU", 256, 447);
  const pixels = ctx.getImageData(0, 0, 512, 512).data,
    textPoints = [];
  for (let y = 0; y < 512; y += 2)
    for (let x = 0; x < 512; x += 2)
      if (pixels[(y * 512 + x) * 4 + 3] > 100) {
        const px = (x / 512 - 0.5) * 4.4,
          py = (0.5 - y / 512) * 4.4;
        if (Math.hypot(px, py) > 1.14 && Math.hypot(px, py) < 2.22)
          textPoints.push([px, py + 2, 0.46]);
      }
  for (let i = 0; i < count; i++) {
    if (i < count * 0.24 && textPoints.length) {
      positions.set(textPoints[i % textPoints.length], i * 3);
      outColors.set(ink.toArray(), i * 3);
    } else {
      const a = Math.random() * Math.PI * 2,
        b = Math.random() * Math.PI * 2,
        r = 1.7 + 0.5 * Math.cos(b);
      positions.set(
        [r * Math.cos(a), r * Math.sin(a) + 2, 0.5 * Math.sin(b)],
        i * 3,
      );
      outColors.set(body.toArray(), i * 3);
    }
  }
  return { positions, colors: outColors };
}
