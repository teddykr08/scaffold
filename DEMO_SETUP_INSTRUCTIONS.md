# Demo Form Setup Instructions

## Step 1: Create the Demo App in Scaffold

1. Go to your Scaffold builder at https://scaffoldtool.vercel.app/builder
2. Click "New Project +"
3. Name it: **"Scaffold Demo"**
4. Click into the new project

## Step 2: Create the Demo Task

1. Click "New Task +"
2. Name it: **"show_demo"** (exactly as written, lowercase with underscore)
3. Click into the new task

## Step 3: Add the Prompt Template

Paste this template:

```
You're a salesman explaining Scaffold to a potential user. Here's what Scaffold is:

**Scaffold is a no-code AI app builder that lets anyone create custom AI-powered tools in minutes.** Instead of wrestling with ChatGPT prompts or paying thousands for custom development, you simply fill out a form describing what you want, and Scaffold builds it for you instantly. It's like having a personal AI developer that works for free.

Here's what makes Scaffold revolutionary:
- **For beginners:** Build your first AI app in under 5 minutes. No coding, no prompting skills, just fill out simple forms.
- **For power users:** Chain multiple AI tasks together, create complex workflows, embed apps anywhere.
- **For developers:** Skip the boilerplate. Build production-ready AI features without touching OpenAI's API.
- **For businesses:** Replace $10k+ custom developments with $0 Scaffold apps. Deploy in minutes, not months.

From simple one-off tasks (like "summarize this text") to full-featured applications (like customer service bots, content generators, data analyzers, study tutors, recipe planners, fitness coaches, writing assistants, and more), Scaffold handles it all.

Now, here's the user's specific situation:
- **Their coding experience (1-10):** {coding_experience}
- **What they currently use to build AI apps:** {current_tool}
- **App idea (optional):** {app_idea}

Your job: Write a compelling, personalized pitch that shows them exactly why Scaffold is PERFECT for their skill level. Use language and vocabulary that matches their coding experience level. For a 1-3, explain it like they've never coded before ("no coding required, just click and type"). For a 4-7, use terms like "workflow builder" and "no API setup needed". For an 8-10, mention "skip the boilerplate", "production-ready", and "API abstraction".

IMPORTANT: Always emphasize that Scaffold is PERFECTLY suited for their exact skill level. Whether they're a complete beginner or expert developer, Scaffold is the ideal tool for them (because it truly is for everyone).

Compare Scaffold to {current_tool}:
- If "API keys": Show how Scaffold eliminates the complexity of API setup, rate limits, prompt engineering
- If "Nothing": Perfect! Show them how easy it is to start from zero
- If "I don't know": Reassure them that's exactly why Scaffold exists - no prior knowledge needed

If they provided an {app_idea}, give them specific, concrete examples of what they can build related to their idea. Show them the exact features and capabilities Scaffold offers for that type of app.

Make it personal, match their technical level, and CONVINCE them to click "Build Your Own App"!
```

## Step 4: Add Three Fields

### Field 1: Number
- **Field Name:** `coding_experience`
- **Field Label:** "What's your coding experience? (1-10)"
- **Field Type:** Number
- **Min:** 1
- **Max:** 10

### Field 2: Dropdown
- **Field Name:** `current_tool`
- **Field Label:** "What do you currently use to build AI apps?"
- **Field Type:** Dropdown
- **Options (one per line):**
  ```
  API keys
  Nothing
  I don't know
  ```

### Field 3: Short Text (Optional)
- **Field Name:** `app_idea`
- **Field Label:** "What kind of app do you want to build? (optional)"
- **Field Type:** Short Text
- **Placeholder:** "e.g., study tutor, recipe generator, fitness coach..."
- **Required:** No (make sure to uncheck the "Required" checkbox)

## Step 5: Get Your App ID

1. After saving all fields, look at the URL in your browser
2. It will look like: `https://scaffoldtool.vercel.app/builder/[APP_ID]/show_demo`
3. Copy the APP_ID (the long string with letters and numbers)

## Step 6: Add Environment Variable

Add this line to your `.env.local` file:
```
NEXT_PUBLIC_DEMO_APP_ID=YOUR_APP_ID_HERE
```

Replace `YOUR_APP_ID_HERE` with the actual app ID from Step 5.

## Step 7: Deploy to Vercel

1. Push your code to GitHub
2. Go to your Vercel dashboard
3. Go to Settings → Environment Variables
4. Add: `NEXT_PUBLIC_DEMO_APP_ID` with your app ID value
5. Redeploy

## Testing

Once deployed, visit:
- https://scaffoldtool.vercel.app/demo

You should see:
- A beautiful landing page with "🎨 Try Scaffold" header
- An embedded form with your three questions
- After submitting, a personalized explanation
- A "Build Your Own App" button at the bottom

---

## What This Demo Does

When someone visits the demo:
1. They answer 3 quick questions about what they want to build
2. They see an instant AI-generated explanation customized to their needs
3. They understand how Scaffold can help them specifically
4. They're excited to click "Build Your Own App" and get started!

This showcases Scaffold's power while also serving as a lead generation tool.
