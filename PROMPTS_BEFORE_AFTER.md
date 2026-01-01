# 🔄 Prompt Updates: Before & After Comparison

## Builder Help Template

### ❌ Before (Old Prompt)
```
You are a helpful Scaffold documentation assistant. 
Explain this concept in 2-3 sentences for developers 
building with Scaffold:

<<fixed>>

Keep it concise and practical.
```

**Problem:** The AI doesn't know what Scaffold is, so explanations lack context.

### ✅ After (New Prompt)
```
You are a helpful Scaffold documentation assistant for the Scaffold form builder.

## What is Scaffold?
Scaffold is a visual form builder that lets developers create AI-powered 
forms without code. Developers:
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

Make it practical and relevant to the Scaffold builder context. 
Use examples from form building if helpful.
```

**Benefit:** AI understands Scaffold, builder components, and can provide contextual explanations.

---

## Template Improver Template

### ❌ Before (Old Prompt)
```
You are an expert at writing AI prompt templates for Scaffold.

Current template:
<<fixed>>

Available fields: {{field_list}}
Task purpose: {{task_purpose}}
Additional constraints: {{additional_constraints}}

Provide an improved version that:
- Uses clear, specific instructions
- Places field variables logically
- Follows best practices for AI prompts
- Maintains the same field variables if possible
- Is practical and actionable

Format: Provide ONLY the improved template text, ready to copy.
```

**Problem:** Generic advice that doesn't address Scaffold-specific patterns.

### ✅ After (New Prompt)
```
You are an expert at writing AI prompt templates for the Scaffold form builder.

## Understanding Scaffold:
Scaffold is a visual form builder where developers create AI-powered forms. 
Forms have:
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

Output: Provide ONLY the improved template in a code block, 
ready to copy directly into Scaffold.
```

**Benefit:** AI provides Scaffold-specific improvements that follow best practices.

---

## Key Differences

| Aspect | Before | After |
|--------|--------|-------|
| Context | Generic | Scaffold-specific |
| Terminology | May not use proper terms | Uses Scaffold terminology |
| Explanations | Vague | Detailed with examples |
| Best Practices | General AI practices | Scaffold-specific patterns |
| Practical Guidance | Minimal | Step-by-step process |
| Builder Understanding | None | Comprehensive |

---

## Example Improvements

### Help Tooltip - "Template Variables" Explanation

**Before (without context):**
> "Template variables are placeholders in text that get replaced with data."

**After (with context):**
> "In Scaffold, template variables like {{field_name}} are placeholders that get replaced with form data. When a user fills out a form field called 'topic', {{topic}} becomes 'machine learning', and the AI sees the full context in the prompt."

### Template Improver - Improving a Basic Template

**Before (without context):**
Original: "Write an article about {{topic}}"
> "Improved: Make instructions clearer and specify format."

**After (with context):**
Original: "Write an article about {{topic}}"
> "Improved: You are an expert writer. Write a 500-word article about {{topic}} that includes an introduction, 3 main sections, and a conclusion. Format with clear headers and bullet points."

---

## What Developers Will Notice

### With Old Prompts:
- Help text is generic and vague
- Template improver suggestions are basic
- Explanations don't reference Scaffold features
- Improved templates might not follow Scaffold best practices

### With New Prompts:
- Help text is specific and actionable
- Template improver suggestions are professional
- Explanations reference Scaffold components
- Improved templates follow best practices
- Explanations include examples relevant to form building

---

## Implementation

To use the new prompts:

1. Go to your "Builder Help" app in Scaffold
2. Edit the "explain_term" task
3. Copy the new template from QUICK_START.md
4. Save

5. Go to your "Template Improver" app
6. Edit the "improve_template" task
7. Copy the new template from QUICK_START.md
8. Save

That's it! Your chatbots will now have full Scaffold context.

---

## Comparison by Numbers

### New Builder Help Template
- **Lines**: 25 (was 6)
- **Context sections**: 2 (was 0)
- **Terminology definitions**: 7 (was 0)
- **Examples**: Yes (was No)

### New Template Improver Template
- **Lines**: 50 (was 18)
- **Context sections**: 3 (was 0)
- **Best practices**: 6 (was 0)
- **Process steps**: 5 (was 0)

---

## FAQ

**Q: Do I need to change my code?**
A: No, just update the prompts in your Scaffold apps.

**Q: Will this affect existing forms?**
A: No, it only affects the help system and template improver.

**Q: Can I customize the prompts further?**
A: Yes, feel free to adjust them based on your specific needs.

**Q: Should I add more Scaffold details?**
A: You could, but the current prompts cover the essentials.

---

**The new prompts are ready to copy! See QUICK_START.md for the templates.** 🚀
