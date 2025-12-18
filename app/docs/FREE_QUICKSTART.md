# Scaffold FREE Integration Quickstart

This guide will help you integrate Scaffold into your app in 5 simple steps. No API keys or authentication required for the FREE tier.

## What You'll Build

Your users will see a form in your app. When they fill it out and submit, they'll be redirected to ChatGPT with a personalized prompt ready to go.

## Step 1: Create Your App

First, create an app in Scaffold. This represents your application.

**Replace `YOUR_Scaffold_URL` with your Scaffold instance URL (e.g., `https://Scaffold.com` or `http://localhost:3000`).**

```javascript
const response = await fetch('YOUR_Scaffold_URL/api/apps', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Email Assistant',
    system_header: 'You are a professional email writing assistant.'
  })
});

const data = await response.json();
const appId = data.app.id; // Save this app_id for the next steps!
console.log('App created:', appId);
```

**Save the `app_id` from the response** - you'll need it for all the next steps.

## Step 2: Create Global Fields

Global fields are user profile fields that apply to all tasks (like name, job title, etc.).

Create two global fields: `user_name` and `job_title`:

```javascript
// Create user_name field
await fetch('YOUR_Scaffold_URL/api/global-fields', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: appId, // Use the app_id from Step 1
    field_name: 'user_name',
    field_label: 'Your Name',
    field_type: 'text',
    required: true,
    order: 1
  })
});

// Create job_title field
await fetch('YOUR_Scaffold_URL/api/global-fields', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: appId,
    field_name: 'job_title',
    field_label: 'Your Job Title',
    field_type: 'text',
    required: true,
    order: 2
  })
});
```

## Step 3: Create Task Fields

Task fields are specific to a particular task. We'll create fields for the `write_email` task.

```javascript
// Create recipient field for write_email task
await fetch('YOUR_Scaffold_URL/api/task-fields', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: appId,
    task_name: 'write_email',
    field_name: 'recipient',
    field_label: 'Email Recipient',
    field_type: 'text',
    required: true,
    order: 1
  })
});

// Create subject field for write_email task
await fetch('YOUR_Scaffold_URL/api/task-fields', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: appId,
    task_name: 'write_email',
    field_name: 'subject',
    field_label: 'Email Subject',
    field_type: 'text',
    required: true,
    order: 2
  })
});
```

## Step 4: Create a Prompt Template

The prompt template defines what ChatGPT will see. Use `{{variable_name}}` to insert user input.

```javascript
await fetch('YOUR_Scaffold_URL/api/prompt-templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: appId,
    task_name: 'write_email',
    template: `{{system_header}}

Write a professional email with the following details:

- From: {{user_name}}, {{job_title}}
- To: {{recipient}}
- Subject: {{subject}}

Please write the email body in a professional and courteous tone.`
  })
});
```

**Note:** The `{{system_header}}` variable is automatically replaced with your app's `system_header` from Step 1.

## Step 5: Embed the Form

Now embed the form in your app using an iframe:

```html
<iframe 
  src="YOUR_Scaffold_URL/embed/form?app_id=YOUR_APP_ID&task_name=write_email"
  width="100%"
  height="600"
  frameborder="0">
</iframe>
```

**Replace:**
- `YOUR_Scaffold_URL` with your Scaffold instance URL
- `YOUR_APP_ID` with the `app_id` from Step 1

## How It Works

1. User visits your app and sees the embedded form
2. User fills out the form (name, job title, recipient, subject)
3. User clicks "Generate Prompt"
4. User is redirected to ChatGPT with a personalized prompt ready to use

## Complete Example

Here's a complete HTML example you can test:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Email Assistant</title>
</head>
<body>
  <h1>Write an Email</h1>
  <iframe 
    src="YOUR_Scaffold_URL/embed/form?app_id=YOUR_APP_ID&task_name=write_email"
    width="100%"
    height="600"
    frameborder="0">
  </iframe>
</body>
</html>
```

## Field Types

You can use these field types:
- `text` - Single line text input
- `textarea` - Multi-line text input
- `select` - Dropdown (requires `options` array)
- `number` - Number input

Example with a select field:

```javascript
await fetch('YOUR_Scaffold_URL/api/task-fields', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: appId,
    task_name: 'write_email',
    field_name: 'tone',
    field_label: 'Email Tone',
    field_type: 'select',
    required: true,
    order: 3,
    options: ['Professional', 'Casual', 'Friendly', 'Formal']
  })
});
```

## Troubleshooting

- **Form not loading?** Check that your `app_id` and `task_name` match what you created
- **Fields not showing?** Make sure you created both global fields and task fields
- **Template not working?** Verify the template uses `{{field_name}}` exactly as you defined it

## Next Steps

Once you have this working, you can:
- Add more tasks (create more task fields and templates)
- Customize the form fields
- Style the iframe to match your app

Happy building! 🚀




