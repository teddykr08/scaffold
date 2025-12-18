# Scaffold - Product Summary & Current State

## 🎯 Elevator Pitch - My Understanding

**Scaffold is a backend-as-a-service for AI prompts.** It's not a user-facing app—it's infrastructure that developers embed into their own applications.

### How It Works:

1. **Developers** sign up at Scaffold.com to get API keys (marketing site only—no dashboards, no form builders)

2. **Developers** configure their app via API:
   - Create an "app" with a system header (instructions for ChatGPT)
   - Define "global fields" (user profile data like name, job title, company)
   - Define "task fields" (task-specific inputs like email recipient, tone)
   - Create "prompt templates" with `{{variables}}` placeholders

3. **Developers** embed a form (HTML/WebView) in THEIR app that collects:
   - Global field values (user's name, job title, etc.)
   - Task field values (email recipient, tone, etc.)

4. **End users** fill out the embedded form in the developer's app (not on Scaffold.com)

5. **The form** calls Scaffold's `/api/generate-prompt` endpoint with:
   - `app_id`
   - `task_name`
   - `global_values` (object with field values)
   - `task_values` (object with field values)

6. **Scaffold** generates the final prompt by:
   - Fetching the app's `system_header`
   - Fetching the template for that task
   - Replacing `{{system_header}}` with the app's system header
   - Replacing all `{{variable}}` placeholders with provided values

7. **Scaffold** returns a ChatGPT URL: `https://chat.openai.com/?q=ENCODED_PROMPT`

8. **The developer's app** redirects the end user to ChatGPT

9. **ChatGPT** opens with the pre-filled prompt using the user's own ChatGPT session

### Value Proposition:

**For Developers:** Add AI features without managing OpenAI API keys, hosting models, or paying per-request costs. Just embed a form and redirect.

**For End Users:** Seamlessly get ChatGPT to help with tasks customized to their context (job title, company, etc.) without copying/pasting prompts.

---

## ✅ What Already Exists (API Routes)

### 1. Apps Management
- **GET** `/api/apps` - List all apps
- **POST** `/api/apps` - Create a new app (with `name`, `system_header`)
- **GET** `/api/apps/[id]` - Get a specific app

### 2. Global Fields
- **GET** `/api/global-fields?app_id=xxx` - Get all global fields for an app
- **POST** `/api/global-fields` - Create a global field (field_name, field_label, field_type, required, order, options)

### 3. Task Fields
- **GET** `/api/task-fields?app_id=xxx&task_name=xxx` - Get all task fields
- **POST** `/api/task-fields` - Create a task field (app_id, task_name, field_name, field_label, field_type, required, order, options)

### 4. Prompt Templates
- **GET** `/api/prompt-templates?app_id=xxx&task_name=xxx` - Get templates
- **POST** `/api/prompt-templates` - Create a template (app_id, task_name, template)
- **PATCH** `/api/prompt-templates` - Update a template

### 5. Generate Prompt (The Core Feature!)
- **POST** `/api/generate-prompt` - Takes app_id, task_name, global_values, task_values
  - Fetches app's system_header
  - Fetches template
  - Replaces all `{{variables}}`
  - Returns `{ success: true, prompt: "...", chatgpt_url: "https://chat.openai.com/?q=..." }`

---

## ❌ What's Missing

### Critical Missing Pieces:

1. **❌ Marketing/Landing Page**
   - Current `/app/page.tsx` is just the Next.js default
   - Needs: Product explanation, pricing, signup for API keys, docs

2. **❌ API Key Management**
   - No endpoint to generate/manage API keys for developers
   - No authentication middleware to verify API keys
   - Currently all endpoints are open (no auth)

3. **❌ Developer Signup/Account System**
   - No way for developers to register
   - No user accounts table
   - No association between developers and their apps

4. **❌ Rate Limiting / Usage Tracking**
   - No limits on API calls
   - No usage analytics

5. **❌ Documentation**
   - No API docs endpoint
   - No integration examples
   - No SDK/library examples

6. **❌ Error Handling for Missing Variables**
   - `/api/generate-prompt` doesn't validate that all template variables are provided
   - Could return partial prompts with `{{unreplaced_variables}}`

### Nice-to-Have (Not Critical):

7. **Optional: Form Generator Helper**
   - Endpoint that returns form field definitions (for developers to auto-generate forms)
   - Could combine: GET global-fields + GET task-fields → return form schema

8. **Optional: Webhook Support**
   - Allow developers to receive notifications when prompts are generated

9. **Optional: Analytics Dashboard (Backend Only)**
   - API endpoint to fetch usage stats (no UI needed)

---

## 🎯 Proposed Next Step

**Priority 1: Add API Key Authentication**

This is the foundation for a production-ready backend service. Developers need:
1. A way to get API keys (even if manual for now)
2. All endpoints protected by API key verification
3. Each API key associated with a developer account

**What I'll build:**

1. **Create API Keys Table** (Supabase schema):
   - `api_keys` table with: `id`, `key` (hashed), `developer_id`, `app_id` (nullable), `created_at`, `last_used_at`

2. **Create Developers Table** (Supabase schema):
   - `developers` table with: `id`, `email`, `name`, `created_at`

3. **Add Authentication Middleware**:
   - Middleware to verify API key from `Authorization: Bearer <key>` header
   - Attach developer_id to request context

4. **Protect All Endpoints**:
   - Wrap all routes with auth middleware
   - Optionally scope by app_id (developer can only access their own apps)

5. **Simple API Key Generation Endpoint** (for now):
   - `POST /api/developers/register` - Create developer + return API key
   - Or `POST /api/api-keys` - Generate key for existing developer

**Alternative Simpler Start (if you prefer):**

Start with a landing page that explains the product, then add auth later. This lets you validate the concept first.

---

## 📋 Current Frontend State

- `app/page.tsx` - Default Next.js welcome page (needs replacement with landing page)
- `app/layout.tsx` - Basic layout (good for landing page)
- No user dashboards (correct!)
- No form builders (correct!)

---

## 🚀 Recommendation

**Option A: Add API Key Auth First** (Recommended)
- Makes the backend production-ready
- Prevents abuse
- Enables usage tracking
- Takes ~30 minutes to implement

**Option B: Build Landing Page First**
- Faster to validate product concept
- Can add auth later
- Takes ~15 minutes

**Which should I do first?**











