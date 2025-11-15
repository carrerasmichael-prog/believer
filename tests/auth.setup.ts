// tests/helpers/auth.ts   (or keep it as auth.setup.ts if you prefer)
import { expect, Page, Locator } from '@playwright/test';

/**
 * Signs up a new user and returns the username that was used.
 *
 * @param page      – Playwright page instance (injected by the test fixture)
 * @param username  – Name to use (defaults to "Test User")
 */
export async function signUp(page: Page, username: string = 'Test User'): Promise<string> {
  // -----------------------------------------------------------------
  // 1. Go to the home page
  // -----------------------------------------------------------------
  await page.goto('/');

  // -----------------------------------------------------------------
  // 2. Click the first visible "Sign up" button with class .signup-btn
  // -----------------------------------------------------------------
  const signUpButtons: Locator = page.locator('.signup-btn');
  const visibleButton: Locator = signUpButtons
    .filter({ hasText: 'Sign up' })
    .first();

  await visibleButton.waitFor({ state: 'visible', timeout: 10_000 });
  await visibleButton.click();

  // -----------------------------------------------------------------
  // 3. Dialog appears → fill name → click “Go”
  // -----------------------------------------------------------------
  await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();

  const nameInput: Locator = page.getByPlaceholder("What's your name?");
  await nameInput.fill(username);

  const goButton: Locator = page.getByRole('button', { name: 'Go' });
  await goButton.click();

  // -----------------------------------------------------------------
  // 4. Wait for the dialog to disappear and the main UI to load
  // -----------------------------------------------------------------
  await expect(page.getByRole('heading', { name: 'Sign up' })).not.toBeVisible();
  await expect(
    page.locator('#main-content').getByTestId('new-post-button')
  ).toBeVisible();

  // -----------------------------------------------------------------
  // 5. Verify the username shows up in the sidebar
  // -----------------------------------------------------------------
  await expect(
    page.getByTestId('sidebar-user-row').getByText(username)
  ).toBeVisible();

  return username;
}
