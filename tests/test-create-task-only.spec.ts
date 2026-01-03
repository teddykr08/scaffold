import { test, expect } from '@playwright/test';

test('Test Create Task Only', async ({ page }) => {
  // Listen for console messages from the page
  page.on('console', msg => {
    const text = msg.text();
    console.log(`   [Browser Console]: ${text}`);
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`   [Page Error]: ${error}`);
  });
  
  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('/api/tasks')) {
      console.log(`   [Network]: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/tasks')) {
      console.log(`   [Network]: Response ${response.status()} from ${response.url()}`);
    }
  });
  
  console.log('🔐 Logging in...');
  
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'q0h47@airsworld.net');
  await page.fill('input[type="password"]', 'teddster');
  await page.click('button:has-text("Sign In")');
  
  // Wait for redirect away from login page
  await page.waitForURL('**/builder**', { timeout: 10000 });
  await page.waitForTimeout(1000);
  console.log('✅ Logged in');
  
  // Navigate to app
  console.log('📁 Navigating to app...');
  await page.goto('http://localhost:3000/builder/d48abad1-bd5b-489d-ae1d-0b5c22e61358');
  await page.waitForLoadState('load');
  await page.waitForTimeout(2000);
  console.log('✅ On app page');
  
  // Dismiss tutorial if present
  const skipBtn = page.locator('button:has-text("Skip Tutorial")');
  if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skipBtn.click();
    await page.waitForTimeout(500);
    console.log('✅ Tutorial dismissed');
  }
  
  // Count existing tasks
  const existingTasks = await page.locator('[data-tour="task-card"]').count();
  console.log(`📋 Existing tasks: ${existingTasks}`);
  
  // Open modal
  console.log('\n🎯 Opening New Task modal...');
  await page.click('[data-tour="create-task"]');
  await page.waitForTimeout(1000);
  
  const modalVisible = await page.locator('text=Create New Task').isVisible();
  console.log(`   Modal visible: ${modalVisible}`);
  
  if (!modalVisible) {
    console.log('❌ Modal did not open!');
    await page.screenshot({ path: 'tests/screenshots/modal-not-opened.png' });
    throw new Error('Modal not opened');
  }
  
  // Fill task name
  const taskName = 'test_' + Date.now();
  console.log(`\n✍️  Filling task name: ${taskName}`);
  await page.getByPlaceholder('Task name (e.g. write_email)').fill(taskName);
  await page.waitForTimeout(500);
  
  // Check button state
  const createBtn = page.locator('button').filter({ hasText: 'Create Task' });
  const isEnabled = await createBtn.isEnabled();
  const isVisible = await createBtn.isVisible();
  console.log(`   Button enabled: ${isEnabled}`);
  console.log(`   Button visible: ${isVisible}`);
  
  // Take screenshot before clicking
  await page.screenshot({ path: 'tests/screenshots/before-create-click.png' });
  console.log('📸 Screenshot: before-create-click.png');
  
  // Click Create Task button
  console.log('\n🔘 Clicking Create Task button...');
  await createBtn.click();
  
  // Wait and check if modal closes
  console.log('⏳ Waiting for modal to close...');
  await page.waitForTimeout(3000);
  
  const modalStillVisible = await page.locator('text=Create New Task').isVisible().catch(() => false);
  console.log(`   Modal still visible: ${modalStillVisible}`);
  
  if (modalStillVisible) {
    console.log('⚠️  Modal still open - task creation may have failed');
    await page.screenshot({ path: 'tests/screenshots/modal-still-open.png' });
    
    // Try Enter key as alternative
    console.log('\n⏎ Trying Enter key instead...');
    await page.getByPlaceholder('Task name (e.g. write_email)').press('Enter');
    await page.waitForTimeout(2000);
    
    const modalStillVisible2 = await page.locator('text=Create New Task').isVisible().catch(() => false);
    console.log(`   Modal still visible after Enter: ${modalStillVisible2}`);
  } else {
    console.log('✅ Modal closed!');
  }
  
  // Check if task was created
  await page.waitForTimeout(2000);
  const newTaskCount = await page.locator('[data-tour="task-card"]').count();
  console.log(`\n📊 Task count after creation: ${newTaskCount} (was ${existingTasks})`);
  
  if (newTaskCount > existingTasks) {
    console.log('✅ Task was created successfully!');
    
    // Find the new task
    const newTask = page.locator('[data-tour="task-card"]').last();
    const newTaskName = await newTask.locator('h3').textContent();
    console.log(`   New task name: ${newTaskName}`);
  } else {
    console.log('❌ Task was NOT created');
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'tests/screenshots/after-create-attempt.png' });
  console.log('📸 Screenshot: after-create-attempt.png');
  
  // Keep browser open
  console.log('\n⏸️  Keeping browser open for inspection...');
  await page.waitForTimeout(5000);
});
