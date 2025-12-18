/**
 * Setup script for app_id: f02d65f6-64c2-4834-b0b3-14f6fc4f7522
 * This creates the exact setup described in docs/FREE_QUICKSTART.md
 * 
 * Run this AFTER running the SQL cleanup script (migrations/002_cleanup_write_email_setup.sql)
 * 
 * Usage: node scripts/setup-write-email-quickstart.js [YOUR_Scaffold_URL]
 * Example: node scripts/setup-write-email-quickstart.js http://localhost:3000
 */

const Scaffold_URL = process.argv[2] || 'http://localhost:3000';
const APP_ID = 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522';

async function makeRequest(endpoint, method, body) {
  const url = `${Scaffold_URL}${endpoint}`;
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(`Failed: ${data.error || JSON.stringify(data)}`);
  }
  return data;
}

async function setup() {
  console.log(`Setting up write_email for app_id: ${APP_ID}`);
  console.log(`Using Scaffold URL: ${Scaffold_URL}\n`);

  try {
    // Step 1: Create global field: user_name
    console.log('Creating global field: user_name...');
    await makeRequest('/api/global-fields', 'POST', {
      app_id: APP_ID,
      field_name: 'user_name',
      field_label: 'Your Name',
      field_type: 'text',
      required: true,
      order: 1,
    });
    console.log('✓ Created user_name field\n');

    // Step 2: Create global field: job_title
    console.log('Creating global field: job_title...');
    await makeRequest('/api/global-fields', 'POST', {
      app_id: APP_ID,
      field_name: 'job_title',
      field_label: 'Your Job Title',
      field_type: 'text',
      required: true,
      order: 2,
    });
    console.log('✓ Created job_title field\n');

    // Step 3: Create task field: recipient
    console.log('Creating task field: recipient...');
    await makeRequest('/api/task-fields', 'POST', {
      app_id: APP_ID,
      task_name: 'write_email',
      field_name: 'recipient',
      field_label: 'Email Recipient',
      field_type: 'text',
      required: true,
      order: 1,
    });
    console.log('✓ Created recipient field\n');

    // Step 4: Create task field: subject
    console.log('Creating task field: subject...');
    await makeRequest('/api/task-fields', 'POST', {
      app_id: APP_ID,
      task_name: 'write_email',
      field_name: 'subject',
      field_label: 'Email Subject',
      field_type: 'text',
      required: true,
      order: 2,
    });
    console.log('✓ Created subject field\n');

    // Step 5: Create prompt template
    console.log('Creating prompt template...');
    await makeRequest('/api/prompt-templates', 'POST', {
      app_id: APP_ID,
      task_name: 'write_email',
      template: `{{system_header}}

Write a professional email with the following details:

- From: {{user_name}}, {{job_title}}
- To: {{recipient}}
- Subject: {{subject}}

Please write the email body in a professional and courteous tone.`,
    });
    console.log('✓ Created prompt template\n');

    console.log('✅ Setup complete!');
    console.log(`\nEmbed URL: ${Scaffold_URL}/embed/form?app_id=${APP_ID}&task_name=write_email`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setup();


