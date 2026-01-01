# Contextual Help System & Template Improver Setup Guide

## Overview
You've successfully integrated two new AI-powered features into your Scaffold builder:
1. **Contextual Help System** - Context-sensitive tooltips that explain terms and concepts
2. **Template Improver** - AI-powered prompt template optimization

## What Was Implemented

### Part 1: Components Created

#### `app/components/HelpTooltip.tsx`
- Hover-triggered info (i) icon
- Fetches explanations from your "Builder Help" Scaffold app
- Shows smooth popover animations
- Placed throughout the builder for:
  - "Prompt Template" header
  - "Embed Snippet" header
  - "Customize Form Appearance" header
  - "Active Fields" section

#### `app/components/TemplateImproverModal.tsx`
- Full-screen modal with split layout:
  - Left: Embedded improver form
  - Right: Shows improved template result
- "Use This Template" button to auto-replace current template
- "Copy" button for manual copying
- Smooth animations and responsive design

### Part 2: Integration into Task Editor
Modified `app/builder/[app_id]/[task_name]/page.tsx`:
- Added imports for both components
- Added modal state management
- Added event listener for template updates
- Added "✨ Improve Template" button next to Save button
- Added HelpTooltip components to 4 key sections

## Part 3: Setup Your Scaffold Apps (Manual Steps)

You now need to create 2 apps in your Scaffold account:

### App 1: "Builder Help"

**Create the app:**
1. Go to your Scaffold dashboard
2. Click "New App" 
3. Name it: `Builder Help`
4. Set System Header (optional): "You are a helpful Scaffold documentation assistant"

**Create the task:**
1. Task name: `explain_term`
2. **Important:** No fields needed - the help icon will use the `fixed` parameter
3. Template:
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

**Copy your App ID:**
- From the app dashboard, copy the App ID (usually looks like a UUID)
- Add to your `.env.local`:
```
NEXT_PUBLIC_HELP_APP_ID=your_app_id_here
```

### App 2: "Template Improver"

**Create the app:**
1. Click "New App"
2. Name it: `Template Improver`
3. System Header (optional): "You are an expert at writing AI prompt templates for Scaffold"

**Create the task:**
1. Task name: `improve_template`
2. Add fields:
   - `field_list` (textarea, optional) - For comma-separated field names
   - `task_purpose` (textarea, optional) - What the task should accomplish
   - `additional_constraints` (textarea, optional) - Any specific requirements

3. Template:
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

**Copy your App ID:**
- Copy the App ID from the app dashboard
- Add to your `.env.local`:
```
NEXT_PUBLIC_IMPROVER_APP_ID=your_app_id_here
```

## Configuration

### Update .env.local

Add these environment variables (get the IDs from your Scaffold apps):
```
NEXT_PUBLIC_HELP_APP_ID=your_help_app_id
NEXT_PUBLIC_IMPROVER_APP_ID=your_improver_app_id
```

If you don't set these, the components will use default fallback IDs (which won't work).

## How Users Will Use These Features

### Contextual Help Icons
1. Users see small info (i) icons next to key section headers
2. Hover over any icon to see a 2-3 sentence explanation
3. Popover appears with smooth animation
4. No need to leave the builder

### Template Improver Button
1. Click "✨ Improve Template" button next to Save
2. Modal opens with two panes:
   - **Left:** Form asking questions about their template
   - **Right:** Shows the AI-improved version
3. Click "Copy" to copy the improved template
4. Click "Use This" to automatically replace their current template
5. Template updates in real-time

## Features & Notes

### HelpTooltip Component
- **Smart loading indicator** - Shows while fetching
- **Error handling** - Displays if explanation fails to load
- **Persistent** - Stays open while hovering between icon and tooltip
- **Customizable** - Can pass custom `label` prop for different display text
- **Environment-aware** - Falls back to default IDs if env vars not set

### TemplateImproverModal Component
- **Split pane layout** - Responsive on mobile (stacks vertically)
- **Event-based communication** - Uses custom events for updates
- **Editable result** - Users can refine the improved template
- **Color customization** - Buttons use the task's selected brand color
- **Font preservation** - Remembers the selected font family

## Troubleshooting

### Help Icons Don't Show Text
- Check that `NEXT_PUBLIC_HELP_APP_ID` is set in `.env.local`
- Verify the "Builder Help" app exists and has the `explain_term` task
- Check browser console for any fetch errors

### Template Improver Button Doesn't Work
- Verify `NEXT_PUBLIC_IMPROVER_APP_ID` is set correctly
- Check that "Template Improver" app exists with `improve_template` task
- Clear browser cache and reload
- Check that the embed form is accessible (try opening the URL directly)

### Modal Doesn't Update Result
- Make sure the improver form task is set to `has_form: true` (or not false)
- Check that the form can actually submit successfully
- Try manually entering a template and submitting

## Future Enhancements

Consider these additions:
1. **Help library** - Add more terms to explain_term task
2. **Template examples** - Show before/after examples in the improver
3. **Field auto-detection** - Auto-extract field names from current template
4. **History** - Save previous improved templates
5. **Custom help content** - Allow users to customize explanations per app
6. **Analytics** - Track which help topics are most used
7. **Keyboard shortcuts** - Open improver with Cmd+Shift+I

## Files Modified

- `app/components/HelpTooltip.tsx` (NEW)
- `app/components/TemplateImproverModal.tsx` (NEW)
- `app/builder/[app_id]/[task_name]/page.tsx` (MODIFIED)
  - Added imports
  - Added modal state
  - Added event listener
  - Added HelpTooltip components to 4 sections
  - Added "Improve Template" button
  - Added TemplateImproverModal component instance

## Questions?

The system is designed to be self-explanatory. If users need help with specific concepts, they can hover over the info icons throughout the builder!
