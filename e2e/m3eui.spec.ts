import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

function trackRuntimeErrors(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  return { pageErrors, consoleErrors };
}

test.describe("m3eui real-browser E2E & accessibility", () => {
  test("home page toggles real CSS light-dark() color modes and RTL ar-SA locale", async ({
    page,
  }) => {
    const { pageErrors, consoleErrors } = trackRuntimeErrors(page);
    await page.goto("/");

    const surfaceVar = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--m3e-color-surface")
        .trim(),
    );
    expect(surfaceVar.length).toBeGreaterThan(0);

    const beforeScheme = await page.evaluate(() => ({
      scheme: document.documentElement.style.colorScheme || "light",
      bg: getComputedStyle(document.body).backgroundColor,
    }));

    await page.locator(".docs-colormode-btn").click();
    await expect
      .poll(() =>
        page.evaluate(() => getComputedStyle(document.body).backgroundColor),
      )
      .not.toBe(beforeScheme.bg);

    await page.locator(".docs-locale-btn").click();
    await page.getByRole("menuitemcheckbox", { name: /العربية/i }).click();
    await expect
      .poll(() =>
        page.evaluate(() => ({
          dir: document.documentElement.dir,
          lang: document.documentElement.lang,
        })),
      )
      .toEqual({ dir: "rtl", lang: "ar-SA" });

    // Open Theme Studio sheet and verify seed controls mount and close cleanly
    await page.locator(".docs-studio-btn").click();
    const sheetDialog = page.locator('[role="dialog"]').last();
    await expect(sheetDialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheetDialog).toBeHidden();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test("interactive Button WAAPI ripple, Dialog escape, Tabs selection, DataTable sort, and DragHandle keyboard resize", async ({
    page,
  }) => {
    const { pageErrors, consoleErrors } = trackRuntimeErrors(page);

    // 1. Button WAAPI ripple in real Chromium
    await page.goto("/components/button");
    const filledBtn = page.locator("main .m3e-button").first();
    await expect(filledBtn).toBeVisible();
    await filledBtn.click();

    // 2. Dialog open + focus + Escape close
    await page.goto("/components/dialog");
    const openDialogBtn = page.getByRole("button", { name: "Open form dialog" });
    await openDialogBtn.click();
    const dialog = page.getByRole("dialog", { name: "Create theme workspace" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // 3. Tabs switch & active panel update
    await page.goto("/components/tabs");
    const motionTab = page.getByRole("tab", { name: "Motion Physics" });
    await motionTab.click();
    await expect(motionTab).toHaveAttribute("aria-selected", "true");

    // 4. DataTable column sorting
    await page.goto("/components/data-table");
    const sortHeaderBtn = page
      .locator(".m3e-data-table-shell thead th button")
      .first();
    const headerCell = page.locator(".m3e-data-table-shell thead th").first();
    const beforeSort = await headerCell.getAttribute("aria-sort");
    await sortHeaderBtn.click();
    const afterSort = await headerCell.getAttribute("aria-sort");
    expect(afterSort).toBeTruthy();
    expect(afterSort).not.toBe(beforeSort);

    // 5. Blocks DragHandle keyboard resize
    await page.goto("/blocks");
    const dragHandle = page.locator('.m3e-drag-handle[role="separator"]').first();
    await dragHandle.scrollIntoViewIfNeeded();
    await expect(dragHandle).toBeVisible();
    const beforeNow = Number(await dragHandle.getAttribute("aria-valuenow"));
    await dragHandle.focus();
    await page.keyboard.press("ArrowRight");
    const afterNow = Number(await dragHandle.getAttribute("aria-valuenow"));
    expect(afterNow).toBeGreaterThan(beforeNow);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  for (const route of [
    "/",
    "/docs/theming",
    "/components/button",
    "/components/dialog",
    "/components/tabs",
    "/components/data-table",
    "/blocks",
  ]) {
    test(`axe-core WCAG 2.1 AA audit has zero critical/serious violations on ${route}`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        blocking,
        `Critical/serious axe violations on ${route}:\n${JSON.stringify(blocking, null, 2)}`,
      ).toEqual([]);
    });
  }
});
