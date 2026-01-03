# Demo Setup - Quick Fix

## Issue
The demo page is showing "Task not found in this app" because the environment variable `NEXT_PUBLIC_DEMO_APP_ID` is not set or the task doesn't exist.

## Fix Steps

### 1. Create the Demo App (if you haven't already)
Follow the instructions in [DEMO_SETUP_INSTRUCTIONS.md](DEMO_SETUP_INSTRUCTIONS.md):
- Create a new app called "Scaffold Demo"
- Create a task called "show_demo"
- Add the three fields (coding_experience, current_tool, app_idea)
- Copy the app ID from the URL

### 2. Set Environment Variable Locally
Add to your `.env.local` file:
```
NEXT_PUBLIC_DEMO_APP_ID=your-actual-app-id-here
```

### 3. Deploy to Vercel
Add the environment variable in Vercel dashboard:
- Go to Settings → Environment Variables
- Add: `NEXT_PUBLIC_DEMO_APP_ID` with your actual app ID
- Redeploy

## Debugging

Open browser console on `/demo` page to see:
- The app ID being used
- The embed URL being constructed
- Any errors from the embed form

The console will show:
```
[Demo Page] DEMO_APP_ID: your-app-id-or-placeholder
[Demo Page] DEMO_TASK_NAME: show_demo
[Demo Page] Embed URL: /embed/form?app_id=...&task_name=show_demo
```

If you see `YOUR_DEMO_APP_ID_HERE`, the environment variable isn't set.

## Changes Made

### 1. ActionMenu Dropdown
- Changed from `right-0 top-10` to `right-full top-0 mr-2`
- Now pops out to the LEFT side of the button
- Won't be blocked by fields below

### 2. Template Brace Auto-Complete
- Changed from `onKeyDown` to `onInput` 
- Now detects when a single `{` is typed
- Instantly adds the closing `}` 
- Cursor positioned between: `{|}`

### 3. Demo Page Debug Logging
- Added console.log statements
- Helps identify if env variable is missing
- Shows the constructed embed URL
