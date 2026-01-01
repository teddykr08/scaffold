# 🔧 Troubleshooting Your Issues

## Issue 1: "Could not load help content"

### Most Likely Causes:

**1. Environment Variables Not Set on Vercel**
- You added them to `.env.local` (which only works on localhost)
- But you're testing on production (scaffoldtool.vercel.app)
- **Solution:** Add env vars to Vercel dashboard → Settings → Environment Variables

**2. Wrong App IDs**
- Double-check the app IDs you copied
- Make sure they're from the production Scaffold site, not localhost

**3. Apps Don't Exist or Aren't Public**
- Make sure "Builder Help" and "Template Improver" apps are created
- Make sure the tasks "explain_term" and "improve_template" exist

### How to Fix (Step by Step):

#### Step 1: Verify Your App IDs
1. Go to scaffoldtool.vercel.app (production)
2. Find your "Builder Help" app
3. Copy the app ID (looks like: `abc123-def456-789...`)
4. Find your "Template Improver" app
5. Copy that app ID too

#### Step 2: Add to Vercel (REQUIRED for production)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Settings"
4. Click "Environment Variables"
5. Add these TWO variables:

```
Name: NEXT_PUBLIC_HELP_APP_ID
Value: [your Builder Help app ID]
Environments: ✓ Production ✓ Preview ✓ Development

Name: NEXT_PUBLIC_IMPROVER_APP_ID
Value: [your Template Improver app ID]
Environments: ✓ Production ✓ Preview ✓ Development
```

#### Step 3: Redeploy
1. Go to "Deployments" tab in Vercel
2. Click the "..." menu on your latest deployment
3. Click "Redeploy"
4. Wait for it to finish

#### Step 4: Test
1. Go to your production site
2. Open a task editor
3. Hover over an ℹ️ icon
4. Should now work!

### Still Not Working?

Check browser console (F12) for errors:
```javascript
// Type this in console to check env vars:
console.log('Help App ID:', process.env.NEXT_PUBLIC_HELP_APP_ID);
console.log('Improver App ID:', process.env.NEXT_PUBLIC_IMPROVER_APP_ID);
```

If they show `undefined`, env vars aren't loaded properly.

---

## Issue 2: Modal Too Small

**Fixed!** I've updated the modal to be much larger:
- Changed from `max-w-3xl` to `max-w-7xl` (much wider)
- Changed from `max-h-[90vh]` to `max-h-[95vh]` (taller)

This should make the template improver much more usable.

---

## Issue 3: Embed Showing Navbar/Login

This is happening because:

**Scenario A: Using Localhost Forms**
- If you created the Builder Help and Template Improver apps on localhost
- But you're testing on production
- The apps don't exist on production, so it shows error/login page

**Solution:** Create the apps on production (scaffoldtool.vercel.app)

**Scenario B: Wrong Route**
- The forms are using a route that includes the navbar
- Should use `/embed/form` route which has no navbar

**Solution:** Already fixed in code - the embed URL uses `/embed/form`

### To Fix:
1. Make sure your apps exist on **production** Scaffold
2. Use the production app IDs in Vercel env vars
3. Redeploy

---

## Issue 4: Rename Functionality

**Coming next!** I'll add a 3-dot menu with:
- "Rename" option (black text)
- "Delete" option (red text with trash icon)

This will replace the current trash can icon.

---

## Quick Checklist

- [ ] Created "Builder Help" app on **production Scaffold**
- [ ] Created "Template Improver" app on **production Scaffold**
- [ ] Copied both app IDs
- [ ] Added both env vars to **Vercel dashboard** (not just .env.local)
- [ ] Redeployed on Vercel
- [ ] Tested help icons
- [ ] Tested template improver

If all checked, it should work!

---

## Need More Help?

**Tell me:**
1. What's in your Vercel environment variables?
2. What are your app IDs?
3. Are you testing on localhost or production?
4. What does the browser console show when you hover an ℹ️ icon?
