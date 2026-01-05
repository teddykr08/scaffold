# Quick Start: Help System Setup (5 Minutes)

## 🚀 Quick Setup Checklist

- [ ] **Step 1:** Create "Builder Help" Scaffold App (2 min)
- [ ] **Step 2:** Create "Template Improver" Scaffold App (2 min)  
- [ ] **Step 3:** Add App IDs to `.env.local` (1 min)
- [ ] **Step 4:** Restart dev server & test (optional)

---

## Step 1: Create "Builder Help" App

1. Go to **your Scaffold dashboard**
2. Click **"New App"**
3. Enter name: `Builder Help`
4. Click **Create**

### Add the explain_term task:
1. Click **"Add Task"** on the app
2. Task name: `explain_term`
3. Click **Save**
4. In the prompt section, paste:
```
You are a helpful Scaffold documentation assistant for the Scaffold form builder.

## What is Scaffold?
Scaffold is a visual form builder that lets developers create AI-powered forms without code. Developers:
1. Create an "App" (a project)
2. Add "Tasks" (specific AI workflows)
3. Define "Fields" (form inputs)
4. Write "Templates" (AI prompts with field variables)
5. Embed forms on websites

## Builder Interface Components:
- **Embed Snippet**: Shows the iframe code to embed forms on websites
- **Form Customization**: Theme, colors, fonts for the embedded form
- **Fields**: Form inputs users fill in (text, textarea, select, number)
- **Template**: The AI prompt that uses {{field_name}} variables
- **Fixed Prompt**: Hidden context sent to AI (like user ID, page URL)
- **Dynamic Context**: {{field_name}} - replaced with form data
- **Prompt Template**: Core instruction defining what AI does with the form data

Now explain this concept in 2-3 sentences for developers building with Scaffold:

<<fixed>>

Make it practical and relevant to the Scaffold builder context. Use examples from form building if helpful.
```
5. Click **Save Template**

### Copy the App ID:
1. Go back to app overview
2. Copy the **App ID** (usually a UUID)
3. Save it somewhere (you'll need it next)

---

## Step 2: Create "Template Improver" App

1. Click **"New App"**
2. Enter name: `Template Improver`
3. Click **Create**

### Add the improve_template task:
1. Click **"Add Task"**
2. Task name: `improve_template`
3. Click **Save**

### Add fields to the task:
1. Add field: `field_list` (textarea)
2. Add field: `task_purpose` (textarea)
3. Add field: `requirements` (textarea)

### Set the template:
Paste this template:
```
You are an expert at writing AI prompt templates for the Scaffold form builder.

## Understanding Scaffold:
Scaffold is a visual form builder where developers create AI-powered forms. Forms have:
- **Fields**: User inputs (text, textarea, select, number)
- **Template**: AI prompt that processes the fields
- **Output**: What the AI returns after processing

## How Templates Work in Scaffold:
1. User fills form with data
2. Each {{field_name}} gets replaced with the form data
3. Template is sent to AI as a prompt
4. AI returns the result
5. Result is shown to the user

## Best Practices for Scaffold Templates:
- Start with a role: "You are a [expert in X]"
- Use {{field_name}} variables where data goes
- Specify output format clearly
- Add constraints (tone, length, format)
- Be specific and actionable
- Test with sample data

## Your Improvement Task:
Current template:
<<fixed>>

Available form fields: {{field_list}}
Task purpose: {{task_purpose}}
Any specific requirements: {{requirements}}

Improve this template by:
- Adding a clear role/persona if missing
- Making instructions more specific
- Placing {{field_name}} variables logically
- Specifying exact output format
- Adding helpful constraints
- Keeping all original {{field_name}} variables
- Following Scaffold best practices

Output: Provide ONLY the improved template in a code block, ready to copy directly into Scaffold.
```

5. Click **Save Template**

### Copy the App ID:
1. Go back to app overview
2. Copy the **App ID**

---

## Step 3: Update .env.local

Add these lines to your `.env.local` file:

```bash
NEXT_PUBLIC_HELP_APP_ID=paste_builder_help_app_id_here
NEXT_PUBLIC_IMPROVER_APP_ID=paste_template_improver_app_id_here
```

Replace the values with the actual App IDs you copied above.

---

## Step 4: Test (Optional)

1. **Restart dev server** (if running)
2. **Go to any task editor**
3. **Hover over ℹ️ icons** - Should show explanations
4. **Click "✨ Improve Template"** - Modal should open

---

## ✅ You're Done!

Your Scaffold builder now has:
- ✨ Contextual help tooltips throughout
- ✨ AI-powered template improvement
- ✨ Smooth, integrated user experience

## Need Help?

- **Icons not showing?** Check that `NEXT_PUBLIC_HELP_APP_ID` is correct in `.env.local`
- **Improver not working?** Verify `NEXT_PUBLIC_IMPROVER_APP_ID` is set correctly
- **Full details?** See `HELP_SYSTEM_SETUP.md` for comprehensive documentation

---

**That's it! Everything else was already integrated into the code.**
