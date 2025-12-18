/**
 * Script to verify and update prompt_templates via API
 * Run this after starting the dev server (npm run dev)
 */

const APP_ID = "f02d65f6-64c2-4834-b0b3-14f6fc4f7522";
const EXPECTED_TASK_NAME = "write_email";
const API_BASE = "http://localhost:3000/api";

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function verifyAndUpdate() {
  try {
    console.log(`\n🔍 Checking prompt_templates for app_id: ${APP_ID}\n`);

    // Step 1: Query all templates for this app_id
    const getUrl = `${API_BASE}/prompt-templates?app_id=${APP_ID}`;
    console.log(`📡 GET ${getUrl}`);
    
    const getResult = await fetchJSON(getUrl);

    if (!getResult.success) {
      throw new Error(`GET failed: ${getResult.error}`);
    }

    const templates = getResult.templates || [];

    if (templates.length === 0) {
      console.log("❌ No templates found for this app_id.");
      console.log("   You may need to create a template first using POST /api/prompt-templates");
      return;
    }

    console.log(`📋 Found ${templates.length} template(s) for this app:\n`);

    let needsUpdate = false;
    let rowsToUpdate = [];

    // Step 2: Check each template
    for (const template of templates) {
      console.log(`   Template ID: ${template.id}`);
      console.log(`   Current task_name: "${template.task_name}"`);
      const templatePreview = (template.template || "").substring(0, 50);
      console.log(`   Template preview: ${templatePreview}...`);

      if (template.task_name !== EXPECTED_TASK_NAME) {
        console.log(`   ⚠️  Task name needs update: "${template.task_name}" → "${EXPECTED_TASK_NAME}"`);
        needsUpdate = true;
        rowsToUpdate.push(template);
      } else {
        console.log(`   ✅ Task name is correct`);
      }
      console.log("");
    }

    // Step 3: Update if needed
    if (needsUpdate) {
      console.log(`\n🔄 Updating ${rowsToUpdate.length} row(s)...\n`);

      for (const template of rowsToUpdate) {
        const patchUrl = `${API_BASE}/prompt-templates`;
        console.log(`📡 PATCH ${patchUrl}`);
        console.log(`   Updating template ${template.id}...`);

        const patchResult = await fetchJSON(patchUrl, {
          method: "PATCH",
          body: JSON.stringify({
            app_id: APP_ID,
            id: template.id,
            new_task_name: EXPECTED_TASK_NAME,
          }),
        });

        if (!patchResult.success) {
          console.error(`   ❌ Error: ${patchResult.error}`);
        } else {
          console.log(`   ✅ Updated: task_name is now "${EXPECTED_TASK_NAME}"`);
        }
      }
    } else {
      console.log("✅ All templates already have the correct task_name.\n");
    }

    // Step 4: Verify final state
    console.log("\n🔍 Verifying final state...\n");
    const verifyUrl = `${API_BASE}/prompt-templates?app_id=${APP_ID}&task_name=${EXPECTED_TASK_NAME}`;
    console.log(`📡 GET ${verifyUrl}`);

    const verifyResult = await fetchJSON(verifyUrl);

    if (!verifyResult.success) {
      throw new Error(`Verification failed: ${verifyResult.error}`);
    }

    const finalTemplates = verifyResult.templates || [];

    if (finalTemplates.length === 0) {
      console.log("❌ No templates found with task_name = 'write_email' after update.");
    } else {
      console.log(`✅ Verified: ${finalTemplates.length} template(s) with task_name = 'write_email'`);
      for (const template of finalTemplates) {
        console.log(`   - ID: ${template.id}, task_name: "${template.task_name}"`);
      }
    }

    console.log("\n✨ Verification and update complete!\n");
    return { success: true, templates: finalTemplates };
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.cause) {
      console.error("   Cause:", error.cause);
    }
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  verifyAndUpdate()
    .then(() => {
      console.log("✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error.message);
      process.exit(1);
    });
}

module.exports = { verifyAndUpdate };








