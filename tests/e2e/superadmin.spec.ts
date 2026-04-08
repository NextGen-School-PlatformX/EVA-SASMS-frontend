import { test, expect } from '@playwright/test';

test.describe('SuperAdmin E2E Workflows', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('BROWSER:', msg.text()));

        // We assume the test database is already seeded or we use a setup script
        // For now, let's login
        await page.goto('/login');
        await page.getByLabel('Email Address').fill('test-admin@sasms.edu.eg');
        await page.getByLabel('Password').fill('password123');

        // Select Role using MUI interaction
        await page.click('text=Registered Student');
        await page.click('text=System SuperAdmin');

        await page.click('text=Authorize Access');

        await expect(page).toHaveURL(/\/superadmin/, { timeout: 15000 });
        console.log('Final URL reached:', page.url());
    });

    test('should display total KPIs on dashboard', async ({ page }) => {
        // Wait for the KPI card to be visible - use more flexible selector
        await expect(page.getByText('Total Students', { exact: false })).toBeVisible();
        await expect(page.getByText('New Applications', { exact: false })).toBeVisible();
    });

    test('should manage departments and verify audit logs', async ({ page }) => {
        // Part 1: Manage Departments
        await page.goto('/superadmin/departments');
        const deptName = `E2E Test Dept ${Date.now()}`;

        await page.getByRole('button', { name: 'New Department' }).click();
        await page.getByLabel('Department Name').fill(deptName);
        await page.getByRole('button', { name: 'Create Department' }).click();

        await expect(page.getByRole('heading', { name: deptName })).toBeVisible();

        // Part 2: Verify Audit Log for this action
        await page.goto('/superadmin/audit');
        await expect(page.getByText('Audit & Traceability')).toBeVisible();
        await expect(page.getByRole('cell', { name: 'CREATE_DEPARTMENT' }).first()).toBeVisible();
    });
});
