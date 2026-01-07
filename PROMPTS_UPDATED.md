# Updated Prompts with Scaffold Context

## What Changed

All system prompts for the Help and Template Improver apps have been updated to include:

1. **What Scaffold is** - Definition and core concepts
2. **How the builder works** - Components and their purposes
3. **Key terminology** - Definitions of form fields, templates, etc.
4. **Best practices** - Guidelines for building with Scaffold
5. **Context awareness** - References to builder interface and workflow

## Updated Files

### 1. QUICK_START.md
- **Builder Help template** - Now explains Scaffold, builder components, and terminology
- **Template Improver template** - Now explains how templates work in Scaffold and best practices

### 2. HELP_SYSTEM_SETUP.md
- **Builder Help template** - Comprehensive context about Scaffold
- **Template Improver template** - Detailed explanation of template best practices

### 3. FEATURES_README.md
- **Template Improver template** - Updated with Scaffold context

### 4. IMPLEMENTATION_SUMMARY.md
- **Both templates** - Updated with full context

## Builder Help Template Now Includes:

### What is Scaffold?
```
Scaffold is a visual form builder that lets developers create 
AI-powered forms without code. Developers:
1. Create an "App" (a project)
2. Add "Tasks" (specific AI workflows)
3. Define "Fields" (form inputs)
4. Write "Templates" (AI prompts with field variables)
5. Embed forms on websites
```

### Builder Interface Components:
- **Embed Snippet** - Shows iframe code to embed forms
- **Form Customization** - Theme, colors, fonts
- **Fields** - Form inputs users fill in
- **Template** - AI prompt with {{field_name}} variables
- **Fixed Prompt** - Hidden context for AI
- **Dynamic Context** - Variables replaced with form data
- **Prompt Template** - Core AI instruction

## Template Improver Template Now Includes:

### Understanding Scaffold:
```
Scaffold is a visual form builder where developers 
create AI-powered forms. Forms have:
- Fields: User inputs
- Template: AI prompt processing the fields
- Output: What AI returns
```

### How Templates Work:
```
1. User fills form with data
2. Each {{field_name}} gets replaced with form data
3. Template is sent to AI as a prompt
4. AI returns the result
5. Result is shown to the user
```

### Best Practices:
```
- Start with a role: "You are a [expert in X]"
- Use {{field_name}} variables where data goes
- Specify output format clearly
- Add constraints (tone, length, format)
- Be specific and actionable
- Test with sample data
```

## Why These Updates Matter

### For the Help System:
The AI chatbot now understands:
- What Scaffold is and how it works
- The builder interface and terminology
- What each term means in context
- How to explain concepts to builders

This means explanations will be:
- More specific to Scaffold
- Better contextualized
- More helpful for builders
- More aligned with Scaffold terminology

### For the Template Improver:
The AI now knows:
- How templates work in Scaffold
- What best practices are
- What field variables are
- How to improve templates specifically for Scaffold

This means improved templates will:
- Follow Scaffold best practices
- Use proper variable syntax
- Have clear instructions
- Be production-ready

## Implementation Notes

**No code changes needed** - Just update the prompts in your Scaffold apps:

1. Go to "Builder Help" app
2. Edit "explain_term" task template
3. Replace with the new template from QUICK_START.md
4. Go to "Template Improver" app
5. Edit "improve_template" task template
6. Replace with the new template from QUICK_START.md

The system will automatically use the new prompts.

## Benefits

✅ **Better explanations** - Help icons provide more relevant context
✅ **Smarter improvements** - Template improver understands Scaffold specifics
✅ **Reduced confusion** - AI knows what developers are building
✅ **Higher quality** - Prompts are Scaffold-aware and contextual
✅ **Professional** - Responses sound like Scaffold documentation
✅ **Accurate terminology** - Uses proper Scaffold terms and concepts

## Files to Reference

When setting up your apps, use the templates from:
- **QUICK_START.md** - Most straightforward
- **HELP_SYSTEM_SETUP.md** - Most detailed
- **IMPLEMENTATION_SUMMARY.md** - For reference

All three have the same updated prompts.

---

**The prompts are now ready to copy directly into your Scaffold apps!**
## Builder Help - `explain_term` Task Template (plain prompt text)

Use this exact prompt text as the `explain_term` task template in your Builder Help app. It explains the `<<fixed>>` (fixed field) concept in simple language, includes one clear example, and is designed to produce a short (3–5 bullet) answer ending with "Any Questions?".

You are a helpful assistant explaining features of Scaffold, an AI prompt builder tool. Keep the explanation very short and simple — use language a 9-year-old would understand. Use 3–5 bullet points, give ONE clear example specific to the term, and end with the phrase "Any Questions?".

Context about Scaffold (you may use this to explain briefly):
- Scaffold helps people create AI-powered forms they can embed on websites.
- Apps contain Tasks; Tasks have a Prompt Template and Fields.
- Fixed fields are hidden values passed into a Task via the embed URL and are not shown or editable by the user filling the form.

Task: Explain the term "<<fixed>>" (also called a Fixed Field) in simple terms. Follow these rules strictly:
- Keep it 3–5 short bullet points (each 1 sentence max).
- Use as little jargon as possible and write for a 9-year-old.
- Give ONE clear, concrete example (show how the fixed field is set via URL and how it changes output).
- End the message with exactly: Any Questions?

Example of the expected one-shot answer (what the Help system should return):
- Fixed Field: A secret piece of information added to the form that people filling the form never see.
- It travels with the form when embedded on a page and can change the AI's result per page.
- Example: If the embed uses `?fixed=Chicken%20Parmesan` the task can use `{{fixed}}` in the prompt to generate a recipe for Chicken Parmesan.
- Use Fixed Fields to make the SAME task return different results on different pages (like different dishes or topics).
- Any Questions?

Paste the prompt text above into the `explain_term` task template (do not paste HTML). The Help system will use the Fixed Field values you pass via the embed URL (for example `?fixed=Vegan%20Tacos`) together with this template to render the (i) help content.
