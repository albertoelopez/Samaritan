import { test, expect } from '@playwright/test'

test.describe('Full App Navigation', () => {
  test('should have all main navigation links', async ({ page }) => {
    await page.goto('/')

    // Check main nav links
    await expect(page.locator('nav').getByText('Samaritan')).toBeVisible()
    await expect(page.locator('nav').getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.locator('nav').getByRole('link', { name: 'Find Jobs' })).toBeVisible()
    await expect(page.locator('nav').getByRole('link', { name: 'Map' })).toBeVisible()
    await page.screenshot({ path: 'test-results/nav-links.png' })
  })

  test('should navigate to Map page', async ({ page }) => {
    await page.goto('/')

    await page.locator('nav').getByRole('link', { name: 'Map' }).click()
    await expect(page).toHaveURL('/map')
    await page.screenshot({ path: 'test-results/nav-to-map.png' })
  })

  test('should navigate from Home to Jobs', async ({ page }) => {
    // Start at home
    await page.goto('/')
    await page.screenshot({ path: 'test-results/nav-flow-1-home.png' })

    // Go to Jobs
    await page.locator('nav').getByRole('link', { name: 'Find Jobs' }).click()
    await expect(page).toHaveURL('/jobs')
    await page.screenshot({ path: 'test-results/nav-flow-2-jobs.png' })

    // Back to Home
    await page.locator('nav').getByRole('link', { name: 'Home' }).click()
    await expect(page).toHaveURL('/')
    await page.screenshot({ path: 'test-results/nav-flow-3-back-home.png' })
  })

  test('should show auth links when logged out', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('nav').getByRole('link', { name: 'Login' })).toBeVisible()
    await expect(page.locator('nav').getByRole('link', { name: 'Sign Up' })).toBeVisible()
  })

  test('should navigate through job listing', async ({ page }) => {
    // Go to jobs
    await page.goto('/jobs')
    await page.waitForTimeout(2000)

    // Check that jobs page loaded (heading says "Available Jobs")
    await expect(page.getByRole('heading', { name: 'Available Jobs' })).toBeVisible()

    // Click on a job if available
    const jobCards = page.locator('a.block.bg-white.rounded-lg')
    const count = await jobCards.count()

    if (count > 0) {
      await jobCards.first().click()
      await expect(page).toHaveURL(/\/jobs\//)
      await page.screenshot({ path: 'test-results/nav-job-detail.png' })
    }
  })

  test('should have consistent header across standard pages', async ({ page }) => {
    // Test pages that use the standard nav layout
    const pages = ['/', '/jobs', '/login', '/register']

    for (const pagePath of pages) {
      await page.goto(pagePath)
      await expect(page.locator('nav').getByText('Samaritan')).toBeVisible()
    }
  })

  test('should have footer on standard pages', async ({ page }) => {
    const pages = ['/', '/jobs', '/login', '/register']

    for (const pagePath of pages) {
      await page.goto(pagePath)
      await expect(page.getByText('© 2024 Samaritan')).toBeVisible()
    }
  })
})
