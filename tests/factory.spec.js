import { test, expect } from "@playwright/test";
async function open(page, reduced = true) {
  if (reduced) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/t015/");
  await page.evaluate(() => document.fonts.ready);
  const skip = page.getByRole("button", { name: "SKIP INTRO" });
  if (await skip.isVisible()) await skip.click();
  await expect(page.locator("body")).toHaveClass(/intro-finished/);
  await page
    .locator("#factory")
    .evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "start" }),
    );
}
async function enter(page) {
  await page.locator(".tear-open").click();
  await expect(page.locator(".factory-stage")).toHaveAttribute(
    "data-phase",
    "portal",
    { timeout: 15000 },
  );
  await page.locator(".portal-enter").click();
  await expect(page.locator(".factory-stage")).toHaveAttribute(
    "data-phase",
    "world",
    { timeout: 15000 },
  );
}

test("paper tears by dragging or keyboard, and the portal resets cleanly", async ({
  page,
}, info) => {
  await open(page);
  const stage = page.locator(".factory-stage"),
    handle = page.locator(".tear-handle");
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 70, {
    steps: 5,
  });
  await page.mouse.up();
  await expect
    .poll(async () => Number(await stage.getAttribute("data-tear")))
    .toBeGreaterThan(0.1);
  await page.locator("#tear-progress").focus();
  await page.keyboard.press("End");
  await expect(stage).toHaveAttribute("data-phase", "portal");
  await expect(page.locator(".paper-cover")).toHaveAttribute("inert", "");
  await expect(page.locator(".factory-viewport")).toHaveAttribute(
    "data-renderer",
    "webgl",
    { timeout: 15000 },
  );
  await page.screenshot({
    path: `/tmp/impossible-portal-${info.project.name}.png`,
  });
  await page.locator(".factory-reset").click();
  await expect(stage).toHaveAttribute("data-phase", "paper");
  await expect(page.locator("#tear-progress")).toHaveValue("0");
  await expect(page.locator(".tear-open")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});

test("enter the live factory, customise its production line, and assemble a personalised roll", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await open(page, false);
  await enter(page);
  const stage = page.locator(".factory-stage"),
    viewport = page.locator(".factory-viewport");
  await expect(viewport).toHaveAttribute("data-renderer", "webgl");
  await expect(viewport).toHaveAttribute("data-scene", "factory");
  await page.screenshot({
    path: `/tmp/impossible-world-${info.project.name}.png`,
  });
  await page.locator('[data-factory-color="orange"]').click();
  await expect(page.locator('[data-tape-color="orange"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator('[data-station="1"]').click();
  await expect(stage).toHaveAttribute("data-station", "1");
  await page.locator("#factory-label").fill("WILD IDEAS");
  await expect(page.locator("#tape-label")).toHaveValue("WILD IDEAS");
  await page.locator('[data-station="2"]').click();
  await page.locator(".factory-dispatch").click();
  await expect(stage).toHaveAttribute("data-phase", "particles");
  await expect(stage).toHaveAttribute("data-burst", "complete", {
    timeout: 15000,
  });
  expect(
    Number(await viewport.getAttribute("data-particle-count")),
  ).toBeGreaterThanOrEqual(4000);
  await page.screenshot({
    path: `/tmp/impossible-particles-${info.project.name}.png`,
  });
  await page.locator(".particle-assemble").click();
  await expect(stage).toHaveAttribute("data-phase", "product", {
    timeout: 15000,
  });
  await expect(viewport).toHaveAttribute("data-scene", "product");
  await expect(page.locator(".factory-result-label")).toHaveText("WILD IDEAS");
  await page.screenshot({
    path: `/tmp/impossible-product-${info.project.name}.png`,
  });
  await page.locator(".factory-replay").click();
  await expect(stage).toHaveAttribute("data-phase", "paper");
  await expect(viewport).toHaveAttribute("data-scene", "portal");
  expect(errors).toEqual([]);
});

test("reduced motion and no WebGL retain the complete journey and editing controls", async ({
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
  await enter(page);
  await expect(page.locator(".factory-viewport")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await page.locator('[data-station="1"]').click();
  await page.locator("#factory-label").fill("STAY CURIOUS");
  await page.locator('[data-station="2"]').click();
  await page.locator(".factory-dispatch").click();
  await expect(page.locator(".particle-assemble")).toBeEnabled();
  await page.locator(".particle-assemble").click();
  await expect(page.locator(".factory-stage")).toHaveAttribute(
    "data-phase",
    "product",
  );
  await expect(page.locator(".factory-result-label")).toHaveText(
    "STAY CURIOUS",
  );
  await expect(page.locator(".fallback-product")).toBeVisible();
  await page.locator(".factory-reset").click();
  await expect(page.locator(".factory-stage")).toHaveAttribute(
    "data-phase",
    "paper",
  );
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
