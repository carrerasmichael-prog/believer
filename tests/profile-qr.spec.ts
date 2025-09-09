import {test, expect} from "@playwright/test"
import {signUp} from "./auth.setup"

test("can open QR code on own profile", async ({page}) => {
  // Login first
  await signUp(page)

  // Click on user avatar in sidebar to go to own profile
  await page.getByTestId("sidebar-user-row").locator("img").first().click()

  // Click QR code button in profile header (specifically in the profile header actions)
  await page
    .getByTestId("profile-header-actions")
    .getByRole("button", {name: "Show QR Code"})
    .click()

  await expect(page.getByRole("img", {name: "Public Key QR Code"})).toBeVisible({
    timeout: 10000,
  })

  // Check that the npub value is visible (it's truncated in the display)
  // Use the first match since there might be multiple (one for copy, one for lightning)
  const qrData = page.getByText(/npub.*\.\.\./).first()
  await expect(qrData).toBeVisible({timeout: 10000})
})
