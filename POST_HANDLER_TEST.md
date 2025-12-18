# POST Handler Testing Guide

## ✅ What Was Done

1. **POST handler added** to `/app/api/prompt-templates/route.ts`
   - Follows the same error handling patterns as `/app/api/apps/route.ts`
   - Uses `supabaseServer` for database operations
   - Inserts `app_id`, `task_name`, and `template` into `prompt_templates` table
   - Returns `{ success: true, template: data }`

2. **Features:**
   - ✅ Validates required fields (`app_id`, `task_name`, `template`)
   - ✅ Validates template is a non-empty string
   - ✅ Comprehensive error handling with detailed logging
   - ✅ Handles duplicate key errors (409 status)
   - ✅ Handles RLS policy errors
   - ✅ Environment variable error detection

## 🔄 Server Restart

Next.js dev server automatically reloads when route files change. If you need to manually restart:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## 🧪 Testing Instructions

### Test 1: Create a New Template (Success Case)

Run this in your browser console (while on `localhost:3000`):

```javascript
fetch('/api/prompt-templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    app_id: 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522',
    task_name: 'write_email',
    template: `{{system_header}}

User: {{user_name}} ({{job_title}} at {{company}})

Write a {{email_tone}} email to {{email_recipient}}.
Subject: {{email_subject}}`
  })
})
  .then(response => response.json())
  .then(data => {
    console.log('✅ POST Result:', data);
    if (data.success) {
      console.log('Template created:', data.template);
    }
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
```

**Expected Result:**
- Status: 200
- Response: `{ success: true, template: { id: "...", app_id: "...", task_name: "write_email", template: "...", created_at: "..." } }`

### Test 2: Missing Required Fields (Error Case)

```javascript
fetch('/api/prompt-templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    app_id: 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522'
    // Missing task_name and template
  })
})
  .then(response => response.json())
  .then(data => {
    console.log('❌ Should show error:', data);
  });
```

**Expected Result:**
- Status: 400
- Response: `{ success: false, error: "Missing required fields: app_id, task_name, and template are required" }`

### Test 3: Empty Template (Error Case)

```javascript
fetch('/api/prompt-templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    app_id: 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522',
    task_name: 'write_email',
    template: ''  // Empty template
  })
})
  .then(response => response.json())
  .then(data => {
    console.log('❌ Should show error:', data);
  });
```

**Expected Result:**
- Status: 400
- Response: `{ success: false, error: "Template must be a non-empty string" }`

### Test 4: Verify Template Was Created

```javascript
fetch('/api/prompt-templates?app_id=f02d65f6-64c2-4834-b0b3-14f6fc4f7522&task_name=write_email')
  .then(response => response.json())
  .then(data => {
    console.log('📋 Templates:', data);
    if (data.success && data.templates.length > 0) {
      console.log('✅ Template found!');
      data.templates.forEach(t => {
        console.log(`- ID: ${t.id}, task_name: "${t.task_name}"`);
      });
    }
  });
```

**Expected Result:**
- Status: 200
- Response: `{ success: true, templates: [{ id: "...", app_id: "...", task_name: "write_email", template: "...", ... }] }`

### Test 5: Duplicate Template (If Unique Constraint Exists)

Try creating the same template twice:

```javascript
// Run Test 1 twice with the same app_id and task_name
// Second attempt should fail if there's a unique constraint
```

**Expected Result (if unique constraint exists):**
- Status: 409
- Response: `{ success: false, error: "A template already exists for this app and task combination" }`

## 📋 Complete Test Script

Run this all-in-one test in your browser console:

```javascript
(async () => {
  const APP_ID = 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522';
  
  console.log('🧪 Testing POST /api/prompt-templates\n');
  
  // Test 1: Create template
  console.log('Test 1: Creating template...');
  const createResponse = await fetch('/api/prompt-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: APP_ID,
      task_name: 'write_email',
      template: `{{system_header}}\n\nUser: {{user_name}} ({{job_title}} at {{company}})\n\nWrite a {{email_tone}} email to {{email_recipient}}.\nSubject: {{email_subject}}`
    })
  });
  
  const createData = await createResponse.json();
  console.log('Result:', createData);
  
  if (createData.success) {
    console.log('✅ Template created successfully!\n');
    
    // Test 2: Verify it was created
    console.log('Test 2: Verifying template exists...');
    const verifyResponse = await fetch(`/api/prompt-templates?app_id=${APP_ID}&task_name=write_email`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success && verifyData.templates.length > 0) {
      console.log('✅ Template verified!');
      console.log('Template ID:', verifyData.templates[0].id);
    } else {
      console.log('❌ Template not found after creation');
    }
  } else {
    console.log('❌ Template creation failed:', createData.error);
  }
  
  console.log('\n✨ Testing complete!');
})();
```

## ✅ Success Criteria

- ✅ POST request creates a new template in the database
- ✅ Returns `{ success: true, template: {...} }` on success
- ✅ Returns appropriate error messages for validation failures
- ✅ Template can be retrieved via GET endpoint after creation
- ✅ Error handling works correctly (missing fields, empty template, etc.)

## 📝 Notes

- The POST handler follows the same patterns as the apps route
- Uses `supabaseServer` with service role key for database operations
- Comprehensive error logging for debugging
- Handles edge cases like duplicate keys and RLS errors










