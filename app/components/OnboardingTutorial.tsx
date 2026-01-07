"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Joyride, { CallBackProps, Step, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { usePathname } from 'next/navigation';

const TUTORIAL_COMPLETED_KEY = 'hasSeenTutorial';
const TUTORIAL_STORAGE_KEY = 'scaffoldTutorialState';

const OnboardingTutorial: React.FC = () => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [userClickedNext, setUserClickedNext] = useState(false); // Track if user clicked Next to skip
  const pathname = usePathname();

  // Save/load tutorial state
  const saveTutorialState = useCallback((step: number) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify({ stepIndex: step }));
  }, []);

  const loadTutorialState = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  }, []);

  // Memoize steps to prevent recreating on every render
  const steps: Step[] = useMemo(() => [
    // Step 0: Welcome Screen
    {
      content: (
        <div className="text-left space-y-3">
          <h2 className="text-2xl font-bold">Welcome to Scaffold! 🎉</h2>
          <p className="text-sm">Let&apos;s create your first AI-powered form in just 4 steps:</p>
          <p className="text-xs text-gray-600 italic">💡 Projects are folders that organize your tasks</p>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mt-4 mb-3">
            <p className="text-xs font-bold text-gray-700 mb-2">WHAT WE&apos;LL BUILD:</p>
            <div className="space-y-1 text-sm">
              <p className="text-sm">
                <span className="font-semibold">Project:</span>{' '}
                <span className="text-[#fdcd13] font-semibold">Food App</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold">Task:</span>{' '}
                <span className="text-[#fdcd13] font-semibold">Restaurant Finder</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold">Fields:</span>{' '}
                <span className="text-gray-700">City/Town, Budget</span>
              </p>
            </div>
          </div>
          
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Create a project called <span className="font-semibold">&quot;Food App&quot;</span></li>
            <li>Add a task called <span className="font-semibold">&quot;Restaurant Finder&quot;</span></li>
            <li>Customize your form with fields</li>
            <li>See the magic happen! ✨</li>
          </ol>
        </div>
      ),
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      disableOverlay: false,
      locale: { 
        skip: 'Skip Tutorial',
        next: 'Start (Step 1 of 13)'
      },
      styles: {
        spotlight: {
          display: 'none'
        },
        buttonBack: {
          display: 'none'
        }
      }
    },

    // Step 1: Example Project
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Example Project 📚</h3>
          <p>We&apos;ve created 1 example to inspire you:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><b>Study Tutor</b>: Standard form with inputs</li>
          </ul>
          <p className="text-xs text-gray-400 mt-2">(You can explore or delete this later!)</p>
        </div>
      ),
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      disableOverlay: false,
      styles: {
        spotlight: {
          display: 'none'
        }
      }
    },

    // Step 2: Create Your Project
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Create Your Project 🚀</h3>
          <p className="text-sm">Projects are folders that organize your tasks into apps.</p>
          <p className="text-xs text-gray-500 italic">Think of them like containers that group related tasks together.</p>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mt-4 mb-3">
            <p className="text-xs font-bold text-gray-700 mb-2">EXAMPLE:</p>
            <div className="space-y-1 text-sm">
              <p className="text-sm">
                <span className="font-semibold">Project Name:</span>{' '}
                <span className="text-[#fdcd13] font-semibold">Food App</span>
              </p>
            </div>
          </div>

          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            <li>Type <b>&quot;Food App&quot;</b> in the name field</li>
            <li>Click <b>&quot;Create Project&quot;</b></li>
          </ul>
        </div>
      ),
      target: '[data-tour="create-project"]',
      placement: 'top',
      disableBeacon: true,
      spotlightClicks: true,
      disableOverlay: true,
      styles: {
        spotlight: {
          display: 'none'
        }
      }
    },

    // Step 3: Open Your Project
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Open Your Project 📂</h3>
          <p className="text-sm">Great! Your project is ready.</p>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mt-4 mb-3">
            <p className="text-xs font-bold text-gray-700 mb-2">WHAT TO CLICK:</p>
            <div className="space-y-1 text-sm">
              <p className="text-sm">
                Click the <span className="text-[#fdcd13] font-semibold">Food App</span> card
              </p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 italic border-t border-gray-300 pt-2 mt-2">
            💡 You must click the card to continue
          </p>
        </div>
      ),
      target: '[data-tour="project-card"]',
      placement: 'top',
      disableBeacon: false,
      disableOverlay: true,
      styles: {
        spotlight: {
          display: 'none'
        },
        buttonNext: {
          display: 'none'
        }
      }
    },

    // Step 4: Create Your First Task (button click)
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Create Your First Task ⚡</h3>
          <p className="text-sm">Tasks are the actual AI actions your users will perform.</p>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mt-4 mb-3">
            <p className="text-xs font-bold text-gray-700 mb-2">EXAMPLE:</p>
            <div className="space-y-1 text-sm">
              <p className="text-sm">
                <span className="font-semibold">Task Name:</span>{' '}
                <span className="text-[#fdcd13] font-semibold">Restaurant Finder</span>
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-700">
            Click <b>&quot;New Task&quot;</b> to get started.
          </p>
          <p className="text-xs text-gray-500 italic mt-3 pt-2 border-t border-gray-300">
            💡 Or click Next to skip and explore the task editor
          </p>
        </div>
      ),
      target: '[data-tour="create-task"]',
      placement: 'right',
      disableBeacon: false,
      spotlightClicks: true,
      disableOverlay: true,
      styles: {
        spotlight: {
          display: 'none'
        },
        tooltip: {
          transition: 'opacity 0.2s',
        }
      }
    },

    // Step 5: Fill in Task Name (modal input)
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Name Your Task ✏️</h3>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mt-2 mb-3">
            <p className="text-xs font-bold text-gray-700 mb-2">EXAMPLE:</p>
            <div className="space-y-1 text-sm">
              <p className="text-sm">
                <span className="font-semibold">Task Name:</span>{' '}
                <span className="text-[#fdcd13] font-semibold">Restaurant Finder</span>
              </p>
            </div>
          </div>

          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            <li>Type <b>&quot;Restaurant Finder&quot;</b></li>
            <li>Click <b>&quot;Create Task&quot;</b></li>
          </ul>
          <p className="text-xs text-gray-500 italic mt-3 pt-2 border-t border-gray-300">
            💡 Or click Next to skip and explore the task editor
          </p>
        </div>
      ),
      target: '[data-tour="task-name-input"]',
      placement: 'left',
      disableBeacon: true,
      spotlightClicks: true,
      disableOverlay: true,
      floaterProps: {
        offset: 25,
        disableFlip: false,
      },
      styles: {
        spotlight: {
          display: 'none'
        },
        tooltip: {
          zIndex: 10002,
        }
      }
    },

    // Step 6: Open Your Task
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Open Your Task ✏️</h3>
          <p className="text-sm">
            Now let&apos;s open the task editor to build your form.
          </p>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mt-4 mb-3">
            <p className="text-xs font-bold text-gray-700 mb-2">WHAT TO CLICK:</p>
            <div className="space-y-1 text-sm">
              <p className="text-sm">
                Click the <span className="text-[#fdcd13] font-semibold">Restaurant Finder</span> task card
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Or any task card if you created a different one)
              </p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 italic mt-2">
            💡 You must click a task card to continue
          </p>
        </div>
      ),
      target: '[data-tour="task-card"]',
      placement: 'left',
      disableBeacon: false,
      disableOverlay: true,
      styles: {
        spotlight: {
          display: 'none'
        },
        buttonNext: {
          display: 'none'
        }
      }
    },

    // Step 7: Customize Your Form
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Customize Your Form 🎨</h3>
          <p className="text-sm">
            Make your form match your brand! Change colors and fonts so it fits 
            perfectly into your website.
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700 mt-2">
            <li>Pick a custom color for buttons</li>
            <li>Select your favorite font</li>
            <li>See changes update instantly</li>
          </ul>
        </div>
      ),
      target: '[data-tour="customization-section"]',
      placement: 'right',
      disableBeacon: true,
      disableScrolling: true,
      disableOverlay: true,
      floaterProps: {
        disableAnimation: true,
        disableFlip: true,
      },
      styles: {
        spotlight: {
          display: 'none'
        }
      }
    },

    // Step 8: Fixed Field
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Fixed Field 🔒</h3>
          <p className="text-sm">
            This is a <b>special field</b> that&apos;s <b>not in your prompt template</b> and
            <b> not controlled by users</b>.
          </p>
          <p className="text-sm text-gray-700">
            It&apos;s app-side data that you set once—like &quot;food&quot; for a restaurant 
            finder—and it stays the same for every submission.
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700 mt-2">
            <li><b>Not in template:</b> Separate from your {"{{field}}"} variables</li>
            <li><b>Not user-controlled:</b> They never see or change it</li>
            <li><b>Powers the (i) feature:</b> All (i) apps use the same template but different fixed fields</li>
          </ul>
          <p className="text-xs text-gray-500 italic mt-3 pt-2 border-t border-gray-300">
            ℹ️ Use the (i) icon for questions or more information
          </p>
        </div>
      ),
      target: '[data-tour="fixed-field-toggle"]',
      placement: 'left',
      disableBeacon: true,
      disableScrolling: false,
      disableOverlay: true,
      floaterProps: {
        disableAnimation: true,
        disableFlip: true,
      },
      styles: {
        spotlight: {
          display: 'none'
        }
      }
    },

    // Step 9: Add Form Fields
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Add Form Fields 📝</h3>
          <p className="text-sm">
            Fields are the <b>user-controlled inputs</b> that appear in your form. 
            They insert directly into your prompt template.
          </p>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mt-4 mb-3">
            <p className="text-xs font-bold text-gray-700 mb-2">EXAMPLE FIELDS:</p>
            <div className="space-y-2 text-sm">
              <div className="pb-2 border-b border-gray-300">
                <p className="text-sm">
                  <span className="font-semibold">Field 1:</span>{' '}
                  <span className="text-[#fdcd13] font-semibold">City/Town</span>
                </p>
                <p className="text-xs text-gray-600">Type: Text</p>
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-semibold">Field 2:</span>{' '}
                  <span className="text-[#fdcd13] font-semibold">Budget</span>
                </p>
                <p className="text-xs text-gray-600">Type: Select</p>
                <p className="text-xs text-gray-600">Options: $, $$, $$$</p>
              </div>
            </div>
          </div>

          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            <li>Add fields like <b>&quot;City/Town&quot;</b> and <b>&quot;Budget&quot;</b></li>
            <li>Choose field types (text, dropdown, number)</li>
            <li>Click <b>&quot;Add Field&quot;</b> to save</li>
          </ul>
          
          <p className="text-xs text-gray-500 italic mt-3 pt-2 border-t border-gray-300">
            ℹ️ Use the (i) icon for questions or more information
          </p>
        </div>
      ),
      target: '[data-tour="fields-section"]',
      placement: 'left',
      disableBeacon: true,
      disableScrolling: false,
      disableOverlay: true,
      styles: {
        spotlight: {
          display: 'none'
        }
      }
    },

    // Step 10: Write Your AI Prompt
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Write Your AI Prompt 🤖</h3>
          <p className="text-sm">
            This is the <b>brain of your form</b>. Tell the AI what to do 
            with the user&apos;s answers.
          </p>
          <p className="text-sm text-gray-700">
            You can write anything from a single sentence to paragraphs of 
            context—give the AI an identity, tone, or detailed instructions 
            to get perfect responses.
          </p>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mt-4 mb-3">
            <p className="text-xs font-bold text-gray-700 mb-2">EXAMPLE:</p>
            <div className="space-y-1 text-sm">
              <p className="text-sm font-mono">
                Find restaurants in <span className="text-[#fdcd13] font-semibold">{'{{city_town}}'}</span>
                {' '}with a budget of <span className="text-[#fdcd13] font-semibold">{'{{budget}}'}</span>.
              </p>
            </div>
          </div>

          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            <li>Use <b>{'{{field_name}}'}</b> to insert user answers</li>
            <li>Click field buttons on the left to auto-insert</li>
            <li>Use the <b>Template Improver</b> tool to refine your prompt</li>
          </ul>
          
          <p className="text-xs text-gray-500 italic mt-3 pt-2 border-t border-gray-300">
            ℹ️ Use the (i) icon for questions or more information
          </p>
        </div>
      ),
      target: '[data-tour="template-editor"]',
      placement: 'left',
      disableBeacon: true,
      disableScrolling: false,
      disableOverlay: true,
      styles: {
        spotlight: {
          display: 'none'
        }
      }
    },

    // Step 11: Live Preview
    {
      content: (
        <div className="text-left space-y-3">
          <h3 className="text-xl font-bold">Live Preview 👀</h3>
          <p>See your form in action! This preview updates in real-time.</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
            <li>Test your form as users will see it</li>
            <li>Changes appear instantly</li>
            <li>Try filling it out!</li>
          </ul>
        </div>
      ),
      target: '[data-tour="form-preview"]',
      placement: 'left',
      disableBeacon: true,
      disableScrolling: true,
      disableOverlay: true,
      floaterProps: {
        offset: 15,
      },
      styles: {
        spotlight: {
          display: 'none'
        },
        tooltip: {
          transform: 'translateX(-20px)',
        }
      }
    },

    // Step 12: Ready to Embed!
    {
      content: (
        <div className="text-left space-y-3">
          <h2 className="text-2xl font-bold">You&apos;re Ready to Embed! 🎉</h2>
          <p className="text-lg">Congratulations! You&apos;ve built your first AI tool.</p>
          
          <div className="bg-[#fdcd13] bg-opacity-20 border-2 border-[#fdcd13] rounded-lg p-3 my-3">
            <p className="font-bold text-sm">📋 Next Steps:</p>
            <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
              <li>Scroll down to copy your <b>embed code</b></li>
              <li>Paste it into your website, Notion, or Webflow</li>
              <li>No API keys needed—it just works!</li>
            </ul>
          </div>
          
          <p className="text-xs text-gray-500 italic">
            💡 Try customizing colors and adding more fields to make it your own!
          </p>
        </div>
      ),
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      disableOverlay: false,
      locale: { last: 'Finish Tutorial' },
      styles: {
        spotlight: {
          display: 'none'
        }
      }
    },
  ], []); // Empty dependency array since steps don't depend on any props or state

  useEffect(() => {
    if (stepIndex === 3) {
      const checkNavigation = setInterval(() => {
        // Check if pathname matches UUID pattern: /builder/[uuid]
        const uuidPattern = /^\/builder\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isOnProjectPage = pathname && uuidPattern.test(pathname);
        
        if (isOnProjectPage) {
          console.log('✅ Navigation to project page detected! Advancing to step 4');
          clearInterval(checkNavigation);
          setStepIndex(4);
        }
      }, 300);

      const timeout = setTimeout(() => {
        clearInterval(checkNavigation);
      }, 15000);

      return () => {
        clearInterval(checkNavigation);
        clearTimeout(timeout);
      };
    }
  }, [stepIndex, pathname]);

  // Navigation detection: Step 6 → Step 7 (task card click → task editor)
  useEffect(() => {
    if (stepIndex === 6) {
      const checkNavigation = setInterval(() => {
        // Check if pathname matches: /builder/[uuid]/[task_name]
        const taskPagePattern = /^\/builder\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/.+$/i;
        const isOnTaskPage = pathname && taskPagePattern.test(pathname);
        
        if (isOnTaskPage) {
          console.log('✅ Navigation to task editor detected! Advancing to step 7');
          clearInterval(checkNavigation);
          setStepIndex(7);
        }
      }, 300);

      const timeout = setTimeout(() => {
        clearInterval(checkNavigation);
      }, 15000);

      return () => {
        clearInterval(checkNavigation);
        clearTimeout(timeout);
      };
    }
  }, [stepIndex, pathname]);

  // Improved auto-scroll with element polling
  useEffect(() => {
    if (run && stepIndex >= 0) {
      let pollCount = 0;
      const maxPolls = 30;
      
      const pollForElement = setInterval(() => {
        pollCount++;
        const currentStep = steps[stepIndex];
        const target = document.querySelector(currentStep.target as string);
        
        if (target) {
          clearInterval(pollForElement);
          
          // Step 7 (Customize Form) - disable scroll snap IMMEDIATELY
          if (stepIndex === 6) {
            const mainElement = document.querySelector('main');
            if (mainElement) {
              mainElement.style.scrollSnapType = 'none';
            }
          }
          
          const scrollDelay = 200;
          
          setTimeout(() => {
            // Steps 6, 7, 8 all use 'start' positioning
            const scrollBlock = (stepIndex === 8 || stepIndex === 7 || stepIndex === 6) ? 'start' : 'center';
            
            target.scrollIntoView({
              behavior: 'smooth',
              block: scrollBlock,
              inline: 'center'
            });
            
            // No double-scroll for steps 6, 7, 8
            if (stepIndex !== 6 && stepIndex !== 7 && stepIndex !== 8) {
              setTimeout(() => {
                target.scrollIntoView({
                  behavior: 'smooth',
                  block: scrollBlock,
                  inline: 'center'
                });
              }, 600);
            }
          }, scrollDelay);
        } else if (pollCount >= maxPolls) {
          console.warn(`⚠️ Target not found after ${maxPolls} attempts: ${currentStep.target}`);
          clearInterval(pollForElement);
        }
      }, 100);

      return () => clearInterval(pollForElement);
    }
  }, [stepIndex, run, steps]);

  // Manage scroll snap - disable for step 6 (Customize Form), enable for others
  useEffect(() => {
    if (!run) return;
    
    const mainElement = document.querySelector('main');
    if (!mainElement) return;
    
    if (stepIndex === 6) {
      mainElement.style.scrollSnapType = 'none';
    } else {
      mainElement.style.scrollSnapType = 'y proximity';
    }
    
    return () => {
      const main = document.querySelector('main');
      if (main) {
        main.style.scrollSnapType = 'y proximity';
      }
    };
  }, [stepIndex, run]);

  // Force tooltip repositioning when cards are deleted (Steps 3 & 6 only)
  useEffect(() => {
    if (!run) return;
    // Only watch for changes on steps that show project/task cards
    if (stepIndex !== 3 && stepIndex !== 6) return;
    
    let lastCardCount = -1;
    
    // Watch for changes to project and task cards
    const observer = new MutationObserver(() => {
      const currentStep = steps[stepIndex];
      const target = document.querySelector(currentStep.target as string);
      
      // Count cards to see if any were deleted
      const cards = document.querySelectorAll(currentStep.target as string);
      const currentCardCount = cards.length;
      
      if (lastCardCount !== -1 && currentCardCount < lastCardCount && target) {
        // Card was deleted, force tooltip repositioning
        console.log('[Tutorial] Card deleted, repositioning tooltip');
        setRun(false);
        setTimeout(() => {
          setRun(true);
        }, 50);
      }
      
      lastCardCount = currentCardCount;
    });
    
    // Observe the main content area for changes
    const mainContent = document.querySelector('main') || document.body;
    observer.observe(mainContent, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, [stepIndex, run, steps]);

  // Initialize tutorial state and listen for restart event
  useEffect(() => {
    setMounted(true);

    // Listen for restart event
    const restartHandler = () => {
      localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
      localStorage.removeItem(TUTORIAL_STORAGE_KEY);
      setStepIndex(0);
      setTimeout(() => setRun(true), 300);
    };
    window.addEventListener('scaffold-restart-tutorial', restartHandler);

    // Always auto-run if not completed, even on localhost or if localStorage is missing
    let completed = false;
    try {
      completed = !!localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    } catch (e) {
      completed = false;
    }
    if (completed) {
      setRun(false);
      return () => window.removeEventListener('scaffold-restart-tutorial', restartHandler);
    }

    if (!pathname?.startsWith('/builder')) {
      return () => window.removeEventListener('scaffold-restart-tutorial', restartHandler);
    }

    const savedState = loadTutorialState && loadTutorialState();
    let initialStep = 0;
    if (pathname.match(/^\/builder\/[^\/]+\/[^\/]+$/)) {
      initialStep = savedState?.stepIndex && savedState.stepIndex >= 7 ? savedState.stepIndex : 7;
    } else if (pathname.match(/^\/builder\/[^\/]+$/)) {
      initialStep = savedState?.stepIndex && savedState.stepIndex >= 4 && savedState.stepIndex <= 6 
        ? savedState.stepIndex 
        : 4;
    } else if (pathname === '/builder') {
      initialStep = savedState?.stepIndex && savedState.stepIndex <= 3 
        ? savedState.stepIndex 
        : 0;
    }
    setStepIndex(initialStep);
    setTimeout(() => {
      setRun(true);
    }, 800);

    return () => window.removeEventListener('scaffold-restart-tutorial', restartHandler);
  }, [pathname, loadTutorialState]);

  // Watch for location changes and adapt tutorial
  useEffect(() => {
    if (!run) return;
    
    console.log('[Tutorial] Location changed:', pathname, 'Current step:', stepIndex);
    
    // User navigated BACK to dashboard while in later steps
    if (pathname === '/builder' && stepIndex > 3) {
      console.log('[Tutorial] User went back to dashboard, adjusting to step 3');
      setStepIndex(3);
      saveTutorialState(3);
    }
    
    // User navigated BACK to tasks page while on task editor steps
    else if (pathname.match(/^\/builder\/[^\/]+$/) && stepIndex > 6) {
      console.log('[Tutorial] User went back to tasks page, adjusting to step 6');
      setStepIndex(6);
      saveTutorialState(6);
    }
    
    // User navigated FORWARD to tasks page from dashboard
    else if (pathname.match(/^\/builder\/[^\/]+$/) && stepIndex <= 3) {
      console.log('[Tutorial] User navigated to tasks page, advancing to step 4');
      setStepIndex(4);
      saveTutorialState(4);
    }
    
    // User navigated FORWARD to task editor from tasks page
    else if (pathname.match(/^\/builder\/[^\/]+\/[^\/]+$/) && stepIndex <= 6) {
      console.log('[Tutorial] User navigated to task editor, advancing to step 7');
      setTimeout(() => {
        setStepIndex(7);
        saveTutorialState(7);
      }, 1200);
    }
  }, [pathname, stepIndex, run, saveTutorialState]);

  // Event listener: App created (Step 2 → Step 3)
  useEffect(() => {
    if (!run) return;
    
    const handleAppCreated = () => {
      console.log('[Tutorial] App created event, current step:', stepIndex);
      if (stepIndex === 2) {
        console.log('[Tutorial] Advancing to step 3');
        setTimeout(() => {
          setStepIndex(3);
          saveTutorialState(3);
        }, 500);
      }
    };

    window.addEventListener('scaffold-app-created', handleAppCreated);
    return () => window.removeEventListener('scaffold-app-created', handleAppCreated);
  }, [stepIndex, run, saveTutorialState]);

  // Auto-advance when task modal opens (Step 4 → Step 5)
  useEffect(() => {
    if (!run) return;
    if (stepIndex !== 4) return;
    if (userClickedNext) return; // Don't detect modal if user clicked Next to skip

    console.log('[Tutorial] Watching for task modal to open...');
    
    let pollCount = 0;
    const maxPolls = 50;
    const pollInterval = setInterval(() => {
      pollCount++;
      const modalInput = document.querySelector('[data-tour="task-name-input"]');
      
      if (modalInput && (modalInput as HTMLElement).offsetParent !== null) {
        console.log('[Tutorial] Task modal opened! Advancing to step 5');
        clearInterval(pollInterval);
        // Advance immediately without delay
        setStepIndex((currentStep) => {
          if (currentStep === 4) {
            saveTutorialState(5);
            return 5;
          }
          return currentStep;
        });
      } else if (pollCount >= maxPolls) {
        console.log('[Tutorial] Modal polling timeout');
        clearInterval(pollInterval);
      }
    }, 100);

    return () => {
      clearInterval(pollInterval);
    };
  }, [stepIndex, run, saveTutorialState, userClickedNext]);

  // Event listener: Task created (Step 4 or 5 → Step 6)
  useEffect(() => {
    if (!run) return;
    
    const handleTaskCreated = () => {
      console.log('[Tutorial] Task created event, current step:', stepIndex);
      // Advance from Step 4 (if modal detection hasn't fired yet) or Step 5 (normal flow)
      if (stepIndex === 4 || stepIndex === 5) {
        console.log('[Tutorial] Advancing to step 6');
        setTimeout(() => {
          setStepIndex(6);
          saveTutorialState(6);
        }, 500);
      }
    };

    window.addEventListener('scaffold-task-created', handleTaskCreated);
    return () => window.removeEventListener('scaffold-task-created', handleTaskCreated);
  }, [stepIndex, run, saveTutorialState]);

  // Listen for manual restart
  useEffect(() => {
    const handleRestart = () => {
      console.log('🔄 Restarting tutorial from step 0...');
      
      // Clear ALL storage completely
      localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
      localStorage.removeItem(TUTORIAL_STORAGE_KEY);
      
      // Force reset to step 0
      setStepIndex(0);
      saveTutorialState(0);
      
      // Ensure run is enabled
      setRun(false);  // Turn off first
      
      // Force re-render and restart
      setTimeout(() => {
        setStepIndex(0);  // Double-set to ensure it sticks
        setRun(true);  // Turn back on
        setMounted(true);
      }, 200);
      
      // If not on dashboard, navigate to dashboard
      if (window.location.pathname !== '/builder') {
        console.log('[Tutorial] Navigating to dashboard for restart');
        window.location.href = '/builder';
      }
      
      console.log('✅ Tutorial restarted at step 0');
    };
    
    window.addEventListener('scaffold-restart-tutorial', handleRestart);
    return () => window.removeEventListener('scaffold-restart-tutorial', handleRestart);
  }, [saveTutorialState]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    console.log('🎮 Joyride Event:', { status, action, index, type, stepIndex });

    // Handle missing target elements first
    if (type === EVENTS.TARGET_NOT_FOUND) {
      console.warn('[Tutorial] Target not found for step:', index);
      
      // For step 5 (modal step), wait for modal to appear
      if (index === 5) {
        console.log('[Tutorial] Waiting for modal target...');
        return;
      }
      
      // For other steps, skip forward
      setTimeout(() => {
        setStepIndex(index + 1);
        saveTutorialState(index + 1);
      }, 100);
      return;
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
      localStorage.removeItem(TUTORIAL_STORAGE_KEY);
      console.log('✅ Tutorial finished/skipped');
      
      // Dispatch event to close any open modals
      window.dispatchEvent(new CustomEvent('scaffold-tutorial-closed'));
      return;
    }

    if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
      console.log(`➡️ Next button clicked from step ${index}`);
      
      // Steps 4 & 5 are optional task creation - skip to Step 6
      if (index === 4 || index === 5) {
        console.log('[Tutorial] Skipping task creation, jumping to Step 6');
        setUserClickedNext(true); // Mark that user clicked Next to skip
        setStepIndex(6);
        saveTutorialState(6);
      } else {
        setUserClickedNext(false); // Reset flag for other steps
        const newStep = index + 1;
        setStepIndex(newStep);
        saveTutorialState(newStep);
      }
    }

    if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
      console.log(`⬅️ Back button clicked from step ${index}`);
      
      // Special handling for going back across page boundaries or skipping steps
      if (index === 7 && pathname.match(/^\/builder\/[^\/]+\/[^\/]+$/)) {
        // Going back from Step 7 (task editor) to Step 6 (tasks page)
        console.log('[Tutorial] Navigating back from task editor to tasks page, going to Step 6');
        const appId = pathname.split('/')[2];
        setStepIndex(6);
        saveTutorialState(6);
        setTimeout(() => {
          window.location.href = `/builder/${appId}`;
        }, 100);
      } else if (index === 6) {
        // Going back from Step 6 to Step 4 (skip Step 5 which requires modal)
        console.log('[Tutorial] Going back from Step 6 to Step 4, skipping modal step');
        setRun(false); // Temporarily stop Joyride
        setTimeout(() => {
          setStepIndex(4);
          saveTutorialState(4);
          setRun(true); // Restart Joyride with new step
        }, 50);
      } else if (index === 4 && pathname.match(/^\/builder\/[^\/]+$/)) {
        // Going back from Step 4 (tasks page) to Step 3 (dashboard)
        console.log('[Tutorial] Navigating back from tasks page to dashboard, going to Step 3');
        setStepIndex(3);
        saveTutorialState(3);
        setTimeout(() => {
          window.location.href = '/builder';
        }, 100);
      } else {
        // Normal back navigation
        const newStep = Math.max(0, index - 1);
        setStepIndex(newStep);
        saveTutorialState(newStep);
      }
    }
  };

  // Don't render on server
  if (typeof window === 'undefined') return null;

  // Don't render if tutorial is completed
  const completed = typeof window !== 'undefined' && localStorage.getItem(TUTORIAL_COMPLETED_KEY);
  if (completed) return null;

  if (!mounted) return null;

  // Only run tutorial on builder pages
  if (!pathname?.startsWith('/builder')) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      disableScrolling={false}
      disableScrollParentFix={true}
      scrollOffset={200}
      disableCloseOnEsc={true}
      hideCloseButton={true}
      disableOverlayClose={true}
      disableOverlay={false}
      spotlightPadding={8}
      locale={{
        skip: 'Skip Tutorial',
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
      }}
      floaterProps={{
        disableAnimation: true,
        disableFlip: true,
        styles: {
          floater: {
            zIndex: 100000,
            transition: 'none',
          }
        }
      }}
      styles={{
        options: {
          primaryColor: '#fdcd13',
          textColor: '#000',
          zIndex: 100000,
          overlayColor: 'rgba(0, 0, 0, 0.6)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          mixBlendMode: 'normal',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
        },
        tooltipContainer: {
          textAlign: 'left',
          fontSize: '14px',
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
          transition: 'none',
          willChange: 'auto',
        },
        buttonNext: {
          backgroundColor: '#fdcd13',
          color: '#000',
          fontWeight: 'bold',
          borderRadius: 8,
          padding: '10px 20px',
        },
        buttonBack: {
          color: '#666',
          marginRight: 10,
        },
        buttonSkip: {
          color: '#666',
        },
        spotlight: {
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      }}
    />
  );
};

export default OnboardingTutorial;