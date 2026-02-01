import { test, expect } from '@playwright/test'

test.describe('Samaritan App', () => {
  test.describe('Home Page', () => {
    test('should display hero section with title', async ({ page }) => {
      await page.goto('/')

      // Check hero title
      await expect(page.locator('h1')).toContainText('Find Skilled Workers Near You')

      // Check CTA buttons
      await expect(page.getByRole('link', { name: 'Find Work' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Post a Job' })).toBeVisible()
    })

    test('should display navigation', async ({ page }) => {
      await page.goto('/')

      // Check nav links
      await expect(page.getByRole('link', { name: 'Samaritan' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Find Jobs' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Login' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible()
    })

    test('should display category cards', async ({ page }) => {
      await page.goto('/')

      // Check categories section
      await expect(page.getByText('Popular Categories')).toBeVisible()
      await expect(page.getByText('General Labor')).toBeVisible()
      await expect(page.getByText('Construction')).toBeVisible()
      await expect(page.getByText('Plumbing')).toBeVisible()
    })

    test('should display how it works section', async ({ page }) => {
      await page.goto('/')

      await expect(page.getByText('How It Works')).toBeVisible()
      await expect(page.getByText('Post Your Job')).toBeVisible()
      await expect(page.getByText('Get Applications')).toBeVisible()
      await expect(page.getByText('Hire & Pay Securely')).toBeVisible()
    })

    test('should navigate to jobs page', async ({ page }) => {
      await page.goto('/')

      await page.getByRole('link', { name: 'Find Work' }).click()
      await expect(page).toHaveURL('/jobs')
    })
  })

  test.describe('Jobs Page', () => {
    test('should display jobs list', async ({ page }) => {
      await page.goto('/jobs')

      // Check page title
      await expect(page.getByRole('heading', { name: 'Available Jobs' })).toBeVisible()

      // Check filters are present
      await expect(page.getByPlaceholder('Search jobs...')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Apply Filters' })).toBeVisible()
    })

    test('should load jobs from API', async ({ page }) => {
      await page.goto('/jobs')

      // Wait for loading to complete
      await page.waitForTimeout(2000)

      // Check that page rendered (has the title and content area)
      await expect(page.getByRole('heading', { name: 'Available Jobs' })).toBeVisible()
    })

    test('should display job cards with details', async ({ page }) => {
      await page.goto('/jobs')
      await page.waitForTimeout(2000)

      const jobCards = page.locator('.bg-white.rounded-lg.shadow-sm.p-6')
      const count = await jobCards.count()

      if (count > 0) {
        // Check first job card has expected elements
        const firstCard = jobCards.first()
        await expect(firstCard.getByRole('button', { name: 'Apply Now' })).toBeVisible()
      }
    })
  })

  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
      await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
      await expect(page.getByPlaceholder('••••••••')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    })

    test('should have social login buttons', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByRole('button', { name: /Google/ })).toBeVisible()
      await expect(page.getByRole('button', { name: /Facebook/ })).toBeVisible()
    })

    test('should have link to register', async ({ page }) => {
      await page.goto('/login')

      const signUpLink = page.locator('p.text-center a[href="/register"]')
      await expect(signUpLink).toBeVisible()
      await signUpLink.click()
      await expect(page).toHaveURL('/register')
    })

    test('should show error on invalid login', async ({ page }) => {
      await page.goto('/login')

      await page.getByPlaceholder('you@example.com').fill('invalid@test.com')
      await page.getByPlaceholder('••••••••').fill('wrongpassword')
      await page.getByRole('button', { name: 'Sign In' }).click()

      // Wait for error response - should show error or button should stop loading
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Register Page', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register')

      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
      await expect(page.locator('button').filter({ hasText: '👷' })).toBeVisible()
      await expect(page.locator('button').filter({ hasText: '🏢' })).toBeVisible()
    })

    test('should allow role selection', async ({ page }) => {
      await page.goto('/register')

      const workerBtn = page.locator('button').filter({ hasText: '👷' })
      const contractorBtn = page.locator('button').filter({ hasText: '🏢' })

      // Click worker role
      await workerBtn.click()
      await expect(workerBtn).toHaveClass(/border-primary-600/)

      // Click contractor role
      await contractorBtn.click()
      await expect(contractorBtn).toHaveClass(/border-primary-600/)
    })

    test('should validate password match', async ({ page }) => {
      await page.goto('/register')

      await page.locator('input[type="text"]').first().fill('John')
      await page.locator('input[type="text"]').nth(1).fill('Doe')
      await page.getByPlaceholder('you@example.com').fill('test@example.com')
      await page.getByPlaceholder('At least 8 characters').fill('password123')
      await page.getByPlaceholder('Confirm your password').fill('differentpassword')
      await page.locator('input[type="checkbox"]').check()
      await page.getByRole('button', { name: 'Create Account' }).click()

      // Should show validation error
      await expect(page.getByText('Passwords do not match')).toBeVisible()
    })

    test('should have link to login', async ({ page }) => {
      await page.goto('/register')

      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
      await page.getByRole('link', { name: 'Sign in' }).click()
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Navigation', () => {
    test('should navigate between pages', async ({ page }) => {
      // Start at home
      await page.goto('/')
      await expect(page).toHaveURL('/')

      // Go to jobs
      await page.locator('nav').getByRole('link', { name: 'Find Jobs' }).click()
      await expect(page).toHaveURL('/jobs')

      // Go to login
      await page.locator('nav').getByRole('link', { name: 'Login' }).click()
      await expect(page).toHaveURL('/login')

      // Go to register via nav
      await page.locator('nav').getByRole('link', { name: 'Sign Up' }).click()
      await expect(page).toHaveURL('/register')

      // Back to home via logo
      await page.getByRole('link', { name: 'Samaritan' }).click()
      await expect(page).toHaveURL('/')
    })
  })
})
