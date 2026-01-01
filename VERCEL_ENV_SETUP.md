# Vercel Environment Variable Setup

## You need to add env vars to Vercel, not just .env.local!

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Settings" tab
4. Click "Environment Variables" in left sidebar

### Step 2: Add Both Variables
Add these two variables:

**Variable 1:**
- Name: `NEXT_PUBLIC_HELP_APP_ID`
- Value: [paste your Builder Help app ID here]
- Environment: Production, Preview, Development (check all)

**Variable 2:**
- Name: `NEXT_PUBLIC_IMPROVER_APP_ID`
- Value: [paste your Template Improver app ID here]
- Environment: Production, Preview, Development (check all)

### Step 3: Redeploy
After adding the variables, you MUST redeploy:
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for deployment to finish

### Step 4: Verify
Check if the environment variables are working:
1. Open browser console (F12)
2. Type: `console.log(process.env.NEXT_PUBLIC_HELP_APP_ID)`
3. Should show your app ID, not undefined

## Common Mistakes

❌ Only added to .env.local (localhost only)
❌ Forgot to redeploy after adding env vars
❌ Typo in variable names (must match exactly)
❌ Used wrong app IDs

✅ Added to Vercel dashboard
✅ Redeployed after adding
✅ Names match exactly: NEXT_PUBLIC_HELP_APP_ID
✅ Values are the correct UUIDs from Scaffold
