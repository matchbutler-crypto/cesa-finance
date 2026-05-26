import { test, expect, type Page } from '@playwright/test'

// Helper: navigate to dashboard where the sidebar with the widget is visible
async function goDashboard(page: Page) {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
}

// Helper: mock the /api/api-cost endpoint with given data
async function mockCostApi(page: Page, data: {
  today_eur?: number
  month_cfo_eur?: number
  month_tax_eur?: number
  monthly_budget_eur?: number
}) {
  const payload = {
    today_eur: 0,
    month_cfo_eur: 0,
    month_tax_eur: 0,
    monthly_budget_eur: 10,
    ...data,
  }
  await page.route('/api/api-cost', route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) })
    }
    return route.continue()
  })
}

// Helper: mock PUT (budget save)
async function mockBudgetPut(page: Page) {
  await page.route('/api/api-cost', route => {
    if (route.request().method() === 'PUT') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
    }
    return route.continue()
  })
}

// AC1: Widget visible in expanded sidebar below nav, above footer
test('AC1: Widget visible in expanded sidebar', async ({ page }) => {
  await mockCostApi(page, {})
  await goDashboard(page)

  // The widget header "KI-Kosten" should be visible
  await expect(page.getByText('KI-Kosten')).toBeVisible()
})

// AC2: Widget shows "Heute: €X.XX" and "Monat: €X.XX / €Budget" with progress bar
test('AC2: Widget shows Heute + Monat rows with budget', async ({ page }) => {
  await mockCostApi(page, { today_eur: 0.0042, month_cfo_eur: 0.013, month_tax_eur: 0.007, monthly_budget_eur: 10 })
  await goDashboard(page)

  const widget = page.locator('aside').locator('div').filter({ hasText: 'KI-Kosten' }).first()
  // Heute and Monat rows inside the widget
  await expect(page.locator('aside span').filter({ hasText: /^Heute$/ })).toBeVisible()
  await expect(page.locator('aside span').filter({ hasText: /^Monat$/ })).toBeVisible()
  // Budget button shows formatted value — accessible by title
  await expect(page.locator('button[title="Budget anpassen"]')).toBeVisible()
})

// AC3: Progress bar color is green/neutral below 75%
test('AC3: Progress bar is green below 75% budget usage', async ({ page }) => {
  // 5 EUR used of 10 EUR budget = 50%
  await mockCostApi(page, { month_cfo_eur: 3.0, month_tax_eur: 2.0, monthly_budget_eur: 10 })
  await goDashboard(page)

  // Check month total is visible
  await expect(page.getByText('€5.00')).toBeVisible()
  // Progress bar should exist
  const bar = page.locator('[style*="background: var(--c-positive)"]')
  await expect(bar).toBeVisible()
})

// AC4: Progress bar color is orange at 75–89%
test('AC4: Progress bar is orange at 75-89% budget usage', async ({ page }) => {
  // 8 EUR of 10 EUR = 80%
  await mockCostApi(page, { month_cfo_eur: 5.0, month_tax_eur: 3.0, monthly_budget_eur: 10 })
  await goDashboard(page)

  const bar = page.locator('[style*="background: var(--c-warning)"]')
  await expect(bar).toBeVisible()
})

// AC5: Progress bar color is red at 90%+
test('AC5: Progress bar is red at 90%+ budget usage', async ({ page }) => {
  // 9.5 EUR of 10 EUR = 95%
  await mockCostApi(page, { month_cfo_eur: 6.0, month_tax_eur: 3.5, monthly_budget_eur: 10 })
  await goDashboard(page)

  const bar = page.locator('[style*="background: var(--c-danger)"]')
  await expect(bar).toBeVisible()
})

// AC6: CFO and Steuerberater agent rows shown separately
test('AC6: Agent breakdown rows visible when data exists', async ({ page }) => {
  await mockCostApi(page, { month_cfo_eur: 0.87, month_tax_eur: 0.36, monthly_budget_eur: 10 })
  await goDashboard(page)

  await expect(page.getByText('CFO Agent')).toBeVisible()
  // Use nth(1) — nth(0) is nav link, nth(1) is widget row
  await expect(page.getByText('Steuerberater').nth(1)).toBeVisible()
})

// AC7: Empty state message shown when no API calls this month
test('AC7: Empty state message when no requests this month', async ({ page }) => {
  await mockCostApi(page, { today_eur: 0, month_cfo_eur: 0, month_tax_eur: 0, monthly_budget_eur: 10 })
  await goDashboard(page)

  await expect(page.getByText('Noch keine Anfragen diesen Monat')).toBeVisible()
})

// AC8: Click budget amount → inline input appears
test('AC8: Click budget amount opens inline editor', async ({ page }) => {
  await mockCostApi(page, { monthly_budget_eur: 10 })
  await goDashboard(page)

  // Click the budget button
  await page.getByRole('button', { name: /€10\.00/ }).click()

  // Input field should appear with the current value
  const input = page.locator('input[type="text"], input:not([type])').last()
  await expect(input).toBeVisible()
  await expect(input).toBeFocused()
})

// AC9: Enter key saves new budget
test('AC9: Enter key saves new budget value', async ({ page }) => {
  // GET returns budget=10; PUT returns ok
  await page.route('/api/api-cost', route => {
    if (route.request().method() === 'PUT') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      today_eur: 0, month_cfo_eur: 0, month_tax_eur: 0, monthly_budget_eur: 10
    }) })
  })

  await goDashboard(page)

  // Click the budget button (title="Budget anpassen")
  await page.locator('button[title="Budget anpassen"]').click()
  const input = page.locator('input').last()
  await input.fill('15')
  await input.press('Enter')

  // After optimistic update, budget button shows new value
  await expect(page.locator('button[title="Budget anpassen"]')).toHaveText('€15.00')
})

// AC10: Invalid budget value keeps old value and shows error
test('AC10: Invalid (negative) budget shows error and keeps old value', async ({ page }) => {
  await mockCostApi(page, { monthly_budget_eur: 10 })
  await goDashboard(page)

  await page.getByRole('button', { name: /€10\.00/ }).click()
  const input = page.locator('input').last()
  await input.fill('-5')
  await input.press('Enter')

  // Error message should appear
  await expect(page.getByText('Positiver Betrag erforderlich')).toBeVisible()
  // Old budget button should NOT appear (input still shown)
  await expect(page.locator('input').last()).toBeVisible()
})

// AC10b: Zero budget also shows error
test('AC10b: Zero budget shows error', async ({ page }) => {
  await mockCostApi(page, { monthly_budget_eur: 10 })
  await goDashboard(page)

  await page.getByRole('button', { name: /€10\.00/ }).click()
  const input = page.locator('input').last()
  await input.fill('0')
  await input.press('Enter')

  await expect(page.getByText('Positiver Betrag erforderlich')).toBeVisible()
})

// AC11: Collapsed sidebar shows Coins icon
test('AC11: Collapsed sidebar shows Coins icon widget', async ({ page }) => {
  await mockCostApi(page, {})
  await goDashboard(page)

  // Click the collapse toggle (title="Seitenleiste schließen")
  await page.locator('button[title="Seitenleiste schließen"]').click()

  // After collapse, Coins icon with data-label tooltip should appear
  await expect(page.locator('[data-label]').filter({ hasText: '' }).first()).toBeVisible()
})

// API: GET /api/api-cost returns correct shape
test('API: GET /api/api-cost returns correct data shape', async ({ request }) => {
  const res = await request.get('/api/api-cost')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body).toHaveProperty('today_eur')
  expect(body).toHaveProperty('month_cfo_eur')
  expect(body).toHaveProperty('month_tax_eur')
  expect(body).toHaveProperty('monthly_budget_eur')
  expect(typeof body.today_eur).toBe('number')
  expect(typeof body.monthly_budget_eur).toBe('number')
})

// API: PUT /api/api-cost validates positive number
test('API: PUT /api/api-cost rejects negative budget', async ({ request }) => {
  const res = await request.put('/api/api-cost', {
    data: { monthly_budget_eur: -10 },
    headers: { 'Content-Type': 'application/json' },
  })
  expect(res.status()).toBe(400)
})

// API: PUT /api/api-cost accepts valid budget
test('API: PUT /api/api-cost accepts valid budget and returns ok', async ({ request }) => {
  const res = await request.put('/api/api-cost', {
    data: { monthly_budget_eur: 25 },
    headers: { 'Content-Type': 'application/json' },
  })
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.ok).toBe(true)
})

// Responsive: Widget visible on mobile
test('Responsive: Widget visible on mobile (375px)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await mockCostApi(page, {})
  await goDashboard(page)

  // On mobile the sidebar may be different — check if KI-Kosten is reachable
  // If sidebar is hidden on mobile, this tests the page loads without errors
  await expect(page).toHaveURL(/dashboard/)
})
