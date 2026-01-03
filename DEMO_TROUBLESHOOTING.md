# Demo Troubleshooting Checklist

## App ID Set
✅ Demo app ID is now: `eee1a61f-c5d8-463b-a143-5f8a05dfe2a5`

## What to Check

### 1. Does the task exist?
- Visit: `https://scaffoldtool.vercel.app/builder/eee1a61f-c5d8-463b-a143-5f8a05dfe2a5`
- You should see your "Scaffold Demo" app
- Click into it and verify a task called "show_demo" exists

### 2. Are the fields created?
The task should have these 3 fields:
- `coding_experience` (Number, min: 1, max: 10)
- `current_tool` (Dropdown with options: API keys, Nothing, I don't know)
- `app_idea` (Short Text, optional)

### 3. Is the template saved?
- Click into the "show_demo" task
- Scroll to "Prompt Template" section
- Verify the salesman template is saved

### 4. Test the embed directly
Visit this URL to test if the form works:
```
https://scaffoldtool.vercel.app/embed/form?app_id=eee1a61f-c5d8-463b-a143-5f8a05dfe2a5&task_name=show_demo
```

If you see "Task not found in this app", one of these is wrong:
- The app ID doesn't exist
- The task "show_demo" doesn't exist in that app
- The task belongs to a different user

### 5. Check browser console
When you visit `/demo`, open DevTools console and look for:
```
[Demo Page] DEMO_APP_ID: eee1a61f-c5d8-463b-a143-5f8a05dfe2a5
[Demo Page] DEMO_TASK_NAME: show_demo
[Demo Page] Embed URL: /embed/form?app_id=eee1a61f-c5d8-463b-a143-5f8a05dfe2a5&task_name=show_demo
```

Then check the iframe console for any errors.

## Brace Auto-Complete Fix

The brace auto-complete should now work. When you type `{` in the template editor:
1. It immediately adds `{}`
2. Creates: `{{|}}`  (cursor in middle)
3. You can then type the field name

**How it works now:**
- Detects when a single `{` is added (not part of existing `{{`)
- Adds `{}` after it
- Positions cursor between the braces

**Test it:**
1. Go to any task editor
2. Click in the template textarea
3. Type `{`
4. Should instantly become `{{}}`  with cursor in the middle
5. Type a field name like `test`
6. Result: `{{test}}`

If it still doesn't work, check browser console for any JavaScript errors.
