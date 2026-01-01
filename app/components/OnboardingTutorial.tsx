"use client";

import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, EVENTS } from "react-joyride";
import { usePathname } from "next/navigation";

export default function OnboardingTutorial() {
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const pathname = usePathname();

    const [mounted, setMounted] = useState(false);

    // -- Client-side only rendering & State Check --
    useEffect(() => {
        setMounted(true);
        const completed = localStorage.getItem("scaffold_tutorial_completed_v3");
        if (!completed) {
            setRun(true);
        }
    }, []);


    // -- Event Listeners & Auto-Advance Logic --
    useEffect(() => {
        if (!run) return;

        // handleCustomLogic: advances step when specific event fires
        // ONLY if we are on the expected step index to avoid jumping
        const handleAppCreated = () => {
            if (stepIndex === 3) setStepIndex(4); // Create Project -> Open Project
        };
        const handleTasksLoaded = () => {
            // If we are waiting to Create Task (Step 5)
            // We ensure we only advance if we're actually there
        };

        const handleTaskCreated = () => {
            if (stepIndex === 5) setStepIndex(6); // Create Task -> Open Task
        };

        const handleFieldAdded = () => {
            if (stepIndex === 8) setStepIndex(9); // Add Field -> Template Info
        };

        window.addEventListener('scaffold-app-created', handleAppCreated);
        window.addEventListener('scaffold-task-created', handleTaskCreated);
        window.addEventListener('scaffold-field-added', handleFieldAdded);

        return () => {
            window.removeEventListener('scaffold-app-created', handleAppCreated);
            window.removeEventListener('scaffold-task-created', handleTaskCreated);
            window.removeEventListener('scaffold-field-added', handleFieldAdded);
        };
    }, [stepIndex, run]);

    // -- Pathname Navigation Logic --
    useEffect(() => {
        if (!run) return;

        // Step 4 (Open Project) -> Step 5 (Create Task)
        // User clicks project card -> navigates to /builder/[appId]
        if (stepIndex === 4 && pathname?.match(/^\/builder\/[^/]+$/)) {
            // Wait for DOM to assume readiness, but we rely on Joyride finding target
            setStepIndex(5);
        }

        // Step 6 (Open Task) -> Step 7 (Add Fields)
        // User clicks task card -> navigates to /builder/[appId]/[taskId]
        if (stepIndex === 6 && pathname?.match(/^\/builder\/[^/]+\/[^/]+$/)) {
            setStepIndex(7);
        }

    }, [pathname, stepIndex, run]);


    /* 
       STEPS RESTRUCTURED:
       0. Welcome
       1. Example Projects
       2. Click Create Project (Button)
       3. Fill Project Name & Submit (Modal) -> auto advances on 'scaffold-app-created'
       4. Open Project (Card) -> auto advances on navigation
       5. Create Task (Button)
       6. Fill Task Name & Submit (Modal) -> auto advances on 'scaffold-task-created'
       7. Open Task (Card) -> auto advances on navigation
       8. Add Field (Inputs) -> auto advances on 'scaffold-field-added'
       9. Template Explanation
       10. Embed Code
       11. Done
    */

    const steps: Step[] = [
        // Step 0: Welcome
        {
            content: (
                <div className="text-left space-y-2">
                    <h2 className="text-xl font-bold">Welcome to Scaffold! 👋</h2>
                    <p>Let's create your first AI prompt form in just a minute.</p>
                    <ul className="list-disc pl-5 text-sm space-y-1 opacity-80">
                        <li>Build AI tools without code</li>
                        <li>Embed them anywhere</li>
                        <li>Zero setup required</li>
                    </ul>
                </div>
            ),
            locale: { skip: "Skip Tutorial" },
            placement: "center",
            target: "body",
            disableBeacon: true,
        },
        // Step 1: Example Projects
        {
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-bold flex items-center gap-2">Example Projects 📚</h3>
                    <p>We've created 3 examples for you to explore.</p>
                    <ul className="list-disc pl-5 text-sm space-y-1 opacity-80">
                        <li><b>Recipe Genius</b>: Formless task (uses URL data)</li>
                        <li><b>Study Tutor</b>: Standard form with inputs</li>
                        <li><b>Personal Trainer</b>: Another standard form</li>
                    </ul>
                    <p className="text-xs text-gray-400 mt-2">(You can delete these later to make space!)</p>
                </div>
            ),
            target: '[data-tour="example-projects-grid"]',
            placement: "bottom",
            disableBeacon: true,
        },
        // Step 2: Start Create Project
        {
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-bold">Create Your First Project 🚀</h3>
                    <p>Projects hold your forms. Let's make one now.</p>
                    <ul className="list-disc pl-5 text-sm space-y-1 opacity-80">
                        <li>Give it a name like <b>"My First App"</b></li>
                        <li>Click <b>"Create App"</b> when done</li>
                    </ul>
                </div>
            ),
            target: '[data-tour="create-project"]',
            placement: "right",
            spotlightClicks: true,
            disableBeacon: false,
            // User manually types and clicks Create. 
            // We listen for 'scaffold-app-created' to advance, or they can click Next if it gets stuck.
            styles: { buttonNext: { display: 'block' } as any }
        },
        // Step 3: Wait for Creation (Hidden Step, effectively handled by Step 2 logic but keeping index aligned)
        // actually we can merge logic. Step 2 waits. 
        // But we need a visual cue? No, Step 2 popup stays until event fires. 
        // Then we move to Step 4.
        {
            content: "Processing...",
            target: 'body',
            placement: 'center',
            styles: { options: { display: 'none' } as any } // invisible step if needed, but we skip it in logic
        },

        // Step 4: Open Project
        {
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-bold">Open Your Project 📂</h3>
                    <p>Great! Your project is ready.</p>
                    <p><b>Click on your new project card</b> to enter the dashboard.</p>
                </div>
            ),
            // Targeting the generic class might select all, but usually focuses the first or last depending. 
            // Since we just added one, we'll target the wrapper or the user just sees the highlight.
            // Ideally we'd target the *new* one, but generic is okay as long as they click one.
            // We want the user to click the NEWEST project, which appears last or first depending on sort.
            // In our case, it's just one of the cards. We can target all and let user pick.
            target: '[data-tour="project-card"]',
            placement: "top",
            spotlightClicks: true,
            disableBeacon: false,
        },

        // Step 5: Create Task
        {
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-bold">Create a Task ⚡</h3>
                    <p>Tasks are the actual actions your AI will perform.</p>
                    <ul className="list-disc pl-5 text-sm space-y-1 opacity-80">
                        <li>Click <b>"New Task"</b></li>
                        <li>Name it (e.g. "Write Email")</li>
                        <li>Click <b>"Create"</b></li>
                    </ul>
                </div>
            ),
            target: '[data-tour="create-task"]',
            placement: "right",
            spotlightClicks: true,
            disableBeacon: false,
        },

        // Step 6: Wait for Task Creation (Hidden/Placeholder)
        {
            content: "Processing...",
            target: 'body',
            placement: 'center',
            styles: { options: { display: 'none' } as any }
        },

        // Step 7: Open Task
        {
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-bold">Open Task Editor ✏️</h3>
                    <p>Task created! Now let's build the form.</p>
                    <p><b>Click on your new task card</b> to open the editor.</p>
                </div>
            ),
            target: '[data-tour="task-card"]',
            placement: "top",
            spotlightClicks: true,
        },

        // Step 8: Add Fields
        {
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-bold">Add Input Fields 📝</h3>
                    <p>Fields are questions your users will answer.</p>
                    <ul className="list-disc pl-5 text-sm space-y-1 opacity-80">
                        <li>Add a field like <b>"Topic"</b> or <b>"Tone"</b></li>
                        <li>Click <b>"Add Field"</b> to save it</li>
                    </ul>
                </div>
            ),
            target: '[data-tour="add-field"]',
            placement: "right",
            spotlightClicks: true,
        },

        // Step 9: Template Explanation
        {
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-bold">The Prompt Template 🤖</h3>
                    <p>This is where the magic happens. You write instructions for the AI.</p>
                    <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono my-2 text-gray-700">
                        "Write a blog post about <span className="text-blue-600 font-bold">{"{{topic}}"}</span>..."
                    </div>
                    <p>Use the <b>variable buttons</b> on the left to insert user answers.</p>
                </div>
            ),
            target: '[data-tour="template-editor"]',
            placement: "left", // Screen might be tight on right
        },

        // Step 10: Embed Code
        {
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-bold">Embed Anywhere 🌍</h3>
                    <p>Your form is ready to go live!</p>
                    <ul className="list-disc pl-5 text-sm space-y-1 opacity-80">
                        <li>Copy this HTML code</li>
                        <li>Paste it into your website, Notion, or Webflow</li>
                        <li>No API keys needed!</li>
                    </ul>
                </div>
            ),
            target: '[data-tour="embed-code"]',
            placement: "center",
        },

        // Step 11: Done
        {
            content: (
                <div className="text-left space-y-2">
                    <h2 className="text-xl font-bold">You're a Pro! 🎉</h2>
                    <p>You've built your first AI tool. Now go build something amazing.</p>
                    <button className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm mt-2 w-full" onClick={() => {
                        // Custom finish action if needed
                    }}>Let's Go!</button>
                </div>
            ),
            target: 'body',
            placement: "center",
            locale: { last: "Finish" }
        },
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, index, action } = data;

        // Auto-skip the "Processing" placeholder steps if somehow they get hit manually or via auto-advance logic
        if (type === EVENTS.STEP_AFTER) {
            // If we just finished Step 2 (Create Project Setup), logic handles jump to 4 technically?
            // If user clicks "Next" on a step where we disabled "Next", it shouldn't happen.
            // But for normal steps, just advance index:
            if (action === 'next' || action === 'close') {
                setStepIndex(index + 1);
            }
        }

        // Handle "Processing" steps skipping automatically if they render
        if (type === EVENTS.STEP_BEFORE && (index === 3 || index === 6)) {
            // These are fallback steps, usually we jump over them in state, but if we land here, just go next
            // setStepIndex(index + 1);
        }

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setRun(false);
            localStorage.setItem("scaffold_tutorial_completed_v3", "true");
        }
    };

    // Listen for manual restart
    useEffect(() => {
        const handleRestart = () => {
            localStorage.removeItem("scaffold_tutorial_completed_v3");
            setStepIndex(0);
            setRun(true);
        };
        window.addEventListener('scaffold-restart-tutorial', handleRestart);
        return () => window.removeEventListener('scaffold-restart-tutorial', handleRestart);
    }, []);

    if (!mounted) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            continuous
            showProgress
            showSkipButton
            disableScrolling={true} // Changed to true to prevent Popper/Target issues
            disableOverlayClose={true} // Force user to follow path
            locale={{
                back: "Back",
                close: "Close",
                last: "Finish",
                next: "Next",
                skip: "Skip Tutorial",
            }}
            styles={{
                options: {
                    primaryColor: '#000',
                    zIndex: 10000,
                },
                tooltipContainer: {
                    textAlign: 'left',
                    fontSize: '14px'
                },
                buttonNext: {
                    backgroundColor: '#000',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                }
            }}
            callback={handleJoyrideCallback}
            floaterProps={{
                disableAnimation: true,
            }}
        />
    );
}
