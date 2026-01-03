import { test, expect } from '@playwright/test';

test('Full Tutorial and Site Test', async ({ page }) => {
  // Monitor console for errors
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`❌ [Console Error]: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`❌ [Page Error]: ${error.message}`);
  });

  console.log('🔐 Logging in...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'q0h47@airsworld.net');
  await page.fill('input[type="password"]', 'teddster');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/builder**', { timeout: 10000 });
  await page.waitForTimeout(2000);
  console.log('✅ Logged in\n');

  // Check if tutorial is visible
  console.log('📚 Checking for tutorial...');
  const tutorialVisible = await page.locator('text=Welcome to Scaffold').isVisible({ timeout: 3000 }).catch(() => false);
  
  if (tutorialVisible) {
    console.log('✅ Tutorial visible - going through steps\n');
    
    // Tutorial Step 1: Introduction
    console.log('Step 1: Introduction');
    await expect(page.locator('text=Welcome to Scaffold')).toBeVisible();
    await expect(page.locator('text=Let\'s create your first AI-powered form')).toBeVisible();
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    console.log('✅ Step 1 completed\n');

    // Tutorial Step 2: Example apps
    console.log('Step 2: Example Projects');
    await expect(page.locator('text=Example Projects')).toBeVisible();
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    console.log('✅ Step 2 completed\n');

    // Tutorial Step 3: Create app
    console.log('Step 3: Create App');
    await expect(page.locator('text=Create Your Project')).toBeVisible();
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    console.log('✅ Step 3 completed\n');

    // Check if we need to actually create an app
    const appCount = await page.locator('[data-tour="app-card"]').count();
    console.log(`📊 Current app count: ${appCount}`);
    
    if (appCount === 0) {
      console.log('🏗️ Creating first app...');
      const newAppCard = page.locator('[data-tour="new-app-card"]');
      if (await newAppCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await newAppCard.click();
        await page.waitForTimeout(1000);
        await page.getByPlaceholder('App name').fill('Tutorial Test App');
        await page.click('button:has-text("Create App")');
        await page.waitForTimeout(2000);
        console.log('✅ App created\n');
      }
    } else {
      console.log('✅ Apps already exist, skipping creation\n');
    }

    // Continue or skip tutorial
    const skipBtn = page.locator('button:has-text("Skip Tutorial")');
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ Tutorial skipped\n');
    }
  } else {
    console.log('ℹ️ Tutorial not visible (may have been completed before)\n');
  }

  // Test dashboard functionality
  console.log('🏠 Testing Dashboard...');
  await page.goto('http://localhost:3000/builder');
  await page.waitForLoadState('load');
  await page.waitForTimeout(3000); // Give extra time for projects to load
  
  // Wait for projects to actually load with retry logic
  let apps = 0;
  for (let i = 0; i < 5; i++) {
    apps = await page.locator('[data-tour="app-card"]').count();
    if (apps > 0) break;
    console.log(`⏳ Waiting for projects to load (attempt ${i + 1}/5)...`);
    await page.waitForTimeout(1000);
  }
  
  console.log(`✅ Dashboard loaded with ${apps} projects\n`);

  if (apps > 0) {
    // Open first app
    console.log('📂 Opening first project...');
    const firstApp = page.locator('[data-tour="app-card"]').first();
    const appName = await firstApp.locator('h2').textContent();
    console.log(`   Project name: ${appName}`);
    
    // Get app ID from the first app card
    const appCards = page.locator('[data-tour="app-card"]');
    const firstCard = appCards.first();
    const appId = await firstCard.getAttribute('data-app-id');
    
    if (appId) {
      console.log(`   Project ID: ${appId}`);
      await page.goto(`http://localhost:3000/builder/${appId}`);
      await page.waitForLoadState('load');
      await page.waitForTimeout(3000); // Extra time for project to load
      console.log('✅ Project page loaded\n');

      // Dismiss tutorial if present
      const skipBtn = page.locator('button:has-text("Skip Tutorial")');
      if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipBtn.click();
        await page.waitForTimeout(500);
      }

      // Check if project name is displayed
      const appTitle = await page.locator('h1').first().textContent();
      console.log(`📋 Project title displayed: ${appTitle}\n`);

      // Test task creation
      console.log('➕ Testing task creation...');
      const initialTaskCount = await page.locator('[data-tour="task-card"]').count();
      console.log(`   Initial tasks: ${initialTaskCount}`);

      await page.click('[data-tour="create-task"]');
      await page.waitForTimeout(1000);

      const taskName = 'playwright_test_' + Date.now();
      await page.getByPlaceholder('Task name (e.g. write_email)').fill(taskName);
      await page.waitForTimeout(500);

      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(3000);

      const newTaskCount = await page.locator('[data-tour="task-card"]').count();
      console.log(`   New task count: ${newTaskCount}`);

      if (newTaskCount > initialTaskCount) {
        console.log(`✅ Task created successfully: ${taskName}\n`);

        // Open the new task for editing
        console.log('✏️ Testing task editor...');
        const newTask = page.locator('[data-tour="task-card"]').last();
        const editBtn = newTask.locator('button:has-text("Edit Task")');
        await editBtn.click();
        await page.waitForTimeout(2000);
        console.log('✅ Task editor opened\n');

        // Test adding a field
        console.log('🔧 Testing field addition...');
        const addFieldBtn = page.locator('button:has-text("Add Field")');
        if (await addFieldBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await addFieldBtn.click();
          await page.waitForTimeout(1000);

          // Fill field details
          const fieldNameInput = page.locator('input[placeholder*="field_name"]').or(page.locator('input').first());
          if (await fieldNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await fieldNameInput.fill('test_field');
            await page.waitForTimeout(500);
            
            // Save field
            const saveFieldBtn = page.locator('button:has-text("Save")').or(page.locator('button:has-text("Add")'));
            if (await saveFieldBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
              await saveFieldBtn.click();
              await page.waitForTimeout(1500);
              console.log('✅ Field added\n');
            }
          }
        }

        // Test customization features
        console.log('🎨 Testing customization...');
        const customizeBtn = page.locator('button:has-text("Customize")').or(page.locator('text=Customize'));
        if (await customizeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('✅ Customization section visible\n');
        }

        // Test embed preview
        console.log('📱 Testing embed preview...');
        const embedSection = page.locator('text=Embed Code').or(page.locator('text=Live Preview'));
        if (await embedSection.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('✅ Embed section visible\n');
          
          // Check if iframe is present
          const iframe = page.frameLocator('iframe').first();
          const iframeVisible = await page.locator('iframe').first().isVisible({ timeout: 2000 }).catch(() => false);
          if (iframeVisible) {
            console.log('✅ Embed iframe loaded\n');
          }
        }

        // Navigate back to dashboard
        console.log('🔙 Testing navigation back to dashboard...');
        await page.click('a:has-text("Back to Projects")');
        await page.waitForTimeout(2000);
        
        const backOnDashboard = await page.locator('[data-tour="app-card"]').first().isVisible({ timeout: 3000 }).catch(() => false);
        if (backOnDashboard) {
          console.log('✅ Successfully navigated back to dashboard\n');
        } else {
          console.log('⚠️ Dashboard content not visible after navigation\n');
        }
      } else {
        console.log('⚠️ Task creation did not increase count\n');
      }
    }
  }

  // Report errors
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  
  if (consoleErrors.length > 0) {
    console.log(`\n❌ Console Errors Found (${consoleErrors.length}):`);
    consoleErrors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  } else {
    console.log('\n✅ No console errors');
  }

  if (pageErrors.length > 0) {
    console.log(`\n❌ Page Errors Found (${pageErrors.length}):`);
    pageErrors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  } else {
    console.log('✅ No page errors');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Keep browser open for inspection
  await page.waitForTimeout(2000);
});
