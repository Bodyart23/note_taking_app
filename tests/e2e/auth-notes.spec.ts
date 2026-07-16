import { test, expect, type Locator, type Page } from "@playwright/test";

async function signUpAndLogin(
  request: import("@playwright/test").APIRequestContext,
  context: import("@playwright/test").BrowserContext,
  email: string,
  password: string,
) {
  const signUp = await request.post("/api/auth/sign-up", {
    data: { email, password },
  });
  expect(signUp.status()).toBe(201);

  const csrfResponse = await request.get("/api/auth/csrf");
  expect(csrfResponse.ok()).toBeTruthy();
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };

  const loginResponse = await request.post("/api/auth/callback/credentials", {
    form: {
      csrfToken,
      email,
      password,
      callbackUrl: "http://127.0.0.1:3001/",
      json: "true",
    },
  });
  expect(loginResponse.ok()).toBeTruthy();

  const { cookies } = await request.storageState();
  await context.addCookies(cookies);
}

/** Desktop and mobile layouts both mount in the DOM; scope to lg grid. */
function desktopLayout(page: Page): Locator {
  return page.locator("div.hidden.lg\\:grid").first();
}

test.describe("auth + notes e2e smoke", () => {
  test.use({
    viewport: { width: 1280, height: 720 },
  });

  test.setTimeout(120_000);

  test("sign up, create, archive, and filter by tag in Archived Notes", async ({
    page,
    context,
    request,
  }) => {
    await context.clearCookies();

    const email = `e2e_${Date.now()}@example.com`;
    const password = "Password123!";

    await signUpAndLogin(request, context, email, password);

    const desktop = desktopLayout(page);

    await page.goto("/", { waitUntil: "load" });
    await page.getByTestId("notes-app-ready").waitFor({ timeout: 30_000 });
    await expect(desktop.getByRole("heading", { name: /All Notes/i })).toBeVisible();

    await desktop.getByRole("button", { name: /Create New Note/i }).click();
    await expect(desktop.getByPlaceholder("Enter a title...")).toBeVisible();

    const noteTitle = "E2E Note";
    const noteContent = "This note was created in Playwright.";

    await desktop.getByPlaceholder("Enter a title...").fill(noteTitle);
    await desktop
      .getByPlaceholder("Start typing your note here...")
      .fill(noteContent);
    await desktop
      .getByPlaceholder(/Add tags separated by commas/i)
      .fill("E2E");

    await desktop.getByRole("button", { name: "Save Note" }).click();
    await expect(desktop.getByText(noteTitle)).toBeVisible();

    await desktop.getByRole("button", { name: "Archive Note" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Archive Note" }).click();

    await desktop.locator("aside").getByRole("button", { name: "Archived Notes" }).click();
    await desktop.locator("aside").getByRole("button", { name: "E2E" }).click();

    await expect(
      desktop.getByRole("heading", { name: /Archived Notes Tagged: E2E/i }),
    ).toBeVisible();
    await expect(desktop.getByText(noteTitle)).toBeVisible();
  });
});
