# Scaffold - Complete Context Dump

## What Is Scaffold
No-code AI app builder. Users create "apps" (projects) containing "tasks" (prompts). Each task has a template with `{{field_name}}` placeholders and form fields. When end-user fills form → fields inject into template → sends to OpenAI → returns result. Forms embed via iframe on any site.

## Tech Stack
- **Frontend**: Next.js 14 App Router, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase (auth + PostgreSQL)
- **Deployment**: Vercel (scaffoldtool.vercel.app)
- **AI**: OpenAI API (user provides key in app settings)

## Core Architecture

### Data Model
```
users (Supabase auth)
├── apps (projects)
│   ├── id, name, user_id, created_at
│   └── tasks
│       ├── id, app_id, name, description, user_id, theme, custom_color, font
│       ├── prompt_templates (template text with {{placeholders}})
│       └── task_fields (form fields)
│           ├── id, app_id, task_name, field_name, field_label, field_type
│           ├── required, order, options[], default_value, min, max
│           └── field_type: text|textarea|select|number|runtime
```

### User Flow
1. **Builder** (`/builder`): User creates app → adds tasks → designs template → configures fields
2. **Embed** (`/embed/form`): End-user fills form → generates prompt → calls OpenAI → shows result
3. **Demo** (`/demo`): Marketing page showing Scaffold demo form

### Key URLs
- `/builder` - Dashboard (list apps)
- `/builder/[app_id]` - Task list for app
- `/builder/[app_id]/[task_name]` - Task editor (template, fields, embed code)
- `/embed/form?app_id=X&task_name=Y&color=%23HEX&font=FontName` - Public form
- `/demo` - Demo page (app_id: eee1a61f-c5d8-463b-a143-5f8a05dfe2a5, task: show_demo)

## File Structure

### Pages
- `app/page.tsx` - Landing page
- `app/builder/page.tsx` - Dashboard (BuilderDashboardUI)
- `app/builder/[app_id]/page.tsx` - Task list
- `app/builder/[app_id]/[task_name]/page.tsx` - Task editor (main builder)
- `app/embed/form/page.tsx` - Public form (484 lines)
- `app/demo/page.tsx` - Demo page

### Components
- `BuilderDashboardUI.tsx` - App cards grid
- `HelpTooltip.tsx` - Hover ? icon → fetches help from Builder Help app → shows Copy/ChatGPT buttons
- `TemplateImproverPopup.tsx` - Full-screen popup iframe for template improvement
- `ActionMenu.tsx` - 3-dot menu (Edit/Delete) - positioned middle-right
- `RenameModal.tsx` - Modal for renaming
- `OnboardingTutorial.tsx` - Joyride tutorial (v4) with smart state management, auto-scroll, page-dependent steps
- `Navbar.tsx` - Top navigation
- `AuthContext.tsx` - Supabase auth wrapper

### API Routes
- `GET /api/apps` - List user's apps
- `POST /api/apps` - Create app
- `GET /api/apps/[id]` - Get app details
- `PUT /api/apps/[id]` - Rename app (body: {name})
- `DELETE /api/apps/[id]` - Delete app

- `GET /api/tasks?app_id=X` - List tasks in app
- `POST /api/tasks` - Create task
- `PUT /api/tasks` - Update task (name, theme, custom_color, font)
- `DELETE /api/tasks?id=X` - Delete task
- `GET /api/tasks/get?app_id=X&name=Y` - Get single task

- `GET /api/task-fields?app_id=X&task_name=Y` - List fields
- `POST /api/task-fields` - Create field (field_name, field_label, field_type, required, order, options[], min, max)
- `PUT /api/task-fields` - Update field (id, field_label, field_type, required, options[], min, max)
- `DELETE /api/task-fields?id=X` - Delete field

- `GET /api/prompt-templates?app_id=X&task_name=Y` - Get template
- `POST /api/prompt-templates` - Save template (app_id, task_name, template)

- `POST /api/generate-prompt` - Generate AI response (app_id, task_name, form_values, fixed_content)

### Libraries
- `lib/supabaseClient.ts` - Client-side Supabase
- `lib/supabaseServer.ts` - Server-side Supabase
- `lib/authenticatedFetch.ts` - Fetch with auth token
- `lib/authHelpers.ts` - Auth utilities

## Features & Implementation

### Free Tier Limits
```typescript
const FREE_TIER_LIMITS = {
  APPS_PER_ACCOUNT: 5,
  TASKS_PER_APP: 5
};
```
- Enforced in `builder/page.tsx` (createApp)
- Enforced in `builder/[app_id]/page.tsx` (createTask)
- Display: "X / 5 apps" or "X / 5 tasks"

### Field Types
1. **text** - Short text input
2. **textarea** - Long text input
3. **select** - Dropdown (options: string[])
4. **number** - Number input (min/max optional)
5. **runtime** - Hidden field (not shown in form)

### Field Configuration
- **label**: Display text in form
- **name**: Placeholder variable (`{{field_name}}`)
- **required**: Boolean
- **order**: Sort order
- **options**: Dropdown choices (one per line in textarea)
- **min/max**: Number constraints (toggleable checkboxes)

### Template System
- Template textarea with `{{field_name}}` placeholders
- **Brace Autocomplete**: Type `{` → instantly becomes `{{}}` with cursor at `{{|}}`
  - Implementation: onChange handler detects single `{`, replaces with `{{}}`, positions cursor
- **Available Fields**: Shows all fields with copy buttons, green if used, red if unused
- **Validation**: Warns if template uses undefined fields

### Help System
- **Builder Help App**: app_id = aac18034-6fad-4381-a66c-7d2265dfafb3, task = explain_term
- HelpTooltip sends term as fixed_content → gets kid-friendly explanation → shows Copy/ChatGPT buttons
- Terms: prompt_template, form_fields, embed_snippet, form_customization, fixed_field

### Template Improver
- **Improver App**: app_id = 87c1a384-47ff-41af-aa81-b72ba6f08b37, task = improve_template
- Button opens TemplateImproverPopup (full-screen with blur)
- Fixed content: `Current Template: ${template}\n\nFields: ${fieldList}`
- Fields hidden from form: field_list, purpose, requirements
- Auto-submits when no visible fields remain

### Embed Form Customization
- **URL params**: `?color=%23HEX&font=FontName`
- **Fonts**: Inter, Roboto, Montserrat, Oswald, Raleway, etc.
- **Color**: Primary color (buttons, accents)
- **Fixed Field**: `&fixed=HIDDEN_CONTEXT` - invisible data sent to AI
- **Field List**: `&field_list=comma,separated,fields` - pre-fill hidden field

### Rename Functionality
- Apps: 3-dot menu → Edit → RenameModal → PUT /api/apps/[id]
- Tasks: 3-dot menu → Edit → RenameModal → PUT /api/tasks
- Fields: 3-dot menu → Edit → Loads into FieldCreator → PUT /api/task-fields
  - Field name disabled when editing (prevents breaking templates)

### ActionMenu Positioning
- `className="absolute right-0 top-1/2 -translate-y-1/2 mr-10"`
- Pops out to middle-right of button
- `z-[99999]` to layer over everything

### Field Editor
- **Add Mode**: "Add New Field" title, "Add Field" button
- **Edit Mode**: "Edit Field" title, "Save Edits" button, "Cancel" button
  - Scrolls to top when Edit clicked
  - Pre-fills all data (label, name, type, required, options, min/max)
  - Field name input disabled (can't change API name)

### Number Field Constraints
- Checkboxes: "Set Minimum", "Set Maximum"
- Inputs appear when checked
- Saved as min/max in database
- Display in field list: "MIN:1 MAX:10"

### Dropdown Options
- Textarea input (one option per line)
- Placeholder: `option 1\noption 2\noption 3` (actual line breaks)
- Stored as string[] in database
- Display in field list: "Options: opt1, opt2, opt3"

## Environment Variables

### Production (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_HELP_APP_ID=aac18034-6fad-4381-a66c-7d2265dfafb3
NEXT_PUBLIC_IMPROVER_APP_ID=87c1a384-47ff-41af-aa81-b72ba6f08b37
NEXT_PUBLIC_DEMO_APP_ID=eee1a61f-c5d8-463b-a143-5f8a05dfe2a5
```

### Local (.env.local)
Same as above

## Current State & Recent Changes

### Builder Page Layout (Task Editor)
- **Page**: `/builder/[app_id]/[task_name]`
- **Layout**: 3 seamless sections with smooth scroll
  1. **Embed Configuration** - iframe preview, customization, fixed field switch
  2. **Field Management** - add/edit fields, active fields list
  3. **Prompt Template** - template editor, available fields, validation
- **Fixed Header**: Sticky task title + back button (always visible)
- **Section Refs**: `embedSectionRef`, `fieldSectionRef`, `templateSectionRef` for auto-scroll
- **Global Function**: `window.scrollToSection(sectionName)` for tutorial integration

### OnboardingTutorial System (v4)
- **Smart State Management**: Persists across page navigation and refreshes
- **Page-Dependent**: Starts at correct step based on current route
- **Auto-Advance**: Watches for async operations (app/task/field creation)
- **Auto-Scroll**: Automatically scrolls to relevant sections
- **11 Steps**: Welcome → Create App → Create Task → Add Field → Template → Embed → Done
- **Storage Keys**: 
  - `scaffold_tutorial_state_v4` - current state
  - `scaffold_tutorial_completed_v4` - completion flag
- **Custom Events**:
  - `scaffold-app-created` - advances from step 2 to 3
  - `scaffold-task-created` - advances from step 5 to 6
  - `scaffold-field-added` - advances from step 7 to 9 + scrolls to template
  - `scaffold-restart-tutorial` - resets tutorial

### Demo Page (/demo)
- **App ID**: eee1a61f-c5d8-463b-a143-5f8a05dfe2a5
- **Task**: show_demo
- **Fields**: coding_experience (1-10), current_tool (dropdown), app_idea (optional text)
- **Embed URL**: `/embed/form?app_id=eee1a61f-c5d8-463b-a143-5f8a05dfe2a5&task_name=show_demo&color=%23fdcd13&font=Montserrat`
- **Styling**: White background, black text (removed purple gradient)
- **Purpose**: Personalized Scaffold pitch based on skill level

### Fixed Issues
1. **ActionMenu dropdown**: Now positioned middle-right, won't overlap fields below
2. **Brace autocomplete**: Type `{` → becomes `{{}}` instantly with cursor in middle
3. **Field editing**: Click Edit → loads data → changes button to "Save Edits"
4. **Number fields**: Min/max toggles with input fields
5. **Dropdown fields**: Textarea with line breaks for options
6. **Fixed prompt → fixed field**: Renamed throughout app
7. **OnboardingTutorial**: Smart state management, page-dependent, auto-scroll to sections
8. **Builder page layout**: Restructured into 3 sections with fixed header and scroll refs
9. **Tutorial positioning**: Popups no longer block interactive elements
10. **Tutorial flow**: Async operations handled automatically, no manual processing steps
11. **Demo customization**: Correct color (#fdcd13) and font (Montserrat)

### Known Patterns
- All field operations use slugifyFieldName: lowercase, underscores, no special chars
- Template validation warns about undefined {{variables}}
- Embed forms auto-submit when all fields provided via URL (visibleFields.length === 0)
- Field filtering: runtime fields never shown, additional_instructions hidden
- Free tier checks before create operations
- Auth: Bearer token in Authorization header from Supabase session
- User isolation: All queries filter by user_id

## Database Schema Requirements

### task_fields table needs:
```sql
ALTER TABLE task_fields 
  ADD COLUMN IF NOT EXISTS min NUMERIC,
  ADD COLUMN IF NOT EXISTS max NUMERIC;
```

## Common Operations

### Create a field with options:
```typescript
POST /api/task-fields
{
  app_id: "uuid",
  task_name: "task_slug",
  field_name: "field_slug",
  field_label: "Display Label",
  field_type: "select",
  required: true,
  order: 1,
  options: ["Option 1", "Option 2", "Option 3"]
}
```

### Update field with min/max:
```typescript
PUT /api/task-fields
{
  id: "field_uuid",
  min: 1,
  max: 10
}
```

### Generate prompt:
```typescript
POST /api/generate-prompt
{
  app_id: "uuid",
  task_name: "task_slug",
  form_values: {
    field1: "value1",
    field2: "value2"
  },
  fixed_content: "hidden context" // optional
}
```

## Styling Constants
- **Brand Color**: #CFFC4E (scaffold-brand)
- **Graffiti Font**: var(--font-graffiti)
- **Demo Color**: #fdcd13 (gold)
- **Border Radius**: Generous use of rounded-xl, rounded-2xl
- **Shadows**: shadow-lg, shadow-2xl on cards
- **Transitions**: transition-all, hover effects on most interactive elements

## Critical Files to Understand
1. `app/builder/[app_id]/[task_name]/page.tsx` (832 lines) - Main builder logic
2. `app/embed/form/page.tsx` (484 lines) - Form rendering and submission
3. `app/api/generate-prompt/route.ts` - OpenAI integration
4. `app/components/ActionMenu.tsx` - 3-dot menu pattern
5. `lib/authenticatedFetch.ts` - Auth wrapper for API calls

## Debugging Tips
- Check browser console for environment variables (logged on mount)
- Embed form logs to console: `[Embed Form]` prefix
- Demo page logs URL construction
- Template validation shows warnings in status area
- Supabase errors return in `{ success: false, error: "message" }` format

## User Personas
1. **Builder**: Creates apps in /builder, configures templates/fields
2. **End User**: Fills forms in /embed/form, sees AI results
3. **Visitor**: Tries demo at /demo, sees Scaffold pitch

## Key Constraints
- 5 apps per account (free tier)
- 5 tasks per app (free tier)
- Field names cannot be changed after creation (breaks templates)
- Template must use defined fields (validation warns but allows save)
- Embed forms are public (no auth required)
- Builder routes require authentication

## Error Handling Patterns
```typescript
const res = await fetch(...);
const data = await safeJson(res);
if (!data?.success) {
  setStatus(`❌ Error: ${data?.error || 'unknown'}`);
  return;
}
```

## Next Steps / TODOs
- User needs to set NEXT_PUBLIC_DEMO_APP_ID in Vercel
- User should update Builder Help prompt template for kid-friendly explanations
- Database migration needed for min/max columns
- Demo form (show_demo) needs to be created with 3 fields

---

**Context Created**: 2026-01-01  
**Last Major Changes**: 
- Tutorial system overhaul (v4): smart state, auto-scroll, page-dependent steps
- Builder page restructure: 3 sections with fixed header and scroll refs
- Tutorial positioning fixes: no blocking, correct placements
- Auto-advance for async operations (app/task/field creation)
