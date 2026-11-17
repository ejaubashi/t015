# Sweet Tape — interactive concept

A responsive landing page inspired by the two supplied Sweet Tape screen recordings. Built with HTML, CSS, vanilla JavaScript, and Vite. Fonts are bundled locally. Product packs, paper textures, and collage artwork are recreated with CSS/SVG; no original website assets are required.

## Run

Node.js 22.12+ or 24+ is required.

```sh
npm ci --cache /tmp/t015-npm-cache
npm run dev
```

The development server listens on all interfaces, port 5173 by default.

```sh
npm run build
npm run preview
```

The production output is in `dist/` and can be hosted as a static website.

## Checks

```sh
npm test
```

Playwright tests run desktop (1440px) and mobile (390px) checks for navigation, product dialogs, sound controls, overflow, and browser errors. The included config uses `/usr/bin/chromium`; adjust `executablePath` for your own machine or install Playwright Chromium and remove that override.

## Features and editing

- Pull-tab navigation and anchor links
- Scroll parallax, animated ticker, reveal effects, and reduced-motion support
- Interactive product packs with accessible native modal dialogs
- Optional synthesized sound confirmation (no audio downloads)
- Product content and page markup: `src/main.js`
- Visual design and responsive rules: `src/style.css`

This is a visual concept, not an official Sweet Tape website. The `hello@sweettape.example` contact address is a placeholder; replace it before using the site publicly. No backend, checkout, analytics, or contact delivery service is connected.

## GitHub Pages

The site is configured for https://ejaubashi.github.io/t015/.
In repository Settings → Pages, select **GitHub Actions** as the build source.
Pushes to `main` then build and deploy through `.github/workflows/deploy.yml`.
The Vite base path is `/t015/`; development is served at that path too.
