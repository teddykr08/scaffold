# Tutorial System Quick Reference

## 🎯 Tutorial Events

Dispatch these events to trigger tutorial advancement:

```typescript
// App created - advances from step 2 → 3
window.dispatchEvent(new CustomEvent('scaffold-app-created'));

// Task created - advances from step 5 → 6
window.dispatchEvent(new CustomEvent('scaffold-task-created'));

// Field added - advances from step 7 → 9 (also scrolls to template)
window.dispatchEvent(new CustomEvent('scaffold-field-added'));

// Restart tutorial (clears completion state)
window.dispatchEvent(new CustomEvent('scaffold-restart-tutorial'));
```

## 📍 Section Scrolling

Scroll to specific sections on the task editor page:

```typescript
// Available on /builder/[app_id]/[task_name] only
(window as any).scrollToSection('embed');    // Embed configuration
(window as any).scrollToSection('fields');   // Field management
(window as any).scrollToSection('template'); // Prompt template
```

## 🗂️ Tutorial State

LocalStorage keys:

```typescript
// Current tutorial state (step index + page)
localStorage.getItem('scaffold_tutorial_state_v4');

// Completion flag
localStorage.getItem('scaffold_tutorial_completed_v4');

// Clear tutorial (will restart on next visit)
localStorage.removeItem('scaffold_tutorial_completed_v4');
localStorage.removeItem('scaffold_tutorial_state_v4');
```

## 🏗️ Data Tour Attributes

Add these to elements for tutorial targeting:

```tsx
// Dashboard page
<div data-tour="example-projects-grid">...</div>
<div data-tour="create-project">...</div>
<div data-tour="project-card">...</div>

// App tasks page
<div data-tour="create-task">...</div>
<div data-tour="task-card">...</div>

// Task editor page
<div data-tour="embed-code">...</div>
<div data-tour="add-field">...</div>
<div data-tour="template-editor">...</div>
```

## 📊 Tutorial Flow

```
/builder (Dashboard)
├─ Step 0: Welcome ●━━━━━━━━━━━━━━━━━━━━
├─ Step 1: Example Projects
├─ Step 2: Create Project → [USER ACTION] → scaffold-app-created event
└─ Step 3: Open Project Card → [USER CLICK]
    ↓
/builder/[app_id] (App Tasks)
├─ Step 4: (Auto-navigated)
├─ Step 5: Create Task → [USER ACTION] → scaffold-task-created event
└─ Step 6: Open Task Card → [USER CLICK]
    ↓
/builder/[app_id]/[task_name] (Task Editor)
├─ Step 7: Add Field → [USER ACTION] → scaffold-field-added event
├─ Step 8: (Auto-scroll to template)
├─ Step 9: Template Explanation
├─ Step 10: Embed Code
└─ Step 11: Done ━━━━━━━━━━━━━━━━━━━━● ✅
```

## 🔍 Debug Tutorial

Check console logs:

```
[Tutorial] App created event, current step: X
[Tutorial] Task created event, current step: X
[Tutorial] Field added event, current step: X
[Tutorial] Navigated to app tasks page
[Tutorial] Navigated to task editor page
[Tutorial] Callback: {status, type, index, action}
```

## ⚙️ Joyride Config

Current settings:

```typescript
<Joyride
  steps={steps}
  run={true}                    // Tutorial active
  stepIndex={X}                 // Current step (0-11)
  continuous={true}             // Show Next button
  showProgress={true}           // Show "X of Y" progress
  showSkipButton={true}         // Allow skipping
  disableScrolling={false}      // Allow page scrolling
  disableOverlayClose={true}    // Must use buttons
/>
```

## 🎨 Step Properties

Key properties for each step:

```typescript
{
  target: '[data-tour="selector"]',  // CSS selector
  content: <JSX />,                  // Popup content
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center',
  spotlightClicks: true,             // Allow interaction
  disableBeacon: true,               // Skip pulsing beacon
}
```

## 🚨 Common Issues

1. **Tutorial doesn't start**: Check localStorage completion flags
2. **Wrong step on page refresh**: Clear `scaffold_tutorial_state_v4`
3. **Popup blocks element**: Adjust `placement` property
4. **Auto-advance not working**: Verify event name matches exactly
5. **Scroll not working**: Check if `scrollToSection` is defined

## 🧹 Reset Everything

Complete reset for testing:

```typescript
// In browser console
localStorage.removeItem('scaffold_tutorial_completed_v4');
localStorage.removeItem('scaffold_tutorial_state_v4');
location.reload();
```
