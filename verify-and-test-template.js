/**
 * Complete verification and testing script
 * Usage: node verify-and-test-template.js
 * 
 * Make sure your dev server is running: npm run dev
 */

const APP_ID = "f02d65f6-64c2-4834-b0b3-14f6fc4f7522";
const EXPECTED_TASK_NAME = "write_email";
const API_BASE = process.env.API_BASE || "http://localhost:3000/api";

async function fetchJSON(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
      throw new Error(
        `❌ Cannot connect to API at ${API_BASE}. Make sure your dev server is running: npm run dev`
      );
    }
    throw error;
  }
}

async function verifyAndUpdate() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 VERIFICATION AND UPDATE SCRIPT");
  console.log("=".repeat(60));
  console.log(`App ID: ${APP_ID}`);
  console.log(`Expected task_name: "${EXPECTED_TASK_NAME}"`);
  console.log(`API Base: ${API_BASE}\n`);

  try {
    // Step 1: Query all templates for this app_id
    console.log("📡 Step 1: Fetching templates...");
    const getUrl = `${API_BASE}/prompt-templates?app_id=${APP_ID}`;
    console.log(`   GET ${getUrl}\n`);
    
    const getResult = await fetchJSON(getUrl);

    if (!getResult.success) {
      throw new Error(`GET failed: ${getResult.error}`);
    }

    const templates = getResult.templates || [];

    if (templates.length === 0) {
      console.log("❌ No templates found for this app_id.\n");
      console.log("   You need to create a template first using:");
      console.log("   POST /api/prompt-templates with app_id and task_name\n");
      return { success: false, message: "No templates found" };
    }

    console.log(`✅ Found ${templates.length} template(s):\n`);

    let needsUpdate = false;
    const rowsToUpdate = [];

    // Step 2: Check each template
    templates.forEach((template, index) => {
      console.log(`   Template ${index + 1}:`);
      console.log(`     ID: ${template.id}`);
      console.log(`     task_name: "${template.task_name}"`);
      const preview = (template.template || "").substring(0, 60).replace(/\n/g, " ");
      console.log(`     Preview: ${preview}...`);

      if (template.task_name !== EXPECTED_TASK_NAME) {
        console.log(`     ⚠️  NEEDS UPDATE: "${template.task_name}" → "${EXPECTED_TASK_NAME}"`);
        needsUpdate = true;
        rowsToUpdate.push(template);
      } else {
        console.log(`     ✅ Correct`);
      }
      console.log("");
    });

    // Step 3: Update if needed
    if (needsUpdate) {
      console.log(`\n🔄 Step 2: Updating ${rowsToUpdate.length} row(s)...\n`);

      for (const template of rowsToUpdate) {
        console.log(`   Updating template ID: ${template.id}`);
        
        const patchUrl = `${API_BASE}/prompt-templates`;
        const patchResult = await fetchJSON(patchUrl, {
          method: "PATCH",
          body: JSON.stringify({
            app_id: APP_ID,
            id: template.id,
            new_task_name: EXPECTED_TASK_NAME,
          }),
        });

        if (!patchResult.success) {
          console.error(`     ❌ Failed: ${patchResult.error}\n`);
        } else {
          console.log(`     ✅ Updated successfully\n`);
        }
      }
    } else {
      console.log("✅ Step 2: All templates already have the correct task_name.\n");
    }

    // Step 4: Verify final state
    console.log("🔍 Step 3: Verifying final state...\n");
    const verifyUrl = `${API_BASE}/prompt-templates?app_id=${APP_ID}&task_name=${encodeURIComponent(EXPECTED_TASK_NAME)}`;
    const verifyResult = await fetchJSON(verifyUrl);

    if (!verifyResult.success) {
      throw new Error(`Verification failed: ${verifyResult.error}`);
    }

    const finalTemplates = verifyResult.templates || [];

    if (finalTemplates.length === 0) {
      console.log("❌ No templates found with task_name = 'write_email' after update.\n");
      return { success: false, message: "Verification failed" };
    }

    console.log(`✅ Verified: ${finalTemplates.length} template(s) with task_name = 'write_email'`);
    finalTemplates.forEach((template) => {
      console.log(`   - ID: ${template.id}, task_name: "${template.task_name}"`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("✨ VERIFICATION COMPLETE");
    console.log("=".repeat(60) + "\n");

    return { success: true, templates: finalTemplates };
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    return { success: false, error: error.message };
  }
}

async function testGeneratePrompt() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 TESTING generate-prompt ENDPOINT");
  console.log("=".repeat(60) + "\n");

  try {
    const testData = {
      app_id: APP_ID,
      task_name: EXPECTED_TASK_NAME,
      global_values: {
        user_name: "John Doe",
        job_title: "Software Engineer",
        company: "Tech Corp",
      },
      task_values: {
        email_tone: "professional",
        email_recipient: "client@example.com",
        email_subject: "Project Update",
      },
    };

    console.log("📡 POST /api/generate-prompt");
    console.log("   Request body:");
    console.log(JSON.stringify(testData, null, 2) + "\n");

    const result = await fetchJSON(`${API_BASE}/generate-prompt`, {
      method: "POST",
      body: JSON.stringify(testData),
    });

    if (!result.success) {
      console.error("❌ Test failed:");
      console.error(`   Error: ${result.error}`);
      if (result.hint) {
        console.error(`   Hint: ${result.hint}`);
      }
      return { success: false, error: result.error };
    }

    console.log("✅ Test successful!\n");
    console.log("📄 Generated Prompt:");
    console.log("-".repeat(60));
    console.log(result.prompt);
    console.log("-".repeat(60));
    console.log(`\n🔗 ChatGPT URL: ${result.chatgpt_url}\n`);

    console.log("=".repeat(60));
    console.log("✨ GENERATE-PROMPT TEST COMPLETE");
    console.log("=".repeat(60) + "\n");

    return { success: true, result };
  } catch (error) {
    console.error("\n❌ TEST ERROR:", error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  // Verify and update templates
  const verifyResult = await verifyAndUpdate();

  if (!verifyResult.success) {
    console.error("\n❌ Verification failed. Cannot proceed with testing.");
    process.exit(1);
  }

  // Test generate-prompt endpoint
  const testResult = await testGeneratePrompt();

  if (!testResult.success) {
    console.error("\n❌ Generate-prompt test failed.");
    process.exit(1);
  }

  console.log("\n🎉 ALL TESTS PASSED!\n");
  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { verifyAndUpdate, testGeneratePrompt };








