import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear()
    localStorage.setItem("lvro.nl-analytics-consent", "essential")
  })
  await page.route("**/api/support/config", (route) =>
    route.fulfill({ json: { enabled: true, mode: "canary", authenticated: false } })
  )
  await page.route("**/api/support/conversations", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 201, json: { conversation: { id: "conversation-test", status: "active" } } })
    } else await route.continue()
  })
  await page.route("**/api/support/conversations/conversation-test", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 202, json: { task: { id: "task-test" } } })
    } else {
      await route.fulfill({ json: { conversation: { id: "conversation-test", messages: [] } } })
    }
  })
  await page.route("**/api/support/conversations/conversation-test/tasks/task-test", (route) =>
    route.fulfill({
      json: {
        task: { state: "success" },
        messages: [
          { id: "u1", role: "user", content: "Waar is mijn bestelling?" },
          { id: "a1", role: "assistant", content: "Log in om je eigen bestelling veilig te bekijken. [LOGIN_REQUIRED]" },
        ],
      },
    })
  )
  await page.route("**/api/support/cases", (route) =>
    route.fulfill({ status: 201, json: { case: { id: "case_test_123", status: "open" } } })
  )
})

test("guest order question is login-gated and keyboard accessible", async ({ page }) => {
  await page.goto("/nl")
  const launcher = page.getByRole("button", { name: "Open LVRO klantenservicechat" })
  await expect(launcher).toBeVisible()
  await launcher.click()
  await expect(page.getByRole("dialog", { name: /waar kunnen we mee helpen/i })).toBeVisible()
  await page.getByLabel("Typ je vraag").fill("Waar is mijn bestelling?")
  await page.getByRole("button", { name: "Verstuur bericht" }).click()
  await expect(page.getByRole("link", { name: /log in om bestellingen/i })).toBeVisible()
  await expect(page.getByRole("log", { name: "Chatgeschiedenis" })).not.toContainText("[LOGIN_REQUIRED]")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toBeHidden()
})

test("human handoff uses an explicit two-step confirmation", async ({ page }) => {
  await page.goto("/nl")
  await page.getByRole("button", { name: "Open LVRO klantenservicechat" }).click()
  await page.getByRole("button", { name: "Medewerker", exact: true }).click()
  await page.getByLabel("Onderwerp").fill("Vraag over levering")
  await page.getByLabel("Toelichting").fill("Ik wil graag dat een medewerker dit bekijkt.")
  await page.getByRole("button", { name: "Controleer aanvraag" }).click()
  await expect(page.getByText("Controleer en bevestig")).toBeVisible()
  await page.getByRole("button", { name: "Definitief indienen" }).click()
  await expect(page.getByText(/case case_test_123/i)).toBeVisible()
})

test("mobile chat occupies the viewport and exposes screen-reader labels", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "mobile-only viewport assertion")
  await page.goto("/nl")
  await page.getByRole("button", { name: "Open LVRO klantenservicechat" }).click()
  const dialog = page.getByRole("dialog")
  const box = await dialog.boundingBox()
  expect(box?.width).toBeGreaterThanOrEqual(389)
  expect(box?.height).toBeGreaterThanOrEqual(843)
  await expect(page.getByRole("button", { name: "Sluit chat" })).toBeVisible()
  await expect(page.getByLabel("Typ je vraag")).toBeVisible()
})
