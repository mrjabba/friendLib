import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('homepage loads without crashing', async ({ page }) => {
    await page.goto('/')
    // Page should load - body should be visible
    await expect(page.locator('body')).toBeVisible()
  })

  test('sign-in page loads', async ({ page }) => {
    await page.goto('/sign-in')
    // Should load without error
    await expect(page.locator('body')).toBeVisible()
  })

  test('book search page loads', async ({ page }) => {
    await page.goto('/actions/book-search')
    // Should load without error (may redirect if not signed in, but shouldn't crash)
    await expect(page.locator('body')).toBeVisible()
  })

  test('can navigate to book search via URL', async ({ page }) => {
    await page.goto('/actions/book-search')
    // Give time for any redirects
    await page.waitForLoadState('networkidle')

    // Page should be visible (either the form or redirected content)
    await expect(page.locator('body')).toBeVisible()
  })
})
