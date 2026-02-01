import { test, expect } from '@playwright/test'

test.describe('User Scenarios', () => {

  test('Scenario 1: New worker signs up and browses jobs', async ({ page }) => {
    // Go to home
    await page.goto('/')
    await page.screenshot({ path: 'test-results/scenario1-home.png' })

    // Click Sign Up
    await page.locator('nav').getByRole('link', { name: 'Sign Up' }).click()
    await expect(page).toHaveURL('/register')
    await page.screenshot({ path: 'test-results/scenario1-register.png' })

    // Select Worker role
    await page.locator('button').filter({ hasText: '👷' }).click()

    // Fill registration form
    await page.locator('input[type="text"]').first().fill('Juan')
    await page.locator('input[type="text"]').nth(1).fill('Garcia')
    await page.getByPlaceholder('you@example.com').fill('juan.garcia@email.com')
    await page.getByPlaceholder('At least 8 characters').fill('SecurePass123!')
    await page.getByPlaceholder('Confirm your password').fill('SecurePass123!')
    await page.locator('input[type="checkbox"]').check()
    await page.screenshot({ path: 'test-results/scenario1-filled-form.png' })

    // Submit (will fail but we test the flow)
    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/scenario1-submitted.png' })

    // Browse jobs
    await page.goto('/jobs')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/scenario1-jobs.png' })
  })

  test('Scenario 2: Contractor signs up to post jobs', async ({ page }) => {
    await page.goto('/register')

    // Select Contractor role
    await page.locator('button').filter({ hasText: '🏢' }).click()
    await page.screenshot({ path: 'test-results/scenario2-contractor-selected.png' })

    // Fill form
    await page.locator('input[type="text"]').first().fill('Maria')
    await page.locator('input[type="text"]').nth(1).fill('Rodriguez')
    await page.getByPlaceholder('you@example.com').fill('maria@construction.com')
    await page.getByPlaceholder('At least 8 characters').fill('ContractorPass!')
    await page.getByPlaceholder('Confirm your password').fill('ContractorPass!')
    await page.locator('input[type="checkbox"]').check()
    await page.screenshot({ path: 'test-results/scenario2-contractor-form.png' })
  })

  test('Scenario 3: User tries wrong password', async ({ page }) => {
    await page.goto('/login')
    await page.screenshot({ path: 'test-results/scenario3-login-page.png' })

    // Enter wrong credentials
    await page.getByPlaceholder('you@example.com').fill('wrong@email.com')
    await page.getByPlaceholder('••••••••').fill('badpassword')
    await page.screenshot({ path: 'test-results/scenario3-wrong-creds.png' })

    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/scenario3-error.png' })
  })

  test('Scenario 4: User browses job categories from home', async ({ page }) => {
    await page.goto('/')
    await page.screenshot({ path: 'test-results/scenario4-home.png' })

    // Scroll to categories
    await page.getByText('Popular Categories').scrollIntoViewIfNeeded()
    await page.screenshot({ path: 'test-results/scenario4-categories.png' })

    // Click on Construction category
    await page.getByText('Construction').click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/scenario4-construction-jobs.png' })
  })

  test('Scenario 5: User searches and filters jobs', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/scenario5-jobs-initial.png' })

    // Use search
    await page.getByPlaceholder('Search jobs...').fill('plumbing')
    await page.screenshot({ path: 'test-results/scenario5-search.png' })

    // Select category filter
    await page.locator('select').first().selectOption({ index: 2 })
    await page.screenshot({ path: 'test-results/scenario5-filtered.png' })

    // Click Apply Filters
    await page.getByRole('button', { name: 'Apply Filters' }).click()
    await page.screenshot({ path: 'test-results/scenario5-applied.png' })
  })

  test('Scenario 6: User navigates entire app', async ({ page }) => {
    // Home
    await page.goto('/')
    await page.screenshot({ path: 'test-results/scenario6-1-home.png' })

    // Scroll down home page
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.screenshot({ path: 'test-results/scenario6-2-home-scroll.png' })

    // Jobs
    await page.locator('nav').getByRole('link', { name: 'Find Jobs' }).click()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/scenario6-3-jobs.png' })

    // Login
    await page.locator('nav').getByRole('link', { name: 'Login' }).click()
    await page.screenshot({ path: 'test-results/scenario6-4-login.png' })

    // Register
    await page.locator('nav').getByRole('link', { name: 'Sign Up' }).click()
    await page.screenshot({ path: 'test-results/scenario6-5-register.png' })

    // Back to home
    await page.getByRole('link', { name: 'Samaritan' }).click()
    await page.screenshot({ path: 'test-results/scenario6-6-back-home.png' })
  })

  test('Scenario 7: Password mismatch validation', async ({ page }) => {
    await page.goto('/register')

    await page.locator('input[type="text"]').first().fill('Test')
    await page.locator('input[type="text"]').nth(1).fill('User')
    await page.getByPlaceholder('you@example.com').fill('test@test.com')
    await page.getByPlaceholder('At least 8 characters').fill('password123')
    await page.getByPlaceholder('Confirm your password').fill('different456')
    await page.locator('input[type="checkbox"]').check()
    await page.screenshot({ path: 'test-results/scenario7-mismatch.png' })

    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'test-results/scenario7-error-shown.png' })

    // Verify error message
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('Scenario 8: Mobile viewport test', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.screenshot({ path: 'test-results/scenario8-mobile-home.png' })

    await page.goto('/jobs')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/scenario8-mobile-jobs.png' })

    await page.goto('/login')
    await page.screenshot({ path: 'test-results/scenario8-mobile-login.png' })

    await page.goto('/register')
    await page.screenshot({ path: 'test-results/scenario8-mobile-register.png' })
  })

  test('Scenario 9: Check all home page sections', async ({ page }) => {
    await page.goto('/')

    // Hero section
    await expect(page.getByText('Find Skilled Workers Near You')).toBeVisible()
    await page.screenshot({ path: 'test-results/scenario9-hero.png' })

    // Categories
    await page.getByText('Popular Categories').scrollIntoViewIfNeeded()
    await expect(page.getByText('General Labor')).toBeVisible()
    await expect(page.getByText('Plumbing')).toBeVisible()
    await expect(page.getByText('Electrical')).toBeVisible()
    await page.screenshot({ path: 'test-results/scenario9-categories.png' })

    // How it works
    await page.getByText('How It Works').scrollIntoViewIfNeeded()
    await expect(page.getByText('Post Your Job')).toBeVisible()
    await expect(page.getByText('Get Applications')).toBeVisible()
    await expect(page.getByText('Hire & Pay Securely')).toBeVisible()
    await page.screenshot({ path: 'test-results/scenario9-how-it-works.png' })

    // Stats
    await page.getByText('Active Workers').scrollIntoViewIfNeeded()
    await page.screenshot({ path: 'test-results/scenario9-stats.png' })

    // Footer
    await page.getByText('© 2024 Samaritan').scrollIntoViewIfNeeded()
    await page.screenshot({ path: 'test-results/scenario9-footer.png' })
  })

  test('Scenario 10: Job card interactions', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/scenario10-jobs-list.png' })

    // Check if jobs loaded
    const jobCards = page.locator('.bg-white.rounded-lg.shadow-sm.p-6')
    const count = await jobCards.count()

    if (count > 0) {
      // Hover first job
      await jobCards.first().hover()
      await page.screenshot({ path: 'test-results/scenario10-job-hover.png' })

      // Check Apply Now button
      const applyBtn = jobCards.first().getByRole('button', { name: 'Apply Now' })
      await expect(applyBtn).toBeVisible()
      await page.screenshot({ path: 'test-results/scenario10-apply-btn.png' })
    }
  })
})
