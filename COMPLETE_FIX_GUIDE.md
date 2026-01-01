# 🔧 Complete Fix Guide

This guide explains all the fixes applied and what you need to do to get everything working.

## ✅ What Was Fixed

### 1. **Template Improver Modal Size** 
- Changed from `max-w-3xl` to `max-w-7xl` (much wider)
- Changed from `max-h-[90vh]` to `max-h-[95vh]` (taller)
- Modal is now much more usable

### 2. **Added Console Logging for Debugging**
- Added logging to HelpTooltip component to see API responses
- Added logging to task editor to show environment variable status
- Open browser console (F12) to see diagnostic information

### 3. **Rename Functionality Added** ✨ NEW
- Created `ActionMenu` component with 3-dot menu
- Created `RenameModal` component for renaming
- Replaced trash can icons with 3-dot menus on:
  - Project cards (Builder Dashboard)
  - Task cards (Task List)
- Added "Rename" option (black text with edit icon)
- Added "Delete" option (red text with trash icon)

---

## 🚨 What You Need To Do

### Step 1: Check Your Browser Console

1. Open your production site: https://scaffoldtool.vercel.app
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Navigate to any task editor page
5. Look for these log messages:

```
[Task Editor] Environment variables check:
  NEXT_PUBLIC_HELP_APP_ID: NOT SET  <-- Should show your app ID
  NEXT_PUBLIC_IMPROVER_APP_ID: NOT SET  <-- Should show your app ID
```

6. Hover over a help icon (ⓘ) and look for:

```
[HelpTooltip] Fetching help for term: {term name}
[HelpTooltip] Using app ID: undefined  <-- Should show your app ID
[HelpTooltip] API Response: {...}
```

### Step 2: Fix Environment Variables on Vercel

**If the console shows "NOT SET" or "undefined":**

1. Go to https://vercel.com
2. Select your **scaffoldtool** project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `NEXT_PUBLIC_HELP_APP_ID` | Your "Builder Help" app ID | Production, Preview, Development |
   | `NEXT_PUBLIC_IMPROVER_APP_ID` | Your "Template Improver" app ID | Production, Preview, Development |

5. Click **Save**
6. Go to **Deployments** tab
7. Click the three dots (**⋮**) on the latest deployment
8. Click **Redeploy**
9. Wait 1-2 minutes for deployment to complete

### Step 3: Find Your App IDs

**Option A: From the URL**
1. Go to your production site: https://scaffoldtool.vercel.app/builder
2. Click on "Builder Help" project
3. Look at the URL: `https://scaffoldtool.vercel.app/builder/{APP_ID}`
4. Copy the `{APP_ID}` part
5. Repeat for "Template Improver" project

**Option B: From Browser Console**
1. Open https://scaffoldtool.vercel.app/builder
2. Open Console (F12)
3. Run this command:
```javascript
fetch('/api/apps', {
  headers: {
    'Authorization': `Bearer ${(await (await fetch('https://scaffoldtool.vercel.app')).text()).match(/session.*?"access_token":"([^"]+)"/)?.[1]}`
  }
}).then(r => r.json()).then(d => {
  const help = d.apps.find(a => a.name === "Builder Help");
  const improver = d.apps.find(a => a.name === "Template Improver");
  console.log("NEXT_PUBLIC_HELP_APP_ID:", help?.id);
  console.log("NEXT_PUBLIC_IMPROVER_APP_ID:", improver?.id);
});
```

### Step 4: Verify Apps Exist on Production

1. Go to https://scaffoldtool.vercel.app/builder
2. Make sure you see these two projects:
   - **Builder Help** (with 1 task: "explain_term")
   - **Template Improver** (with 1 task: "improve_template")

**If you don't see them:**
- You need to create them on production (not localhost!)
- Follow the QUICK_START.md guide again, but do it on scaffoldtool.vercel.app

### Step 5: Test Everything

After setting environment variables and redeploying:

1. Go to any task editor page
2. Check browser console - should now show your app IDs
3. Hover over a help icon (ⓘ) - should show explanation
4. Click "Improve Template" button - modal should be large and usable
5. Test the new rename functionality:
   - Go to /builder (project list)
   - Hover over a project card
   - Click the 3-dot menu (top right)
   - Click "Rename" - should open modal
   - Enter new name and click "Rename"
   - Project should be renamed

---

## 🐛 Common Issues & Solutions

### Issue: "Could not load help content"

**Cause:** Environment variables not set or wrong app ID

**Solution:**
1. Check console logs (see Step 1 above)
2. Set environment variables on Vercel (see Step 2 above)
3. Make sure apps exist on production (see Step 4 above)

### Issue: Modal still shows "Could not load help content"

**Cause:** The "Builder Help" app or "explain_term" task doesn't exist

**Solution:**
1. Go to https://scaffoldtool.vercel.app/builder
2. Create "Builder Help" app if missing
3. Create "explain_term" task if missing
4. Set up the prompt as described in QUICK_START.md

### Issue: Template Improver shows blank page

**Cause:** The "Template Improver" app or "improve_template" task doesn't exist

**Solution:**
1. Go to https://scaffoldtool.vercel.app/builder
2. Create "Template Improver" app if missing
3. Create "improve_template" task if missing
4. Add the required form fields (see QUICK_START.md)

### Issue: Embed shows navbar/login

**This is actually correct!** When not logged in, embeds should show login.

**To test embeds properly:**
1. Log in first on the main site
2. Then open the embed URL in a new tab
3. OR use incognito mode to test the public behavior

### Issue: Rename not working

**Cause:** API endpoint might not support PUT method

**Check:** Look at the browser console for error messages when you try to rename

**Solution:** The rename functionality uses:
- For projects: `PUT /api/apps/{id}` with `{ name: "new name" }`
- For tasks: `PUT /api/tasks` with `{ id: "...", name: "new_name" }`

If you see 404 or 405 errors, you may need to add these endpoints.

---

## 📝 Summary of Changes Made

### New Components
- `app/components/ActionMenu.tsx` - 3-dot menu with rename/delete options
- `app/components/RenameModal.tsx` - Modal for renaming projects/tasks

### Modified Components
- `app/components/HelpTooltip.tsx` - Added detailed console logging
- `app/components/TemplateImproverModal.tsx` - Increased modal size
- `app/components/BuilderDashboardUI.tsx` - Replaced trash icon with ActionMenu
- `app/builder/page.tsx` - Added `renameApp()` function
- `app/builder/[app_id]/page.tsx` - Added `renameTask()` function, ActionMenu
- `app/builder/[app_id]/[task_name]/page.tsx` - Added environment variable logging

### What's Now Different
- Trash cans are gone ❌
- 3-dot menus appear when you hover over cards ✅
- Click 3-dots → see "Rename" (black) and "Delete" (red) ✅
- Modal is much larger and more usable ✅
- Console shows detailed debugging info ✅

---

## 🎯 Next Steps

1. **Follow Step 1-5 above** to get everything working
2. **Check browser console** after each step
3. **Test on production** (not localhost)
4. **Report back** with any console errors you see

If you still have issues after following all steps, share:
- The console log output
- The app IDs you're using
- Any error messages from the Vercel deployment logs
