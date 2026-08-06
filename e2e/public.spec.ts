import { test, expect } from "./helpers";

const PUBLIC_PAGES: { path: string; heading: RegExp }[] = [
  { path: "/", heading: /GESOD RIDES|Vehicle/i },
  { path: "/about", heading: /Who We Are|About/i },
  { path: "/how-it-works", heading: /How It Works/i },
  { path: "/track", heading: /VIN Status Tracking/i },
  { path: "/quote", heading: /Request a Quote/i },
  { path: "/listings", heading: /Listings|Auction/i },
  { path: "/schedule", heading: /Sailing/i },
  { path: "/contact", heading: /Contact/i },
  { path: "/login", heading: /Sign in|Welcome/i },
];

for (const { path, heading } of PUBLIC_PAGES) {
  test(`public page loads: ${path}`, async ({ page, consoleErrors }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1, h2").filter({ hasText: heading }).first()).toBeVisible();
    expect(consoleErrors, `console errors on ${path}: ${consoleErrors.join(" | ")}`).toEqual([]);
  });
}

test("unknown routes render the branded 404 page", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.getByText("Page not found.")).toBeVisible();
  await page.getByRole("button", { name: /Return Home/i }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("VIN tracker validates input and masks the VIN", async ({ page }) => {
  await page.goto("/track");

  await page.getByRole("button", { name: /Track Vehicle/i }).click();
  await expect(page.getByText("VIN is required.")).toBeVisible();

  await page.getByPlaceholder(/ENTER VIN/i).fill("1HGB");
  await page.getByRole("button", { name: /Track Vehicle/i }).click();
  await expect(page.getByText(/full 17-character VIN/i)).toBeVisible();
});

test("quote flow reaches the ocean freight form", async ({ page }) => {
  await page.goto("/quote");
  await page.getByText(/Ocean Freight/i).first().click();
  await page.getByRole("button", { name: /Continue/i }).click();
  await expect(page.getByRole("button", { name: /Submit Quote Request/i })).toBeVisible();
});
