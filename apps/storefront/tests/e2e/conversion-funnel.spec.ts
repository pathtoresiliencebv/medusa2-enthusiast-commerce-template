import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("lvro.nl-analytics-consent", "essential")
  })
})

test("quantity tier remains correct through cart and checkout", async ({
  page,
}, testInfo) => {
  const browserErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  page.on("pageerror", (error) => browserErrors.push(error.message))

  await page.goto("/nl/products/modular-linen-sofa")

  const addButton = page.getByTestId("add-product-button").first()
  await expect(addButton).toBeEnabled()
  await page.getByRole("button", { name: /2x.*5% voordeel/i }).first().click()
  await addButton.click()
  await expect(page.getByRole("status")).toContainText("5% voordeel")

  await page.goto("/nl/cart")
  await expect(page.getByText("5% hoeveelheidvoordeel toegepast")).toBeVisible()
  await expect(page.getByText("2", { exact: true }).first()).toBeVisible()
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-cart.png`,
    fullPage: true,
  })

  await page.getByRole("link", { name: /afrekenen/i }).first().click()
  await expect(page).toHaveURL(/\/nl\/checkout/)
  await expect(
    page.getByRole("heading", { name: "Bezorgadres", exact: true })
  ).toBeVisible()
  await expect(page.getByRole("combobox").first().locator("option")).toHaveCount(3)
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-checkout.png`,
    fullPage: true,
  })
  expect(browserErrors).toEqual([])
})
