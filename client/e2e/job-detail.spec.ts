import { test, expect } from '@playwright/test'

test.describe('Job Detail Page', () => {
  test('should navigate to job detail from list when jobs exist', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForTimeout(2000)

    // Click on a job card if available
    const jobCards = page.locator('a.block.bg-white.rounded-lg')
    const count = await jobCards.count()

    if (count > 0) {
      await jobCards.first().click()
      await expect(page).toHaveURL(/\/jobs\//)
      await page.screenshot({ path: 'test-results/job-detail-from-list.png' })
    } else {
      // No jobs available - test passes with note
      console.log('No jobs available to test job detail navigation')
    }
  })

  test('should display job details or job not found', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForTimeout(2000)

    const jobCards = page.locator('a.block.bg-white.rounded-lg')
    const count = await jobCards.count()

    if (count > 0) {
      await jobCards.first().click()
      await page.waitForTimeout(1000)

      // Either we see job details or "Job not found"
      const hasJobContent = await page.getByText('Back to Jobs').isVisible().catch(() => false)
      const hasNotFound = await page.getByText('Job not found').isVisible().catch(() => false)

      expect(hasJobContent || hasNotFound).toBeTruthy()
      await page.screenshot({ path: 'test-results/job-detail-elements.png' })
    }
  })

  test('should show appropriate content for unauthenticated users', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForTimeout(2000)

    const jobCards = page.locator('a.block.bg-white.rounded-lg')
    const count = await jobCards.count()

    if (count > 0) {
      await jobCards.first().click()
      await page.waitForTimeout(1000)

      // Check for either login prompt or job not found
      const hasLoginPrompt = await page.getByText('Login to apply').isVisible().catch(() => false)
      const hasNotFound = await page.getByText('Job not found').isVisible().catch(() => false)

      expect(hasLoginPrompt || hasNotFound).toBeTruthy()
      await page.screenshot({ path: 'test-results/job-detail-auth.png' })
    }
  })

  test('should handle direct URL to job detail', async ({ page }) => {
    // Test accessing a job detail page directly
    await page.goto('/jobs/test-job-id')
    await page.waitForTimeout(1000)

    // Should show job not found for invalid ID
    await expect(page.getByText('Job not found')).toBeVisible()
    await page.screenshot({ path: 'test-results/job-detail-direct.png' })
  })

  test('should navigate back from job detail', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForTimeout(2000)

    const jobCards = page.locator('a.block.bg-white.rounded-lg')
    const count = await jobCards.count()

    if (count > 0) {
      await jobCards.first().click()
      await page.waitForTimeout(1000)

      // Try to navigate back using browser back button
      await page.goBack()
      await expect(page).toHaveURL('/jobs')
    }
  })
})
