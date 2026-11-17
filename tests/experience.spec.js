import { test, expect } from "@playwright/test";
async function open(page, reduced = true) {
  if (reduced) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/t015/");
  const skip = page.getByRole("button", { name: "SKIP INTRO" });
  if (await skip.isVisible()) await skip.click();
  await expect(page.locator("body")).toHaveClass(/intro-finished/);
}
async function go(page, selector) {
  await page
    .locator(selector)
    .evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "center" }),
    );
}

test("custom design synchronizes, persists, and renders an actual 3D mesh", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await go(page, ".studio");
  await page.getByRole("button", { name: "rose tape", exact: true }).click();
  await page.locator("#tape-label").fill("HELLO SUNSHINE");
  await page.getByRole("button", { name: "HIGH GLOSS" }).click();
  await expect(page.locator(".studio")).toHaveAttribute(
    "data-design-color",
    "rose",
  );
  await expect(page.locator(".custom-pack-label")).toHaveText("HELLO SUNSHINE");
  await expect(page.locator(".studio-roll")).toHaveAttribute(
    "data-renderer",
    "webgl",
    { timeout: 20000 },
  );
  await expect(page.locator(".studio-roll")).toHaveAttribute(
    "data-label",
    "HELLO SUNSHINE",
  );
  await expect(page.locator(".studio-roll canvas")).toBeVisible();
  const view = page.locator(".studio-roll");
  await view.evaluate((el) =>
    el.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  const box = await view.boundingBox();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.55, {
    steps: 6,
  });
  await page.mouse.up();
  await expect(view).toHaveAttribute("data-turned", /.+/);
  await page.screenshot({ path: `/tmp/sweet-lab-${info.project.name}.png` });
  await page.reload();
  await expect(page.locator("#tape-label")).toHaveValue("HELLO SUNSHINE");
  await expect(page.locator("[data-tape-color=rose]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("[data-finish=gloss]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(errors).toEqual([]);
});

test("tape joins photos, group movement respects the glue, peeling and undo restore state", async ({
  page,
}, info) => {
  await open(page);
  await go(page, ".play-lab");
  await page.getByRole("button", { name: "+ ADD STRIP" }).click();
  const board = page.locator(".tape-board");
  await expect(board).toHaveAttribute("data-strip-count", "1");
  await expect(board).toHaveAttribute("data-connections", "1");
  const first = page.locator('[data-photo="0"]'),
    second = page.locator('[data-photo="1"]');
  const before = await second.evaluate((el) => el.style.left);
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => second.evaluate((el) => el.style.left))
    .not.toBe(before);
  await page.locator("[data-tool=peel]").click();
  await page.getByRole("button", { name: "Peel tape strip 1" }).click();
  await expect(board).toHaveAttribute("data-strip-count", "0");
  await page.getByRole("button", { name: "UNDO" }).click();
  await expect(board).toHaveAttribute("data-strip-count", "1");
  await expect(board).toHaveAttribute("data-connections", "1");
  await page.getByRole("button", { name: "RESET", exact: true }).click();
  await expect(board).toHaveAttribute("data-strip-count", "0");
  await page.getByRole("button", { name: "UNDO" }).click();
  await expect(board).toHaveAttribute("data-strip-count", "1");
  await page.screenshot({ path: `/tmp/sweet-play-${info.project.name}.png` });
});

test("pointer drawing lays tape in the chosen colour and label", async ({
  page,
}) => {
  await open(page);
  await go(page, ".studio");
  await page.getByRole("button", { name: "orange tape", exact: true }).click();
  await page.locator("#tape-label").fill("STAY SWEET");
  await go(page, ".tape-board");
  const board = page.locator(".tape-board"),
    box = await board.boundingBox();
  await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.8);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.75, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(board).toHaveAttribute("data-strip-count", "1");
  await expect(page.locator(".tape-strip>span")).toContainText("STAY SWEET");
  await expect(page.locator(".tape-strip")).toHaveCSS(
    "background-color",
    "rgb(255, 136, 46)",
  );
});

test("menu stretches on drag and opens once, ribbon grows with scroll, and custom roll lands", async ({
  page,
}) => {
  await open(page, false);
  const pull = page.locator(".menu-pull"),
    box = await pull.boundingBox();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width * 0.5,
    box.y + box.height * 0.5 + 90,
    { steps: 6 },
  );
  await expect
    .poll(() =>
      pull.evaluate((el) =>
        parseFloat(el.style.getPropertyValue("--pull-distance")),
      ),
    )
    .toBeGreaterThan(30);
  await page.mouse.up();
  await expect(pull).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(pull).toHaveAttribute("aria-expanded", "false");
  const ribbon = page.locator(".continuous-tape"),
    initial = Number(await ribbon.getAttribute("data-drawn"));
  await go(page, ".studio");
  await expect
    .poll(async () => Number(await ribbon.getAttribute("data-drawn")))
    .toBeGreaterThan(initial);
  await page.locator("#tape-label").fill("ROLL WITH ME");
  await page.getByRole("button", { name: "LET IT ROLL" }).click();
  await expect(page.locator(".custom-pack")).toHaveClass(/landed/, {
    timeout: 15000,
  });
  await expect(page.locator(".custom-pack-label")).toHaveText("ROLL WITH ME");
  await expect(page.locator(".custom-pack")).toBeInViewport({ timeout: 15000 });
  await expect(page.locator(".footer-playground")).toHaveAttribute(
    "data-motion",
    "running",
  );
});

test("WebGL unavailable still leaves an editable, working preview", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type.startsWith("webgl")) return null;
      return original.call(this, type, ...args);
    };
  });
  await open(page);
  await go(page, ".studio");
  await expect(page.locator(".studio-roll")).toHaveAttribute(
    "data-renderer",
    "fallback",
    { timeout: 15000 },
  );
  await page.locator("#tape-label").fill("NO LIMITS");
  await expect(page.locator(".studio-roll .fallback-label")).toHaveText(
    "NO LIMITS",
  );
  await page.getByRole("button", { name: "Spin the 3D tape roll" }).click();
  await expect(page.locator(".studio-roll")).toHaveAttribute(
    "data-turned",
    "fallback-spin",
  );
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
