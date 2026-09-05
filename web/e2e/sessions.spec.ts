import { test, expect } from "@playwright/test";
import { login } from "./helpers";

// A user dedicated to this spec: it logs in twice (two "devices"), and Fortify
// throttles login at 5/min per email — sharing the e2e user would tip it over
// the limit when the whole suite runs.
const USER = { email: "sessions@example.com", password: "password" };

test("a user can see their sessions and log out other devices", async ({
    page,
    browser,
}) => {
    // 1. Create a second session for the same user from an isolated context
    //    (a different "device"); keep it around so its session row stays live.
    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    await login(otherPage, USER.email, USER.password);
    await otherContext.close();

    // 2. Log in on the primary device and open the password-gated security page.
    await login(page, USER.email, USER.password);
    await page.goto("/settings/security");
    await page.locator("#require-password").fill(USER.password);
    await page.getByRole("button", { name: "Confirm password" }).click();

    // 3. The list shows this device plus the other session.
    const list = page.getByTestId("sessions-list");
    await expect(list.getByText("This device")).toBeVisible();
    await expect(list.getByText(/Last active/).first()).toBeVisible();

    // 4. Log out every other session (password-confirmed dialog).
    await page.getByTestId("logout-other-sessions-button").click();
    await page.locator("#sessions_password").fill(USER.password);
    await page.getByTestId("confirm-logout-other-sessions-button").click();

    // 5. Only the current device remains and the bulk action disables itself.
    await expect(list.getByText(/Last active/)).toHaveCount(0);
    await expect(list.getByText("This device")).toBeVisible();
    await expect(
        page.getByTestId("logout-other-sessions-button"),
    ).toBeDisabled();
});

test("the login page shows a toast after an expired-session redirect", async ({
    page,
}) => {
    // A revoked/expired session redirects to /login?expired=1; the page surfaces
    // a toast and strips the flag from the URL.
    await page.goto("/login?expired=1");
    await expect(
        page.getByText("Your session has expired. Please log in again."),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
});
