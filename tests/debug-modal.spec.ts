import { test, expect } from '@playwright/test';

test('Debug modal clicks', async ({ page }) => {
  // Login first
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'q0h47@airsworld.net');
  await page.fill('input[type="password"]', 'teddster');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('load');
  await page.waitForTimeout(2000);
  
  // Navigate to app
  await page.goto('http://localhost:3000/builder/d48abad1-bd5b-489d-ae1d-0b5c22e61358');
  await page.waitForTimeout(2000);
  
  console.log('📍 On app page');
  
  // Open modal
  await page.click('[data-tour="create-task"]');
  await page.waitForTimeout(1000);
  console.log('✅ Modal opened');
  
  // Fill input
  await page.fill('[data-tour="task-name-input"]', 'test_task_debug');
  await page.waitForTimeout(500);
  console.log('✅ Input filled: test_task_debug');
  
  // Check button state
  const button = page.locator('button').filter({ hasText: 'Create Task' });
  const buttonVisible = await button.isVisible();
  const buttonEnabled = await button.isEnabled();
  const buttonCount = await page.locator('button').filter({ hasText: 'Create Task' }).count();
  
  console.log('\n🔍 Button State:');
  console.log('  - Visible:', buttonVisible);
  console.log('  - Enabled:', buttonEnabled);
  console.log('  - Count:', buttonCount);
  
  // Check computed styles via evaluate
  const buttonInfo = await button.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      zIndex: styles.zIndex,
      pointerEvents: styles.pointerEvents,
      opacity: styles.opacity,
      disabled: (el as HTMLButtonElement).disabled,
    };
  });
  console.log('  - Computed styles:', buttonInfo);
  
  // Check backdrop
  const backdropInfo = await page.evaluate(() => {
    const backdrop = document.querySelector('.fixed.inset-0.bg-black');
    if (!backdrop) return { found: false };
    const styles = window.getComputedStyle(backdrop);
    return {
      found: true,
      zIndex: styles.zIndex,
      pointerEvents: styles.pointerEvents,
    };
  });
  console.log('\n🔍 Backdrop State:', backdropInfo);
  
  // Try different click methods
  console.log('\n🎯 Attempting Clicks:');
  
  console.log('  1. Regular click...');
  try {
    await button.click({ timeout: 5000 });
    console.log('     ✅ Regular click succeeded');
  } catch (e: any) {
    console.log('     ❌ Regular click failed:', e.message.split('\n')[0]);
  }
  
  await page.waitForTimeout(1000);
  
  // Check if modal is still visible
  const modalStillVisible = await page.locator('text=Create New Task').isVisible().catch(() => false);
  console.log('\n📊 After click - Modal still visible:', modalStillVisible);
  
  if (modalStillVisible) {
    console.log('\n  2. Force click...');
    try {
      await button.click({ force: true });
      console.log('     ✅ Force click succeeded');
    } catch (e: any) {
      console.log('     ❌ Force click failed:', e.message);
    }
    
    await page.waitForTimeout(1000);
    const modalStillVisible2 = await page.locator('text=Create New Task').isVisible().catch(() => false);
    console.log('     Modal still visible:', modalStillVisible2);
  }
  
  if (await page.locator('text=Create New Task').isVisible().catch(() => false)) {
    console.log('\n  3. JavaScript click...');
    await button.evaluate((el) => (el as HTMLButtonElement).click());
    console.log('     ✅ JS click executed');
    
    await page.waitForTimeout(1000);
    const modalStillVisible3 = await page.locator('text=Create New Task').isVisible().catch(() => false);
    console.log('     Modal still visible:', modalStillVisible3);
  }
  
  // Final check
  await page.waitForTimeout(2000);
  const finalModalState = await page.locator('text=Create New Task').isVisible().catch(() => false);
  console.log('\n🏁 Final modal state - Still visible:', finalModalState);
  
  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/modal-debug.png' });
  console.log('📸 Screenshot saved: modal-debug.png');
  
  // Keep browser open
  await page.waitForTimeout(3000);
});
