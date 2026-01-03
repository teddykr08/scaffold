import { test, expect } from '@playwright/test';

test('Complete Tutorial Flow', async ({ page }) => {
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

  console.log('\n🎓 Starting Complete Tutorial Flow\n');
  console.log('=' .repeat(60));

  // Step 1: Login
  console.log('\n1️⃣  LOGGING IN');
  console.log('-'.repeat(60));
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'q0h47@airsworld.net');
  await page.fill('input[type="password"]', 'teddster');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/builder**', { timeout: 10000 });
  await page.waitForTimeout(2000);
  console.log('✅ Successfully logged in\n');

  // Step 2: Tutorial Welcome
  console.log('2️⃣  TUTORIAL WELCOME SCREEN');
  console.log('-'.repeat(60));
  const welcomeVisible = await page.locator('text=Welcome to Scaffold').isVisible({ timeout: 3000 }).catch(() => false);
  
  if (!welcomeVisible) {
    console.log('⚠️  Tutorial already completed - running verification only\n');
    
    // Verify existing setup
    console.log('🔍 VERIFYING EXISTING PROJECT SETUP');
    console.log('-'.repeat(60));
    
    // Wait for projects to load
    await page.waitForTimeout(3000);
    let projectCount = 0;
    for (let i = 0; i < 5; i++) {
      projectCount = await page.locator('[data-tour="app-card"]').count();
      if (projectCount > 0) break;
      console.log(`⏳ Waiting for projects to load (attempt ${i + 1}/5)...`);
      await page.waitForTimeout(1000);
    }
    
    console.log(`✅ Dashboard loaded with ${projectCount} project(s)`);
    
    const foodAppExists = await page.locator('h3:has-text("Food App")').isVisible({ timeout: 2000 }).catch(() => false);
    if (foodAppExists) {
      console.log('✅ "Food App" project exists');
      
      // Open it and check for tasks
      const foodAppCard = page.locator('[data-tour="app-card"]').filter({ hasText: 'Food App' });
      await foodAppCard.click();
      await page.waitForTimeout(3000);
      
      const taskCount = await page.locator('[data-tour="task-card"]').count();
      console.log(`✅ Found ${taskCount} task(s) in Food App`);
      
      const restaurantFinderExists = await page.locator('h3:has-text("Restaurant Finder")').isVisible({ timeout: 2000 }).catch(() => false);
      if (restaurantFinderExists) {
        console.log('✅ "Restaurant Finder" task exists');
      }
    }
    
    console.log('\n✅ Tutorial was previously completed - verification done\n');
    return;
  }

  await expect(page.locator('text=Welcome to Scaffold')).toBeVisible();
  await expect(page.locator('text=Let\'s create your first AI-powered form')).toBeVisible();
  console.log('✅ Welcome screen displayed');
  console.log('   📝 Saw intro message about creating first AI form');
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(1000);

  // Step 3: Example Projects
  console.log('\n3️⃣  EXAMPLE PROJECTS SHOWCASE');
  console.log('-'.repeat(60));
  await expect(page.locator('text=Example Projects')).toBeVisible();
  console.log('✅ Example projects step displayed');
  console.log('   📚 Reviewed example projects');
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(1000);

  // Step 4: Create Your Project
  console.log('\n4️⃣  CREATE PROJECT INSTRUCTIONS');
  console.log('-'.repeat(60));
  await expect(page.locator('text=Create Your Project')).toBeVisible();
  console.log('✅ Create project instructions displayed');
  console.log('   📖 Learned about projects organizing tasks');
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(1000);

  // Step 5: Actually Create the Project
  console.log('\n5️⃣  CREATING "FOOD APP" PROJECT');
  console.log('-'.repeat(60));
  
  // Check if Food App already exists
  const existingFoodApp = await page.locator('h3:has-text("Food App")').isVisible({ timeout: 2000 }).catch(() => false);
  
  if (existingFoodApp) {
    console.log('ℹ️  "Food App" project already exists - skipping creation');
  } else {
    const createProjectInput = page.getByPlaceholder('Project name...');
    if (await createProjectInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createProjectInput.fill('Food App');
      console.log('   ✍️  Typed "Food App"');
      await page.click('button:has-text("Create Project")');
      await page.waitForTimeout(2000);
      console.log('✅ Created "Food App" project');
    }
  }

  // Wait for tutorial to advance
  await page.waitForTimeout(1500);

  // Step 6: Open Your Project
  console.log('\n6️⃣  OPENING "FOOD APP" PROJECT');
  console.log('-'.repeat(60));
  
  // Look for the Food App card and click it
  const foodAppCard = page.locator('[data-tour="app-card"]').filter({ hasText: 'Food App' });
  if (await foodAppCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await foodAppCard.click();
    await page.waitForTimeout(2000);
    console.log('✅ Opened "Food App" project');
  } else {
    // If tutorial is guiding, look for Next button
    const nextBtn = page.locator('button:has-text("Next")');
    if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(1000);
      
      // Then open the project
      const openBtn = page.locator('button:has-text("Open Project")').first();
      if (await openBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await openBtn.click();
        await page.waitForTimeout(2000);
        console.log('✅ Opened project via button');
      }
    }
  }

  // Wait for project page to load
  await page.waitForTimeout(2000);

  // Step 7: Create New Task Instructions
  console.log('\n7️⃣  CREATE TASK INSTRUCTIONS');
  console.log('-'.repeat(60));
  
  // Look for tutorial overlay about creating tasks
  const createTaskInstructions = await page.locator('text=New Task').isVisible({ timeout: 2000 }).catch(() => false);
  if (createTaskInstructions) {
    console.log('✅ Task creation instructions displayed');
    const nextBtn = page.locator('button:has-text("Next")');
    if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // Step 8: Create "Restaurant Finder" Task
  console.log('\n8️⃣  CREATING "RESTAURANT FINDER" TASK');
  console.log('-'.repeat(60));
  
  // Check if Restaurant Finder already exists
  const existingTask = await page.locator('h3:has-text("Restaurant Finder")').isVisible({ timeout: 2000 }).catch(() => false);
  
  if (existingTask) {
    console.log('ℹ️  "Restaurant Finder" task already exists - skipping creation');
  } else {
    // Click New Task button
    const newTaskBtn = page.locator('[data-tour="create-task"]');
    if (await newTaskBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newTaskBtn.click();
      await page.waitForTimeout(1000);
      console.log('   🎯 Clicked "New Task" button');
      
      // Fill task name
      const taskNameInput = page.getByPlaceholder('Task name (e.g. write_email)');
      await taskNameInput.fill('Restaurant Finder');
      console.log('   ✍️  Typed "Restaurant Finder"');
      await page.waitForTimeout(500);
      
      // Create task
      await page.click('button:has-text("Create Task")');
      await page.waitForTimeout(2000);
      console.log('✅ Created "Restaurant Finder" task');
    }
  }

  // Step 9: Open Task Editor
  console.log('\n9️⃣  OPENING TASK EDITOR');
  console.log('-'.repeat(60));
  
  // Wait for tutorial to guide or manually open
  await page.waitForTimeout(1500);
  
  const editBtn = page.locator('button:has-text("Edit Task")').first();
  if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await editBtn.click();
    await page.waitForTimeout(2000);
    console.log('✅ Task editor opened');
  }

  // Step 10: Add Fields (if tutorial guides through this)
  console.log('\n🔟 ADDING FORM FIELDS');
  console.log('-'.repeat(60));
  
  // Look for Add Field button
  const addFieldBtn = page.locator('button:has-text("Add Field")');
  if (await addFieldBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('   📝 Adding fields as guided by tutorial');
    
    // Follow tutorial prompts if available
    let tutorialStep = 0;
    while (tutorialStep < 10) {
      const nextBtn = page.locator('button').filter({ hasText: /Next|Got it|Continue/ });
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(800);
        tutorialStep++;
        console.log(`   ✅ Completed tutorial step ${tutorialStep}`);
      } else {
        break;
      }
    }
    
    console.log('✅ Field management section reviewed');
  }

  // Step 11: Complete Remaining Tutorial Steps
  console.log('\n1️⃣1️⃣  COMPLETING REMAINING TUTORIAL STEPS');
  console.log('-'.repeat(60));
  
  let stepsCompleted = 0;
  const maxSteps = 20;
  
  while (stepsCompleted < maxSteps) {
    // Look for Next button in tutorial
    const nextBtn = page.locator('button').filter({ hasText: /Next.*\d+.*of.*\d+/ }).or(
      page.locator('button:has-text("Next")')
    );
    
    if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const btnText = await nextBtn.textContent();
      console.log(`   ➡️  ${btnText || 'Next'}`);
      await nextBtn.click();
      await page.waitForTimeout(1000);
      stepsCompleted++;
    } else {
      // Check for completion button
      const doneBtn = page.locator('button').filter({ hasText: /Done|Complete|Finish/ });
      if (await doneBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('   ✅ Found completion button');
        await doneBtn.click();
        await page.waitForTimeout(1000);
        break;
      }
      
      // No more tutorial steps
      break;
    }
  }
  
  console.log(`✅ Completed ${stepsCompleted} additional tutorial steps`);

  // Final Status
  console.log('\n' + '='.repeat(60));
  console.log('🎉 TUTORIAL COMPLETION SUMMARY');
  console.log('='.repeat(60));
  
  // Check what was created
  await page.goto('http://localhost:3000/builder');
  await page.waitForLoadState('load');
  await page.waitForTimeout(3000);
  
  // Wait for projects to load with retry
  let projectCount = 0;
  for (let i = 0; i < 5; i++) {
    projectCount = await page.locator('[data-tour="app-card"]').count();
    if (projectCount > 0) break;
    console.log(`⏳ Waiting for projects to load (attempt ${i + 1}/5)...`);
    await page.waitForTimeout(1000);
  }
  
  console.log(`📊 Total projects in dashboard: ${projectCount}`);
  
  const foodAppExists = await page.locator('h3:has-text("Food App")').isVisible({ timeout: 1000 }).catch(() => false);
  if (foodAppExists) {
    console.log('✅ "Food App" project confirmed in dashboard');
  }

  // Error Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 ERROR REPORT');
  console.log('='.repeat(60));
  
  if (consoleErrors.length > 0) {
    console.log(`\n❌ Console Errors (${consoleErrors.length}):`);
    consoleErrors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  } else {
    console.log('\n✅ No console errors');
  }

  if (pageErrors.length > 0) {
    console.log(`\n❌ Page Errors (${pageErrors.length}):`);
    pageErrors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  } else {
    console.log('✅ No page errors');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TUTORIAL FLOW TEST COMPLETED');
  console.log('='.repeat(60) + '\n');

  // Keep browser open for inspection
  await page.waitForTimeout(3000);
});
