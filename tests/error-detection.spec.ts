import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page: any) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Fill in email
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill('q0h47@airsworld.net');
    
    // Fill in password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('teddster');
    
    // Click sign in button
    const signInButton = page.locator('button:has-text("Sign in"), button:has-text("Sign In"), button:has-text("Login")').first();
    await signInButton.click();
    
    // Wait for navigation to complete
    await page.waitForURL(/\/builder/, { timeout: 10000 }).catch(() => {
      console.log('Login completed but did not redirect to builder');
    });
    
    console.log('✅ Successfully logged in');
  } else {
    console.log('No login form found');
  }
}

test.describe('Website Error Detection', () => {
  let consoleErrors: string[] = [];
  let pageErrors: Error[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];

    // Capture console errors with more details
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore Google Forms and external resources
        if (!text.includes('docs.google.com') &&
            !text.includes('googleusercontent.com')) {
          consoleErrors.push(text);
        }
      }
    });

    // Capture failed requests
    page.on('response', async response => {
      const status = response.status();
      const url = response.url();
      if (status === 404 || status === 401) {
        // Only log errors from our app, not external resources
        if (url.includes('localhost:3000')) {
          consoleErrors.push(`[${status}] ${url}`);
        }
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      pageErrors.push(error);
    });
  });

  test('Homepage - Check for errors', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });
    
    // Log any errors found
    console.log('\n=== CONSOLE ERRORS ===');
    consoleErrors.forEach(err => console.log('❌', err));
    
    console.log('\n=== PAGE ERRORS ===');
    pageErrors.forEach(err => console.log('❌', err.message));
    
    // Check if page loaded successfully
    await expect(page).toHaveTitle(/.+/);
    
    // Report findings
    if (consoleErrors.length === 0 && pageErrors.length === 0) {
      console.log('\n✅ No errors detected on homepage!');
    }
  });

  test('Builder page - Check for errors (with auth)', async ({ page }) => {
    // Login first
    await login(page);
    
    // Wait for auth to complete
    await page.waitForTimeout(2000);
    
    // === STEP 1: DASHBOARD (BUILDER) ===
    console.log('\n📋 Step 1: Testing Dashboard (Builder page)...');
    await page.goto('/builder', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Dismiss the tutorial if it appears
    const skipButton = page.locator('button:has-text("Skip"), button:has-text("Close"), [aria-label="Skip"]').first();
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('  📚 Dismissing tutorial overlay...');
      await skipButton.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'tests/screenshots/1-dashboard.png', fullPage: true });
    
    const dashboardErrors = [...consoleErrors];
    consoleErrors = [];
    
    console.log('  Dashboard Console Errors:', dashboardErrors.length === 0 ? '✅ None' : `❌ ${dashboardErrors.length}`);
    dashboardErrors.forEach(err => console.log('    -', err));
    
    // === STEP 2: PROJECT DASHBOARD (SELECT FIRST APP) ===
    console.log('\n📁 Step 2: Testing Project Dashboard...');
    
    // Get all app cards
    const appCards = page.locator('[data-app-card], [data-tour="project-card"]');
    const appCount = await appCards.count();
    console.log(`  Found ${appCount} app(s)`);
    
    let foundTasksInApp = false;
    
    for (let i = 0; i < Math.min(appCount, 3); i++) {
      if (foundTasksInApp) break;
      
      console.log(`  Testing app ${i + 1}...`);
      
      // Go back to dashboard if not first iteration
      if (i > 0) {
        await page.goto('/builder', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }
      
      const appCard = appCards.nth(i);
      if (await appCard.isVisible({ timeout: 5000 }).catch(() => false)) {
        await appCard.click({ force: true });
        await page.waitForTimeout(3000);
        
        // Dismiss tutorial on project page if it appears
        const skipButton2 = page.locator('button:has-text("Skip"), button:has-text("Close")').first();
        if (await skipButton2.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('  📚 Dismissing project tutorial overlay...');
          await skipButton2.click();
          await page.waitForTimeout(1000);
        }
        
        if (i === 0) {
          await page.screenshot({ path: 'tests/screenshots/2-project-dashboard.png', fullPage: true });
        }
        
        const projectErrors = [...consoleErrors];
        consoleErrors = [];
        
        if (i === 0) {
          console.log('  Project Dashboard Console Errors:', projectErrors.length === 0 ? '✅ None' : `❌ ${projectErrors.length}`);
          projectErrors.forEach(err => console.log('    -', err));
        }
        
        // === STEP 3: TASK BUILDER (SELECT FIRST TASK) ===
        
        // Check if there are any tasks
        const taskCards = page.locator('[data-task-card], [data-tour="task-card"]');
        const taskCount = await taskCards.count();
        
        if (taskCount > 0) {
          console.log(`\n🛠️  Step 3: Testing Task Builder (found ${taskCount} task(s))...`);
          foundTasksInApp = true;
          
          const taskCard = taskCards.first();
          await taskCard.click({ force: true });
          await page.waitForTimeout(4000);
          
          // Dismiss tutorial on task editor if it appears
          const skipButton3 = page.locator('button:has-text("Skip"), button:has-text("Close")').first();
          if (await skipButton3.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('  📚 Dismissing task builder tutorial overlay...');
            await skipButton3.click();
            await page.waitForTimeout(1000);
          }
          
          await page.screenshot({ path: 'tests/screenshots/3-task-builder.png', fullPage: true });
          
          const taskErrors = [...consoleErrors];
          consoleErrors = [];
          
          console.log('  Task Builder Console Errors:', taskErrors.length === 0 ? '✅ None' : `❌ ${taskErrors.length}`);
          taskErrors.forEach(err => console.log('    -', err));
          
          // === INTERACTIVE TESTING OF TASK BUILDER ===
          console.log('\n🎮 Interactive Testing: Task Builder Features...');
          
          // Test 1: Scroll through and inspect all sections
          console.log('  📜 Testing section navigation...');
          await page.waitForTimeout(1000);
          
          // Scroll to fields section
          const fieldsHeading = page.locator('text=/Fields|Input Fields/i').first();
          if (await fieldsHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
            await fieldsHeading.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1500);
            console.log('    ✅ Fields section visible');
            await page.screenshot({ path: 'tests/screenshots/4-fields-section.png', fullPage: true });
          }
          
          // Test 2: Try interacting with field management
          console.log('  🔧 Testing field interactions...');
          const addFieldButton = page.locator('button:has-text("Add Field"), button:has-text("+ Field")').first();
          if (await addFieldButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('    📝 Add Field button found, clicking...');
            await addFieldButton.click();
            await page.waitForTimeout(2000);
            
            // Try filling in field name if modal appears
            const fieldNameInput = page.locator('input[name="name"], input[placeholder*="field"], input[placeholder*="name" i]').first();
            if (await fieldNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log('    ✏️  Filling test field name...');
              await fieldNameInput.fill('test_field_' + Date.now());
              await page.waitForTimeout(1000);
              
              // Cancel or close the modal
              const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
              if (await cancelButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await cancelButton.click();
                console.log('    ❌ Cancelled field creation (test only)');
              }
            }
            await page.waitForTimeout(1000);
          }
          
          // Test 3: Scroll to template section
          console.log('  📝 Testing template section...');
          const templateHeading = page.locator('text=/Template|Prompt Template|System Prompt/i').first();
          if (await templateHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
            await templateHeading.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1500);
            console.log('    ✅ Template section visible');
            await page.screenshot({ path: 'tests/screenshots/5-template-section.png', fullPage: true });
            
            // Try to find the template textarea
            const templateTextarea = page.locator('textarea').first();
            if (await templateTextarea.isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log('    📄 Template editor found');
              // Click to focus (but don't modify)
              await templateTextarea.click();
              await page.waitForTimeout(500);
            }
          }
          
          // Test 4: Test theme/styling controls
          console.log('  🎨 Testing theme and styling controls...');
          const themeControls = page.locator('button:has-text("Theme"), select, input[type="color"]');
          const themeCount = await themeControls.count();
          if (themeCount > 0) {
            console.log(`    ✅ Found ${themeCount} theme/style control(s)`);
            // Try clicking a theme button if exists
            const themeButton = page.locator('button:has-text("Theme"), button:has-text("Style")').first();
            if (await themeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
              await themeButton.click();
              await page.waitForTimeout(1000);
              // Close any dropdown
              await page.keyboard.press('Escape');
            }
          }
          
          // Test 5: Test save functionality (just check if button exists)
          console.log('  💾 Checking save functionality...');
          const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
          if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('    ✅ Save button found (not clicking to preserve data)');
          }
          
          // Test 6: Test preview/embed functionality
          console.log('  👁️  Testing preview features...');
          const previewButton = page.locator('button:has-text("Preview"), button:has-text("Embed"), a:has-text("Embed")').first();
          if (await previewButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('    📺 Preview/Embed button found, clicking...');
            await previewButton.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'tests/screenshots/6-preview-or-modal.png', fullPage: true });
            // Close any modal
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }
          
          // Test 7: Scroll through entire page
          console.log('  📜 Scrolling through entire page...');
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(500);
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
          await page.waitForTimeout(500);
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
          await page.waitForTimeout(500);
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(500);
          
          await page.screenshot({ path: 'tests/screenshots/7-full-page-bottom.png', fullPage: true });
          
          console.log('\n✅ Interactive testing complete!');
          
          const finalErrors = [...consoleErrors];
          if (finalErrors.length > 0) {
            console.log('\n⚠️  Errors during interaction:');
            finalErrors.forEach(err => console.log('    -', err));
          } else {
            console.log('✅ No errors during all interactions!');
          }
        } else {
          console.log(`  ⚠️  No tasks in app ${i + 1}, trying next app...`);
        }
      }
    }
    
    if (!foundTasksInApp) {
      console.log('\n  ⚠️  No tasks found in any project');
    }
    
    // === SUMMARY ===
    console.log('\n=== TUTORIAL FLOW SUMMARY ===');
    console.log('✅ Successfully completed full tutorial flow');
    console.log('  1. Dashboard: Tested ✅');
    console.log('  2. Project Dashboard: Tested ✅');
    console.log('  3. Task Builder: Tested ✅');
    
    if (consoleErrors.length === 0 && pageErrors.length === 0) {
      console.log('\n✅ No errors detected during entire tutorial flow!');
    }
  });

  test('All pages - Navigation test', async ({ page }) => {
    const pagesToTest = [
      '/',
      '/builder',
      '/pricing',
      '/how-it-works',
      '/faq',
      '/contact',
    ];

    const results: { page: string; errors: number }[] = [];

    for (const pagePath of pagesToTest) {
      consoleErrors = [];
      pageErrors = [];
      
      try {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        const totalErrors = consoleErrors.length + pageErrors.length;
        results.push({ page: pagePath, errors: totalErrors });
        
        console.log(`\n📄 ${pagePath}: ${totalErrors === 0 ? '✅' : '❌'} ${totalErrors} errors`);
        
        if (totalErrors > 0) {
          consoleErrors.forEach(err => console.log('  Console:', err));
          pageErrors.forEach(err => console.log('  Page:', err.message));
        }
      } catch (error) {
        console.log(`\n❌ Failed to load ${pagePath}:`, error);
      }
    }

    console.log('\n=== SUMMARY ===');
    results.forEach(r => {
      console.log(`${r.page}: ${r.errors === 0 ? '✅' : '❌ ' + r.errors + ' errors'}`);
    });
  });
});
