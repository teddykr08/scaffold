-- Clean up and recreate write_email setup for app_id: f02d65f6-64c2-4834-b0b3-14f6fc4f7522
-- This matches the FREE_QUICKSTART.md exactly

-- Step 1: Delete all existing data for this app
DELETE FROM prompt_templates 
WHERE app_id = 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522';

DELETE FROM task_fields 
WHERE app_id = 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522';

DELETE FROM global_fields 
WHERE app_id = 'f02d65f6-64c2-4834-b0b3-14f6fc4f7522';

-- Step 2: Create global fields (user_name and job_title)
INSERT INTO global_fields (app_id, field_name, field_label, field_type, required, "order")
VALUES 
  ('f02d65f6-64c2-4834-b0b3-14f6fc4f7522', 'user_name', 'Your Name', 'text', true, 1),
  ('f02d65f6-64c2-4834-b0b3-14f6fc4f7522', 'job_title', 'Your Job Title', 'text', true, 2);

-- Step 3: Create task fields for write_email (recipient and subject)
INSERT INTO task_fields (app_id, task_name, field_name, field_label, field_type, required, "order")
VALUES 
  ('f02d65f6-64c2-4834-b0b3-14f6fc4f7522', 'write_email', 'recipient', 'Email Recipient', 'text', true, 1),
  ('f02d65f6-64c2-4834-b0b3-14f6fc4f7522', 'write_email', 'subject', 'Email Subject', 'text', true, 2);

-- Step 4: Create prompt template for write_email
INSERT INTO prompt_templates (app_id, task_name, template)
VALUES (
  'f02d65f6-64c2-4834-b0b3-14f6fc4f7522',
  'write_email',
  '{{system_header}}

Write a professional email with the following details:

- From: {{user_name}}, {{job_title}}
- To: {{recipient}}
- Subject: {{subject}}

Please write the email body in a professional and courteous tone.'
);
