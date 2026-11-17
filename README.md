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
