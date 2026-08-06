import { test as base, expect, type Page } from "@playwright/test";
import { ADMIN, CUSTOMERS, type QaAccount } from "../src/test/qaAccounts";

export { ADMIN, CUSTOMERS, expect };
export type { QaAccount };

/** Signs in through the real login form and waits for the dashboard to render. */
export async function login(page: Page, account: QaAccount) {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(account.email);
  await page.getByPlaceholder("••••••••").first().fill(account.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(`**${account.dashboard}`, { timeout: 30_000 });
}

export async function logout(page: Page) {
  await page.evaluate(() => window.localStorage.clear());
}

/** Collects console errors, ignoring React dev-only ref warnings. */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (text.includes("Function components cannot be given refs")) return;
      errors.push(text);
    });
    await use(errors);
  },
});
