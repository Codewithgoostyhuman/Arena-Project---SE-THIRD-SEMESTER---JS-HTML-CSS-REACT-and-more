// tests/system_flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('ARENA System Flow', () => {
    
    // Generate a unique user for each test run to avoid conflicts
    const timestamp = Date.now();
    const testUser = {
        name: `Test User ${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'Password123!',
        role: 'player'
    };

    test('User can register and login', async ({ page }) => {
        // 1. Navigate to the application
        await page.goto('/');

        // 1. Navigate to the application
        await page.goto('/');

        // 2. Navigate to Register Page from Landing Page
        // Application starts on Landing Page, so we click 'Register' in the nav
        await page.getByRole('button', { name: 'Register' }).click();
        
        await expect(page.getByText('Join ARENA')).toBeVisible();

        // 4. Fill in Registration Form
        await page.locator('input[title="name"]').fill(testUser.name);
        await page.locator('input[title="email"]').fill(testUser.email);
        await page.locator('input[title="password"]').fill(testUser.password);
        
        // Select Role (default is player, but good to be explicit if needed)
        // await page.locator('select[title="role"]').selectOption('player');

        // 5. Submit Registration
        await page.locator('button[type="submit"]').click();

        // 6. Verification
        // Expect "Registration successful" message or redirection
        // The app redirects to Dashboard or Login depending on implementation (checked code: redirects to dashboard after 1s for players)
        
        // Wait for redirection to dashboard or login
        // Check for a dashboard element, e.g., "Overview" or "Available Tournaments"
        // Note: The toast appears: "Registration successful! Redirecting..."
        await expect(page.getByText('Registration successful')).toBeVisible();

        // Take a screenshot for the report
        await page.screenshot({ path: 'system_test_evidence.png', fullPage: true });

        // 7. Verify Login (Auto-login after registration? Or manual login?)
        // The code says: setTimeout(() => setCurrentView('dashboard'), 1000);
        // So it should auto-login.
        
        // Verify we are on the dashboard
        // Looking for the side navigation or header
        await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
        
        // 8. Test Logout (Optional but good practice)
        // Assuming there is a logout button. 
        // We'll need to check the Navigation component for the logout button selector.
        // For now, checks are sufficient.
    });
});
