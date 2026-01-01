# Scaffold Builder: Contextual Help System & Template Improver

## Overview

This implementation adds two powerful AI-powered features to your Scaffold builder:

1. **Contextual Help System** - Real-time assistance explaining builder concepts
2. **Template Improver** - AI-powered prompt template optimization engine

Both features integrate seamlessly into the task editor and use Scaffold's own form generation to power the experience.

## Features

### 🆘 Contextual Help Icons

Info icons appear throughout the builder interface that explain key concepts:

- **Prompt Template** - What is a prompt template and how to use it
- **Embed Snippet** - How to embed forms into your website
- **Customize Form Appearance** - How to personalize form styling
- **Active Fields** - What form fields are and how they work

**How it works:**
1. Hover over any info icon
2. A popover appears with an AI-generated explanation
3. Explanations are fetched from your "Builder Help" Scaffold app
4. Uses 2-3 sentence summaries for quick learning

### ✨ Template Improver Button

A button in the Prompt Template section that opens an AI-powered template improvement modal.

**How it works:**
1. Click "✨ Improve Template" button
2. Modal opens with form on the left
3. Answer questions about your template:
   - What fields are available
   - What the task should accomplish
   - Any specific constraints or requirements
4. AI generates an improved version on the right
5. Review, edit, and either:
   - Copy the result to clipboard
   - Click "Use This" to auto-update your template
6. Template updates and you're prompted to save

## Architecture

### Components

#### HelpTooltip.tsx
- **Purpose:** Displays hover-triggered contextual help
- **Props:**
  - `term` (string) - The concept to explain
  - `label` (string, optional) - Custom display label
  - `helpAppId` (string, optional) - Scaffold app ID
- **Fetches from:** `/api/generate-prompt` endpoint
- **Caches:** Loads once per hover session

#### TemplateImproverModal.tsx
- **Purpose:** Modal interface for template improvement
- **Props:**
  - `isOpen` (boolean) - Controls visibility
  - `onClose` (function) - Close handler
  - `currentTemplate` (string) - Template to improve
  - `fieldNames` (string[]) - Available field names
  - `taskDescription` (string, optional) - Task context
  - `customColor` (string) - Task brand color
  - `fontFamily` (string) - Task font
- **Features:**
  - Split-pane layout (form + result)
  - Embedded Scaffold form
  - Editable result textarea
  - Copy and auto-update buttons
  - Responsive design

### Integration

Modified file: `app/builder/[app_id]/[task_name]/page.tsx`

**Changes:**
- Imports HelpTooltip and TemplateImproverModal
- Manages modal open/close state
- Listens for template updates
- Places help icons at 4 locations
- Shows improve button next to save button
- Renders modal component with proper props

### Data Flow

```
HelpTooltip:
  User hovers → Fetches from /api/generate-prompt 
    → Builder Help App (explain_term task with fixed= term)
    → Returns explanation → Displays in popover

TemplateImproverModal:
  User clicks button → Modal opens
    → Embedded form from Template Improver App
    → User submits → Result shown
    → Click "Use This" → Custom event fired
    → Parent component updates template
```

## Setup Instructions

### 1. Create Scaffold Apps

**App #1: Builder Help**
```yaml
Name: Builder Help
Task: explain_term
No fields needed
Template:
  You are a helpful Scaffold documentation assistant.
  Explain this concept in 2-3 sentences for developers 
  building with Scaffold:
  
  <<fixed>>
  
  Keep it concise and practical.
```

**App #2: Template Improver**
```yaml
Name: Template Improver
Task: improve_template
Fields:
  - field_list (textarea, optional)
  - task_purpose (textarea, optional)
  - additional_constraints (textarea, optional)
Template:
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

### 2. Get App IDs

From your Scaffold dashboard, copy both app IDs.

### 3. Update Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_HELP_APP_ID=your_builder_help_app_id
NEXT_PUBLIC_IMPROVER_APP_ID=your_template_improver_app_id
```

### 4. Restart Development Server

```bash
npm run dev
# or
yarn dev
```

## Usage Examples

### For End Users (Developers Using Your Builder)

**Getting Help:**
```
1. Open any task editor
2. Look for small ℹ️ icons throughout the interface
3. Hover over any icon to see an explanation
4. Tooltip appears for 2-3 seconds, then fades
```

**Improving Templates:**
```
1. In the "Prompt Template" section, click "✨ Improve Template"
2. Modal opens with questions
3. Answer questions about your template
4. Review the AI-generated improvement on the right
5. Click "Copy" to copy, or "Use This" to auto-update
6. Save your task as usual
```

### For Developers (Customizing)

**Add Help for a New Section:**
```tsx
<h2 className="flex items-center gap-2">
  Section Title
  <HelpTooltip term="my_concept" label="Help text" />
</h2>
```

**Customize Help Content:**
Edit the "Builder Help" app's `explain_term` task template to include more terms or different explanations.

**Adjust Form Questions:**
Edit the "Template Improver" app's `improve_template` task to ask different questions or adjust the improvement logic.

## Customization

### Change Help Explanations

Edit the `explain_term` task template in your "Builder Help" app. The template receives:
- `<<fixed>>` - The term being explained
- Access to OpenAI's API for generating explanations

### Change Improvement Prompts

Edit the `improve_template` task template in your "Template Improver" app. The template receives:
- `<<fixed>>` - The current template
- `{{field_list}}` - Comma-separated field names
- `{{task_purpose}}` - What the task should accomplish
- `{{additional_constraints}}` - Any constraints

### Change Modal Appearance

Both components use Tailwind CSS. Modify the className strings in:
- `app/components/HelpTooltip.tsx`
- `app/components/TemplateImproverModal.tsx`

### Change Button Text

Modify the button text in:
- `app/builder/[app_id]/[task_name]/page.tsx` line ~782: `✨ Improve Template`

## Troubleshooting

### Help Icons Don't Show Explanations

**Symptoms:** Icons appear but no text when hovering

**Solutions:**
1. Check `.env.local` has correct `NEXT_PUBLIC_HELP_APP_ID`
2. Verify "Builder Help" app exists in your dashboard
3. Verify `explain_term` task exists in that app
4. Check browser console for fetch errors
5. Ensure API keys are configured correctly

### Template Improver Button Doesn't Work

**Symptoms:** Modal opens but form doesn't load or submit

**Solutions:**
1. Check `.env.local` has correct `NEXT_PUBLIC_IMPROVER_APP_ID`
2. Verify "Template Improver" app exists
3. Verify `improve_template` task exists
4. Clear browser cache
5. Check that form can be accessed directly:
   ```
   https://scaffoldtool.vercel.app/embed/form?app_id=...&task_name=improve_template
   ```

### Template Doesn't Update After Using Modal

**Symptoms:** Click "Use This" but template doesn't change

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify modal is getting the improved template from form
3. Check that custom event is being dispatched
4. Verify event listener is registered in task editor

### Form Times Out or Is Slow

**Symptoms:** Help tooltips or improver form takes forever to load

**Solutions:**
1. Check your API rate limits
2. Verify OpenAI API keys are configured
3. Check network tab in browser dev tools
4. Verify form apps are properly configured with templates

## Performance Considerations

### Help Tooltips
- **Load once per hover** - No repeated requests for same term
- **Cached in memory** - Within the hover session
- **Async loading** - Doesn't block UI
- **Timeout friendly** - Shows error if fetch takes too long

### Template Improver
- **Embedded form** - Doesn't create new page load
- **One submission per use** - No auto-submit or polling
- **Event-based** - Uses custom events, no polling
- **Editable result** - Users can refine AI output

## Future Enhancements

**Consider adding:**
1. Multiple improvement suggestions to choose from
2. Template history/versioning
3. Caching of frequently asked explanations
4. Analytics on which help topics are used
5. Custom help per app
6. Keyboard shortcuts (Cmd+Shift+I for improver)
7. Diff view showing changes in improved template
8. Template validation before improvement
9. Multi-language explanations
10. Video tutorials linked from help

## Security Notes

- Help explanations are generated by your Scaffold app (API secured)
- Template improvements use your Scaffold account (no data leakage)
- Forms are embedded, not external iframes
- All communication is over HTTPS
- No data is stored except in your Scaffold database

## Browser Compatibility

- **Modern browsers** - Chrome, Firefox, Safari, Edge (latest)
- **Mobile** - Responsive design works on phones/tablets
- **IE11** - Not supported (uses modern CSS and JS)

## Files

### New Files
- `app/components/HelpTooltip.tsx` - Help tooltip component
- `app/components/TemplateImproverModal.tsx` - Improver modal component
- `HELP_SYSTEM_SETUP.md` - Detailed setup guide
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- `QUICK_START.md` - 5-minute setup guide
- `.env.local.example-help-system` - Environment variable template

### Modified Files
- `app/builder/[app_id]/[task_name]/page.tsx` - Integrated components

## Support & Questions

For detailed information:
- **Setup Help:** See `QUICK_START.md`
- **Technical Details:** See `HELP_SYSTEM_SETUP.md`
- **Implementation:** See `IMPLEMENTATION_SUMMARY.md`
- **Code Examples:** See component files with JSDoc comments

## License

This feature is part of Scaffold and follows the same license as the main project.

---

**Everything is ready to use! Follow the setup instructions to get started.**
