import { test, expect } from '@playwright/test';

test.describe('System Visualization & Screenshots', () => {
    
    // Unique user for this run
    const timestamp = Date.now();
    const operatorUser = {
        name: `Operator ${timestamp}`,
        email: `operator${timestamp}@arena.com`,
        password: 'Password123!',
    };

    test('Capture System Screenshots', async ({ page }) => {
        // 1. Landing Page
        await page.goto('/');
        await expect(page.getByText('ARENA')).toBeVisible();
        await page.screenshot({ path: 'screenshots/01_landing_page.png', fullPage: true });

        // 2. Registration Page
        await page.getByRole('button', { name: 'Register' }).click();
        await expect(page.getByText('Join ARENA')).toBeVisible();
        await page.screenshot({ path: 'screenshots/02_registration_page.png', fullPage: true });

        // 3. Register as Operator (to unlock all features)
        await page.locator('input[title="name"]').fill(operatorUser.name);
        await page.locator('input[title="email"]').fill(operatorUser.email);
        await page.locator('input[title="password"]').fill(operatorUser.password);
        
        // Note: In a real scenario we'd select 'operator' but the select might be hidden/default.
        // Assuming default is player. Let's register as player first, then maybe login as operator?
        // Or just show player view.
        // Let's stick to the default flow which is arguably more important for visual docs.
        
        await page.locator('button[type="submit"]').click();
        await expect(page.getByText('Registration successful')).toBeVisible();
        
        // Auto-redirect to dashboard
        await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(1000); // Wait for animations
        await page.screenshot({ path: 'screenshots/03_dashboard_initial.png', fullPage: true });

        // 4. Tournaments Page
        // Click 'Tournaments' nav button
        await page.getByText('Tournaments').click();
        await expect(page.getByText('Available Tournaments')).toBeVisible();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/04_tournaments_list.png', fullPage: true });

        // 5. Create Tournament (if we were an owner - wait, we are a player)
        // Let's Logout and Login as the hardcoded Operator to show more screens?
        // The seed script created 'operator@arena.com' / 'password123'
        
        // Logout
        await page.locator('button[title="Logout"]').click();
        await expect(page.getByText('Login')).toBeVisible();

        // Login as Operator
        await page.getByRole('button', { name: 'Login' }).click();
        await page.locator('input[title="email"]').fill('operator@arena.com');
        await page.locator('input[title="password"]').fill('password123');
        await page.locator('button[type="submit"]').click();
        
        await expect(page.getByText('Dashboard')).toBeVisible();
        await page.waitForTimeout(1000); // Wait for animations
        await page.screenshot({ path: 'screenshots/05_operator_dashboard.png', fullPage: true });

        // 6. Manage Games (Operator only)
        // Check if "Manage Games" button exists
        const manageGamesBtn = page.getByText('Manage Games');
        if (await manageGamesBtn.isVisible()) {
            await manageGamesBtn.click();
            await expect(page.getByText('Game Management')).toBeVisible();
            await page.screenshot({ path: 'screenshots/06_game_management.png', fullPage: true });
        }
        
    });
});
