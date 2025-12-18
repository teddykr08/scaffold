# Verification and Update Steps

## Overview
Verify and update `prompt_templates` rows for app_id `f02d65f6-64c2-4834-b0b3-14f6fc4f7522` to ensure `task_name` is exactly `"write_email"`.

## Steps

### Step 1: Check Current Templates
Run this in your browser console (while on your app domain, e.g., localhost:3000):

```javascript
// Check current templates
fetch('/api/prompt-templates?app_id=f02d65f6-64c2-4834-b0b3-14f6fc4f7522')
  .then(r => r.json())
  .then(data => {
    console.log('Current templates:', data);
    if (data.success && data.templates) {
      data.templates.forEach(t => {
        console.log(`- ID: ${t.id}, task_name: "${t.task_name}"`);
      });
    }
    return data;
  });
```

### Step 2: Update if Needed
If any template has a different `task_name`, update it:

```javascript
// Update template (replace TEMPLATE_ID with actual ID)
fetch('/api/prompt-templates', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522',
    id: 'TEMPLATE_ID', // Replace with actual template ID
    new_task_name: 'write_email'
  })
})
  .then(r => r.json())
  .then(data => console.log('Update result:', data));
```

### Step 3: Verify Update
Check that the update was successful:

```javascript
// Verify templates have correct task_name
fetch('/api/prompt-templates?app_id=f02d65f6-64c2-4834-b0b3-14f6fc4f7522&task_name=write_email')
  .then(r => r.json())
  .then(data => {
    console.log('Verification result:', data);
    if (data.success && data.templates.length > 0) {
      console.log('✅ Templates verified!');
      data.templates.forEach(t => {
        console.log(`- ID: ${t.id}, task_name: "${t.task_name}"`);
      });
    }
  });
```

### Step 4: Test generate-prompt
Test the generate-prompt endpoint:

```javascript
// Test generate-prompt
fetch('/api/generate-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522',
    task_name: 'write_email',
    global_values: {
      user_name: 'John Doe',
      job_title: 'Software Engineer',
      company: 'Tech Corp'
    },
    task_values: {
      email_tone: 'professional',
      email_recipient: 'client@example.com',
      email_subject: 'Project Update'
    }
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('Generate-prompt result:', data);
    if (data.success) {
      console.log('✅ Prompt generated successfully!');
      console.log('Prompt:', data.prompt);
      console.log('ChatGPT URL:', data.chatgpt_url);
    }
  });
```

## Complete Automated Script

Run this all-in-one script in your browser console:

```javascript
(async () => {
  const APP_ID = 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522';
  const EXPECTED_TASK_NAME = 'write_email';
  
  console.log('🔍 Starting verification...\n');
  
  // Step 1: Check current templates
  const getResponse = await fetch(`/api/prompt-templates?app_id=${APP_ID}`);
  const getData = await getResponse.json();
  
  if (!getData.success) {
    console.error('❌ Failed to fetch templates:', getData.error);
    return;
  }
  
  const templates = getData.templates || [];
  console.log(`📋 Found ${templates.length} template(s)\n`);
  
  // Step 2: Check and update
  let updated = false;
  for (const template of templates) {
    console.log(`Template ID: ${template.id}`);
    console.log(`  Current task_name: "${template.task_name}"`);
    
    if (template.task_name !== EXPECTED_TASK_NAME) {
      console.log(`  ⚠️  Updating to "${EXPECTED_TASK_NAME}"...`);
      
      const patchResponse = await fetch('/api/prompt-templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: APP_ID,
          id: template.id,
          new_task_name: EXPECTED_TASK_NAME
        })
      });
      
      const patchData = await patchResponse.json();
      if (patchData.success) {
        console.log(`  ✅ Updated successfully\n`);
        updated = true;
      } else {
        console.error(`  ❌ Update failed: ${patchData.error}\n`);
      }
    } else {
      console.log(`  ✅ Already correct\n`);
    }
  }
  
  // Step 3: Verify
  const verifyResponse = await fetch(`/api/prompt-templates?app_id=${APP_ID}&task_name=${EXPECTED_TASK_NAME}`);
  const verifyData = await verifyResponse.json();
  
  if (verifyData.success && verifyData.templates.length > 0) {
    console.log(`✅ Verification: ${verifyData.templates.length} template(s) with task_name = "${EXPECTED_TASK_NAME}"\n`);
  } else {
    console.log('❌ Verification failed\n');
    return;
  }
  
  // Step 4: Test generate-prompt
  console.log('🧪 Testing generate-prompt endpoint...\n');
  
  const testResponse = await fetch('/api/generate-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: APP_ID,
      task_name: EXPECTED_TASK_NAME,
      global_values: {
        user_name: 'John Doe',
        job_title: 'Software Engineer',
        company: 'Tech Corp'
      },
      task_values: {
        email_tone: 'professional',
        email_recipient: 'client@example.com',
        email_subject: 'Project Update'
      }
    })
  });
  
  const testData = await testResponse.json();
  
  if (testData.success) {
    console.log('✅ Generate-prompt test PASSED!\n');
    console.log('Generated Prompt:');
    console.log('-'.repeat(60));
    console.log(testData.prompt);
    console.log('-'.repeat(60));
    console.log(`\nChatGPT URL: ${testData.chatgpt_url}\n`);
  } else {
    console.error('❌ Generate-prompt test FAILED:', testData.error);
  }
  
  console.log('✨ Verification complete!');
})();
```










