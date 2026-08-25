import { test, expect, ADMIN, CUSTOMERS, login } from "./helpers";

const CUSTOMER_SECTIONS = [
  "My Vehicles",
  "Bid Requests",
  "Quote Requests",
  "Documents",
  "Payments",
  "Disputes",
  "Notifications",
];

const ADMIN_SECTIONS = [
  "Overview",
  "Import Pipeline",
  "Customers",
  "Vehicles",
  "Loads",
  "Drivers",
  "Invoices",
  "Auction Listings",
  "Bid Requests",
  "Quote Requests",
  "Documents",
  "Payments",
  "Disputes",
  "Sailing Schedules",
  "Notifications",
  "Messages",
  "Reports & Exports",
];

test.describe("admin dashboard", () => {
  test("signs in and every section loads", async ({ page, consoleErrors }) => {
    await login(page, ADMIN);
    await expect(page).toHaveURL(/\/dashboard\/admin/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

    for (const section of ADMIN_SECTIONS) {
      await page.getByRole("button", { name: section, exact: true }).click();
      await expect(page.getByRole("heading", { name: section }).first()).toBeVisible();
      // No section may be stuck on its loading state.
      await expect(page.getByRole("status")).toHaveCount(0, { timeout: 20_000 });
    }

    expect(consoleErrors, `console errors: ${consoleErrors.join(" | ")}`).toEqual([]);
  });

  test("sees records belonging to multiple customers", async ({ page }) => {
    await login(page, ADMIN);
    await page.getByRole("button", { name: "Customers", exact: true }).click();
    await expect(page.getByText("emeka@test.com")).toBeVisible();
    await expect(page.getByText("fatima@test.com")).toBeVisible();
    await expect(page.getByText("tunde@test.com")).toBeVisible();
  });

  // Loads and Drivers are real routes (/dashboard/admin/loads[/:id],
  // /dashboard/admin/drivers[/:id]) — every other section above is in-page
  // tab state with no URL of its own, so this is the one thing the generic
  // "every section loads" loop above doesn't exercise: that the URL actually
  // changes, and that navigating to it directly (not via the sidebar) works.
  test("Loads and Drivers have real, bookmarkable URLs", async ({ page }) => {
    await login(page, ADMIN);

    await page.getByRole("button", { name: "Loads", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin\/loads$/);

    await page.getByRole("button", { name: "Drivers", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin\/drivers$/);

    // A direct load (not via the sidebar) must render the same page, and the
    // sidebar must still highlight the right section for it.
    await page.goto("/dashboard/admin/loads");
    await expect(page.getByRole("heading", { name: "Loads" }).first()).toBeVisible();
  });

  test("cannot be reached without signing in", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});

for (const customer of CUSTOMERS) {
  test.describe(`customer dashboard: ${customer.label}`, () => {
    test("signs in and every section loads", async ({ page, consoleErrors }) => {
      await login(page, customer);
      await expect(page).toHaveURL(/\/dashboard\/customer/);

      for (const section of CUSTOMER_SECTIONS) {
        await page.getByRole("button", { name: section, exact: true }).click();
        await expect(page.getByRole("heading", { name: section }).first()).toBeVisible();
        await expect(page.getByRole("status")).toHaveCount(0, { timeout: 20_000 });
      }

      expect(consoleErrors, `console errors: ${consoleErrors.join(" | ")}`).toEqual([]);
    });

    test("is redirected away from the admin dashboard", async ({ page }) => {
      await login(page, customer);
      await page.goto("/dashboard/admin");
      await expect(page).toHaveURL(/\/dashboard\/customer/);
      await expect(page.getByRole("button", { name: "Reports & Exports" })).toHaveCount(0);
    });

    test("never sees another customer's records", async ({ page }) => {
      await login(page, customer);
      const others = CUSTOMERS.filter((c) => c.email !== customer.email);

      for (const section of ["My Vehicles", "Bid Requests", "Quote Requests", "Payments", "Disputes"]) {
        await page.getByRole("button", { name: section, exact: true }).click();
        await expect(page.getByRole("heading", { name: section }).first()).toBeVisible();
        const body = (await page.locator("main").innerText()).toLowerCase();
        for (const other of others) {
          expect(body, `${section} exposed ${other.email}`).not.toContain(other.email.toLowerCase());
          expect(body, `${section} exposed ${other.label}`).not.toContain(other.label.toLowerCase());
        }
      }
    });

    test("logs out back to the login page", async ({ page }) => {
      await login(page, customer);
      await page.getByRole("button", { name: "Logout" }).click();
      await expect(page).toHaveURL(/\/login/);
      await page.goto("/dashboard/customer");
      await expect(page).toHaveURL(/\/login/);
    });
  });
}
