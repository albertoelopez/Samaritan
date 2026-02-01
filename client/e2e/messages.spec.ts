import { test, expect } from '@playwright/test'

test.describe('Messages Page', () => {
  test('should show login prompt when not authenticated', async ({ page }) => {
    await page.goto('/messages')

    // Should show login prompt
    await expect(page.getByText('Please')).toBeVisible()
    await page.screenshot({ path: 'test-results/messages-login-prompt.png' })
  })

  test('should not show messages link in nav when logged out', async ({ page }) => {
    await page.goto('/')

    // Messages link should not be visible when logged out
    const navMessages = page.locator('nav').getByRole('link', { name: 'Messages' })
    await expect(navMessages).not.toBeVisible()
  })

  test('should have login link in messages page content', async ({ page }) => {
    await page.goto('/messages')

    // Check for login link in the main content area (lowercase 'login')
    await expect(page.getByRole('link', { name: 'login', exact: true })).toBeVisible()
    await page.screenshot({ path: 'test-results/messages-login-link.png' })
  })

  test('should show login prompt box for unauthenticated users', async ({ page }) => {
    await page.goto('/messages')

    // When not authenticated, shows login prompt box
    await expect(page.getByText('Please')).toBeVisible()
    await expect(page.getByText('to view messages')).toBeVisible()
    await page.screenshot({ path: 'test-results/messages-unauthenticated.png' })
  })
})
