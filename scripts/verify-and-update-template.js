/**
 * Script to verify and update prompt_templates rows
 * Ensures task_name is exactly "write_email" for the given app_id
 */

const APP_ID = "f02d65f6-64c2-4834-b0b3-14f6fc4f7522";
const EXPECTED_TASK_NAME = "write_email";

async function verifyAndUpdate() {
  try {
    // Load environment variables
    require("dotenv").config({ path: ".env.local" });

    const { createClient } = require("@supabase/supabase-js");

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    console.log(`\n🔍 Checking prompt_templates for app_id: ${APP_ID}\n`);

    // Step 1: Query all templates for this app_id
    const { data: templates, error: queryError } = await supabase
      .from("prompt_templates")
      .select("*")
      .eq("app_id", APP_ID)
      .order("updated_at", { ascending: false });

    if (queryError) {
      throw new Error(`Query error: ${queryError.message}`);
    }

    if (!templates || templates.length === 0) {
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
      console.log(`   Template preview: ${(template.template || "").substring(0, 50)}...`);

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
        const { data: updated, error: updateError } = await supabase
          .from("prompt_templates")
          .update({ task_name: EXPECTED_TASK_NAME })
          .eq("id", template.id)
          .select()
          .single();

        if (updateError) {
          console.error(`   ❌ Error updating template ${template.id}: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated template ${template.id}: task_name is now "${EXPECTED_TASK_NAME}"`);
        }
      }
    } else {
      console.log("✅ All templates already have the correct task_name.\n");
    }

    // Step 4: Verify final state
    console.log("\n🔍 Verifying final state...\n");
    const { data: finalTemplates, error: finalError } = await supabase
      .from("prompt_templates")
      .select("*")
      .eq("app_id", APP_ID)
      .eq("task_name", EXPECTED_TASK_NAME)
      .order("updated_at", { ascending: false });

    if (finalError) {
      throw new Error(`Verification error: ${finalError.message}`);
    }

    if (!finalTemplates || finalTemplates.length === 0) {
      console.log("❌ No templates found with task_name = 'write_email' after update.");
    } else {
      console.log(`✅ Verified: ${finalTemplates.length} template(s) with task_name = 'write_email'`);
      for (const template of finalTemplates) {
        console.log(`   - ID: ${template.id}, task_name: "${template.task_name}"`);
      }
    }

    console.log("\n✨ Verification and update complete!\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

verifyAndUpdate();










