import { test, expect } from "@playwright/test";
const url = "/t015/";
async function open(page) {
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  const skip = page.getByRole("button", { name: "SKIP INTRO" });
  if (await skip.isVisible()) await skip.click();
  await expect(page.locator("body")).toHaveClass(/intro-finished/);
}
async function scrub(page, progress) {
  await page.evaluate((p) => {
    const el = document.querySelector(".collection");
    const top = el.getBoundingClientRect().top + scrollY;
    const distance =
      el.offsetHeight - el.querySelector(".journey-viewport").offsetHeight;
    scrollTo({ top: top + distance * p, behavior: "instant" });
  }, progress);
  await expect
    .poll(async () =>
      Number(await page.locator(".collection").getAttribute("data-progress")),
    )
    .toBeCloseTo(progress, 2);
}
test("navigation, product details, sound, family selector and responsive layout", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await expect(
    page.getByRole("heading", { name: "Stick by you", exact: true }),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
  await page.screenshot({ path: `/tmp/revised-hero-${info.project.name}.png` });
  await page.locator(".menu-pull").click();
  await expect(page.locator(".menu-pull")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.locator('#menu a[href="#collection"]').click();
  await expect(page.locator(".menu-pull")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await scrub(page, 0.13);
  const product = page.locator(".create .pack.first");
  await expect(product).toBeInViewport();
  await product.click();
  await expect(page.locator("dialog")).toBeVisible();
  await expect(page.locator(".dialog-copy h2")).toContainText("MASKING");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Enable sound" }).click();
  await expect(page.locator(".sound")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Disable sound" }).click();
  await expect(page.locator(".sound")).toHaveAttribute("aria-pressed", "false");
  await page
    .locator(".spotlight")
    .evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "center" }),
    );
  await page.getByRole("button", { name: "Show CLOTH TAPE" }).click();
  await expect(page.locator(".spotlight-product strong")).toContainText(
    "CLOTH",
  );
  await expect(page.locator(".explore-button")).toHaveAttribute(
    "data-product",
    "cloth",
  );
  expect(errors).toEqual([]);
});
test("scroll drives a reversible horizontal and diagonal camera", async ({
  page,
}, info) => {
  await open(page);
  const section = page.locator(".collection");
  const samples = [
    { p: 0.13, name: "create" },
    { p: 0.35, name: "down-right" },
    { p: 0.49, name: "fix" },
    { p: 0.66, name: "up-right" },
    { p: 0.83, name: "protect" },
  ];
  let previousX = -1;
  for (const sample of samples) {
    await scrub(page, sample.p);
    const x = Number(await section.getAttribute("data-camera-x"));
    expect(x).toBeGreaterThan(previousX);
    previousX = x;
    await expect(page.locator(".journey-viewport")).toHaveCSS(
      "position",
      "sticky",
    );
    await expect
      .poll(() =>
        page
          .locator(".journey-viewport")
          .evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
      )
      .toBeLessThan(2);
    if (sample.name === "fix")
      expect(
        Number(await section.getAttribute("data-camera-y")),
      ).toBeGreaterThan(100);
    await page.screenshot({
      path: `/tmp/revised-${sample.name}-${info.project.name}.png`,
    });
  }
  await scrub(page, 0.13);
  expect(Number(await section.getAttribute("data-camera-y"))).toBeLessThan(1);
  await expect(section.locator(".chapter-label")).toHaveText("01 — TO CREATE");
});
test("footer packs animate, and dragging does not open a dialog", async ({
  page,
}, info) => {
  await open(page);
  await page
    .locator("footer")
    .evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "start" }),
    );
  await expect(page.locator(".footer-playground")).toHaveAttribute(
    "data-motion",
    "running",
  );
  const pack = page.locator(".physics-pack").first();
  await expect(pack).toHaveCSS("position", "absolute");
  await expect(page.locator(".footer-playground")).toHaveCSS(
    "position",
    "absolute",
  );
  const initial = await pack.getAttribute("style");
  await expect.poll(() => pack.getAttribute("style")).not.toBe(initial);
  await page.screenshot({
    path: `/tmp/revised-footer-${info.project.name}.png`,
  });
  if (info.project.name === "desktop") {
    const box = await pack.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 100,
      box.y + box.height / 2 - 80,
      { steps: 8 },
    );
    await page.mouse.up();
    await expect(page.locator("dialog")).not.toBeVisible();
  }
});
test("reduced motion skips the intro and keeps all scenes in the document flow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await expect(page.locator(".opening")).toHaveCount(0);
  await expect(page.locator(".collection")).toHaveAttribute(
    "data-motion",
    "reduced",
  );
  await expect(page.locator(".journey-viewport")).toHaveCSS(
    "position",
    "relative",
  );
  await expect(page.locator(".journey-world")).toHaveCSS("transform", "none");
  await expect(page.locator(".footer-playground")).toHaveAttribute(
    "data-motion",
    "reduced",
  );
  for (const name of [".create", ".fix", ".move"]) {
    const scene = page.locator(name);
    await scene.evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
    await expect(scene.getByRole("heading")).toBeInViewport();
  }
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
test("opening runs its curved wipe and completes without user input", async ({
  page,
}) => {
  await page.goto(url);
  await expect(page.locator("body")).toHaveClass(/intro-playing/);
  await expect(page.locator(".opening-band")).toHaveCount(6);
  await expect(page.locator(".opening")).toHaveCSS("position", "fixed");
  await expect(page.locator(".opening-cover")).toHaveCSS(
    "position",
    "absolute",
  );
  await expect(page.locator(".opening")).toHaveJSProperty(
    "clientHeight",
    await page.evaluate(() => innerHeight),
  );
  const first = page.locator(".opening-band").first();
  const initial = await first.evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() => first.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(initial);
  await expect(page.locator("body")).toHaveClass(/intro-finished/, {
    timeout: 8000,
  });
  await expect(page.locator(".opening")).toHaveCount(0);
  await expect(page.locator(".hero-word .letter").first()).toHaveCSS(
    "opacity",
    "1",
  );
});
