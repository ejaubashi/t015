# Sweet Tape — scroll-driven recreation

A responsive recreation based on the two supplied screen recordings. Built with Vite, HTML/CSS, GSAP, and Matter.js. Fonts are bundled locally. The lifestyle cards and paper texture use stills extracted from the supplied recordings; product packs and other collage objects use CSS.

## Run

Node.js 22.12+ or 24+ is required.

```sh
npm ci --cache /tmp/t015-npm-cache
npm run dev
```

Open the development server at `/t015/` (port 5173 by default).

```sh
npm run build
npm run preview
```

Production files are generated in `dist/` for static hosting.

## Motion from the references

- Centred logo opening followed by six curved, staggered colour wipes.
- Individual letters assemble into the hero, manifesto, contact, and footer headings.
- A layered 3D tape roll rotates as the hero passes into the paper collage.
- Collage objects move at different speeds, with a curved SVG text ribbon.
- An orange product-family scene supports switching between four products.
- The collection pins to the viewport. Vertical scrolling drives a reversible horizontal camera: create → down-right transition → fix → up-right transition → protect. Product packs rotate independently.
- Footer tape packs and circles bounce and collide using Matter.js; drag and release them to throw them.
- Reduced-motion preference removes the intro and physics, and displays the entire product collection in normal vertical flow.

## Checks

```sh
npm test
```

Playwright automatically starts or reuses the development server. The tests cover desktop (1440px) and mobile (390px) navigation, product dialogs, sound controls, family switching, overflow, forward/reverse horizontal and diagonal camera movement, footer motion and desktop dragging, reduced motion, and the complete opening sequence.

System Chromium is used when available at `/usr/bin/chromium`; elsewhere install Playwright's browser with `npx playwright install chromium`.

## Editing

- `src/main.js`: page markup and interactions.
- `src/catalog.js`: product content and pack markup.
- `src/motion.js`: opening timeline, scroll effects, camera route, and footer physics.
- `src/style.css`: design, responsive rules, and reduced-motion layout.
- `public/reference/`: compressed stills extracted from the user's recordings.

This is a visual recreation, not the original website's source code. Some imagery and timing remain approximations. The contact address `hello@sweettape.example` is a placeholder. No backend, checkout, analytics, or contact delivery service is connected.

## GitHub Pages

Target URL: https://ejaubashi.github.io/t015/.

Repository Settings → Pages must use **GitHub Actions** as the build source. Pushes to `main` build and deploy through `.github/workflows/deploy.yml`. The Vite base path is `/t015/`.

## Experimental Sweet Lab experience

The current version adds:

- A continuous SVG tape ribbon that unrolls with page scroll and carries the selected colour into the sideways collection.
- Procedural Three.js tape-roll meshes with a hollow core, printed faces, layered tape material, environment lighting, pointer rotation, and satin/gloss finishes. The renderer is loaded near a visible roll after the opening finishes and stops drawing offscreen. A CSS preview remains usable without WebGL.
- A live customizer at `#studio`: rose/yellow/orange, an 18-character label, finish, and spin control. The design is stored locally on the same browser/device and appears on the ribbon, new playground strips, 3D previews, and footer roll.
- A collage playground at `#play`: draw tape, join photos, move joined groups, peel individual strips, undo, and reset. The Add Strip control and photo arrow-key controls provide keyboard alternatives to drawing/dragging.
- A stretchable pull-tab menu and curled/lifted photo hover treatment.
- A final scroll sequence that delivers the custom roll into the existing physics footer. The **Let It Roll** button takes the design through this sequence; wheel/touch input can interrupt the automatic travel.

New implementation files: `src/experience.js`, `src/experience.css`, `src/roll3d.js`, and `src/playground.js`. New tests are in `tests/experience.spec.js` and cover 3D rendering, design persistence, drawing, connected-photo movement, peeling/undo, stretched navigation, ribbon progress, footer handoff, and the WebGL fallback on desktop and mobile.

Reduced-motion mode removes automatic camera/physics effects while retaining intentional editing and pointer actions. The playground is local to the current page; only the roll design persists across reloads.

### Rollback point

The version immediately before these experiments is preserved by Git tag **`before-experimental-experience`**, at commit **`de15b2c`** (the rose/yellow/orange version). Reverting the experimental feature commit restores that version without rewriting Git history. The tag remains available for comparison or restoration.

## The Other Side: factory experiment

The **The Other Side** menu link opens `#factory`, after the customizer. The complete journey is:

1. **Tear:** drag the tab, use the keyboard-accessible slider, or choose Tear It Open. The two fibrous paper panels fold and separate.
2. **Enter:** a screen-space portal material shows the live factory through a tape-roll aperture. Moving the gate camera through the aperture transitions seamlessly into the same factory scene.
3. **Explore:** drag to orbit, click a machine, or use the three HTML station controls. The colour press changes the shared tape design, the label room edits the existing customizer label, and dispatch starts the finale. The procedural model includes three machines, a moving conveyor, circulating tape rolls, signs, parcels, lights, and stylised trees.
4. **Become:** a GPU vertex shader scatters samples from the factory's actual mesh surfaces, then interpolates them to a tape roll and sampled label lettering. A solid printed roll completes the transformation. There are 9,000 particles on desktop and 4,200 on small screens.

The geometry, sign textures, paper panels, and particle targets are generated by this project. No scanned scene, external model, or video is required. The implementation uses the existing Three.js and GSAP dependencies; it does not add React, Drei, or WebGPU requirements.

`src/factory.js` manages the accessible page flow and shared design state. `src/factory-world.js` contains the lazy-loaded renderer, portal, procedural scene, camera controls, and particle shader. `src/factory.css` contains the paper and interface styling. `tests/factory.spec.js` exercises drag/keyboard tearing, entry, shared customisation, particle assembly, replay, and the no-WebGL path on desktop and mobile.

Reduced motion removes automatic transition durations. Without WebGL, the paper interaction, illustrated factory, editing controls, and personalised result remain available. The normal renderer pauses offscreen and is created only after the user begins opening the paper.

### Latest rollback point

The exact Sweet Lab version before this factory experiment is preserved as **`before-impossible-factory`**, commit **`6a9b5e6`**. This is the rollback point requested for this experiment. The older `before-experimental-experience` tag remains available too.
