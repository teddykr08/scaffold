# 🎯 Quick Reference: Updated Prompts

## What You Need to Copy

### For "Builder Help" App → "explain_term" Task

Copy this exact template into your Scaffold app:

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

---

### For "Template Improver" App → "improve_template" Task

Copy this exact template into your Scaffold app:

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
Any specific requirements: {{additional_constraints}}

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

---

## How to Update

### Step 1: Builder Help App
1. Go to your Scaffold dashboard
2. Open "Builder Help" app
3. Click on "explain_term" task
4. Go to the template section
5. Clear the old template
6. Paste the new "Builder Help" template above
7. Click Save

### Step 2: Template Improver App
1. Open "Template Improver" app
2. Click on "improve_template" task
3. Go to the template section
4. Clear the old template
5. Paste the new "Template Improver" template above
6. Click Save

### Step 3: Done!
Your help system will now use the new Scaffold-aware prompts.

---

## What's Improved

### Builder Help
- ✅ AI knows what Scaffold is
- ✅ AI understands builder components
- ✅ Explanations are Scaffold-specific
- ✅ Examples are form-building focused

### Template Improver
- ✅ AI knows how Scaffold templates work
- ✅ AI follows Scaffold best practices
- ✅ Improvements use proper {{field}} syntax
- ✅ Results are production-ready

---

## Key Changes at a Glance

| Item | Change |
|------|--------|
| **Builder Help** | Now teaches Scaffold context |
| **Template Improver** | Now follows Scaffold best practices |
| **Explanations** | Now Scaffold-specific |
| **Quality** | Much improved |
| **Setup** | Copy & paste (easy) |
| **Code** | No changes needed |

---

## Files with Updated Prompts

All these files contain the new prompts:
- **QUICK_START.md** ← Best reference
- **HELP_SYSTEM_SETUP.md**
- **FEATURES_README.md**
- **IMPLEMENTATION_SUMMARY.md**

Use any of them to copy the templates.

---

## Questions?

See these files for more info:
- **PROMPTS_UPDATED.md** - What changed and why
- **PROMPTS_BEFORE_AFTER.md** - Side-by-side comparison
- **QUICK_START.md** - Setup instructions

---

**Ready to update? Just copy the templates above into your Scaffold apps!** 🚀
