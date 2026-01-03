import { test, expect } from '@playwright/test';

// Direct task builder test - modify the URL to match your actual task
test('Interactive Task Builder Test', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.fill('q0h47@airsworld.net');
  
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill('teddster');
  
  const signInButton = page.locator('button:has-text("Sign in"), button:has-text("Sign In")').first();
  await signInButton.click();
  
  await page.waitForTimeout(3000);
  console.log('✅ Logged in');
  
  // Go to builder dashboard
  await page.goto('http://localhost:3000/builder');
  await page.waitForTimeout(2000);
  
  // Dismiss tutorial
  const skipButton = page.locator('button:has-text("Skip")').first();
  if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skipButton.click();
  }
  
  console.log('\n🔍 Looking for apps and tasks...');
  
  // Click first app
  const appCards = page.locator('[data-tour="project-card"]');
  const appCount = await appCards.count();
  console.log(`Found ${appCount} apps`);
  
  if (appCount > 0) {
    // Try each app to find one with tasks
    for (let i = 0; i < appCount; i++) {
      await page.goto('http://localhost:3000/builder');
      await page.waitForTimeout(2000);
      
      const appCard = page.locator('[data-tour="project-card"]').nth(i);
      const appName = await appCard.textContent();
      console.log(`\nTrying app ${i + 1}: ${appName?.substring(0, 30)}...`);
      
      await appCard.click({ force: true });
      await page.waitForTimeout(3000);
      
      // Dismiss tutorial if appears
      const skip2 = page.locator('button:has-text("Skip")').first();
      if (await skip2.isVisible({ timeout: 1000 }).catch(() => false)) {
        await skip2.click();
        await page.waitForTimeout(500);
      }
      
      // Check for tasks
      const taskCards = page.locator('[data-tour="task-card"]');
      const taskCount = await taskCards.count();
      console.log(`  Found ${taskCount} tasks`);
      
      if (taskCount > 0) {
        // Found a task! Click it
        const taskCard = taskCards.first();
        const taskName = await taskCard.textContent();
        console.log(`  ✅ Opening task: ${taskName?.substring(0, 30)}...`);
        
        await taskCard.click({ force: true });
        await page.waitForTimeout(4000);
        
        // Dismiss tutorial
        const skip3 = page.locator('button:has-text("Skip")').first();
        if (await skip3.isVisible({ timeout: 1000 }).catch(() => false)) {
          await skip3.click();
          await page.waitForTimeout(1000);
        }
        
        console.log('\n🎮 Starting interactive testing...\n');
        
        // === INTERACTIVE TESTING ===
        await page.screenshot({ path: 'tests/screenshots/task-builder-start.png', fullPage: true });
        
        // Test 1: Fields section
        console.log('1️⃣ Testing Fields Section...');
        const fieldsSection = page.locator('text=/Fields/i').first();
        if (await fieldsSection.isVisible({ timeout: 2000 }).catch(() => false)) {
          await fieldsSection.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          console.log('   ✅ Fields section visible');
          
          // Try add field
          const addFieldBtn = page.locator('button:has-text("Add"), button:has-text("New Field")').first();
          if (await addFieldBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('   🔘 Clicking Add Field...');
            await addFieldBtn.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'tests/screenshots/add-field-modal.png' });
            
            // Close modal
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }
        }
        
        // Test 2: Template section
        console.log('\n2️⃣ Testing Template Section...');
        const templateSection = page.locator('text=/Template|Prompt/i').first();
        if (await templateSection.isVisible({ timeout: 2000 }).catch(() => false)) {
          await templateSection.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          console.log('   ✅ Template section visible');
          await page.screenshot({ path: 'tests/screenshots/template-section.png', fullPage: true });
          
          // Click in template area
          const textarea = page.locator('textarea').first();
          if (await textarea.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log('   📝 Template editor found');
            await textarea.click();
            await page.waitForTimeout(500);
          }
        }
        
        // Test 3: Theme controls
        console.log('\n3️⃣ Testing Theme Controls...');
        const colorInput = page.locator('input[type="color"]').first();
        if (await colorInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('   🎨 Color picker found');
          await colorInput.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await page.screenshot({ path: 'tests/screenshots/theme-controls.png' });
        }
        
        // Test 4: Scroll through everything
        console.log('\n4️⃣ Scrolling through entire page...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(1000);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/page-bottom.png', fullPage: true });
        
        // Test 5: Look for action buttons
        console.log('\n5️⃣ Testing Action Buttons...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        
        const saveBtn = page.locator('button:has-text("Save")').first();
        if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('   💾 Save button found (not clicking)');
        }
        
        const embedLink = page.locator('a:has-text("Embed"), button:has-text("Embed")').first();
        if (await embedLink.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('   🔗 Embed button found');
        }
        
        console.log('\n✅ Interactive testing complete!');
        console.log('📸 Screenshots saved to tests/screenshots/');
        
        return; // Exit after testing first task found
      }
    }
    
    console.log('\n❌ No tasks found in any app. Please create a task first.');
  } else {
    console.log('\n❌ No apps found. Please create an app first.');
  }
});
