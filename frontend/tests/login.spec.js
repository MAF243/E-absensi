import { test, expect } from '@playwright/test';

test.describe('Login & Routing Navigation', () => {
  
  test('Admin logged in should be redirected to dashboard-admin when visiting root', async ({ page }) => {
    await page.goto('/');
    
    await page.route('**/api/**', route => {
      if (route.request().url().includes('/auth/login')) {
        route.fulfill({
          status: 200,
          json: { success: true, token: 'fake-jwt-token', data: { role: 'admin', nama: 'Admin' } }
        });
      } else {
        route.fulfill({ status: 200, json: { success: true, data: [] } });
      }
    });

    await page.fill('input[placeholder="NIM / NIDN"]', 'admin');
    await page.fill('input[placeholder="••••••••"]', 'any-password'); 
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard-admin');
    
    // THE SEAM: Visit login page via client side navigation
    await page.evaluate(() => window.__NAVIGATE__('/'));
    
    // ASSERTION: Redirected back to dashboard-admin
    await expect(page).toHaveURL(/.*dashboard-admin/);
  });

  test('Dosen logged in should be redirected to dashboard-dosen when visiting root', async ({ page }) => {
    await page.goto('/');
    
    await page.route('**/api/**', route => {
      if (route.request().url().includes('/auth/login')) {
        route.fulfill({
          status: 200,
          json: { success: true, token: 'fake-jwt-token', data: { role: 'dosen', nama: 'Dosen' } }
        });
      } else {
        route.fulfill({ status: 200, json: { success: true, data: [] } });
      }
    });

    await page.fill('input[placeholder="NIM / NIDN"]', 'dosen');
    await page.fill('input[placeholder="••••••••"]', 'any-password'); 
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard-dosen');
    
    // THE SEAM: Visit login page via client side navigation
    await page.evaluate(() => window.__NAVIGATE__('/'));
    
    // ASSERTION: Redirected back to dashboard-dosen
    await expect(page).toHaveURL(/.*dashboard-dosen/);
  });

  test('Mahasiswa logged in should be redirected to dashboard-mahasiswa when visiting root', async ({ page }) => {
    await page.goto('/');
    
    await page.route('**/api/**', route => {
      if (route.request().url().includes('/auth/login')) {
        route.fulfill({
          status: 200,
          json: { success: true, token: 'fake-jwt-token', data: { role: 'mahasiswa', nama: 'Mahasiswa' } }
        });
      } else {
        route.fulfill({ status: 200, json: { success: true, data: [] } });
      }
    });

    await page.fill('input[placeholder="NIM / NIDN"]', 'mahasiswa');
    await page.fill('input[placeholder="••••••••"]', 'any-password'); 
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard-mahasiswa');
    
    // THE SEAM: Visit login page via client side navigation
    await page.evaluate(() => window.__NAVIGATE__('/'));
    
    // ASSERTION: Redirected back to dashboard-mahasiswa
    await expect(page).toHaveURL(/.*dashboard-mahasiswa/);
  });

});
