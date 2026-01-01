"use client";

import { useState, useRef, useEffect } from "react";

type HelpTooltipProps = {
  term: string; // e.g., "dynamic_context", "template_variables"
  label?: string; // Optional label to display instead of term
  helpAppId?: string; // Scaffold app ID for help (should be set from env or context)
};

export default function HelpTooltip({
  term,
  label,
  helpAppId = process.env.NEXT_PUBLIC_HELP_APP_ID || "aac18034-6fad-4381-a66c-7d2265dfafb3",
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
    
    // Fetch content if not already loaded
    if (!content && !loading) {
      fetchHelpContent();
    }
  };

  const handleMouseLeave = () => {
    // Delay closing to allow moving to tooltip
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleTooltipMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const fetchHelpContent = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[HelpTooltip] Fetching help for term:', term);
      console.log('[HelpTooltip] Using app ID:', helpAppId);
      
      // Fetch from the embedded form endpoint
      const response = await fetch(
        `/api/generate-prompt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            app_id: helpAppId,
            task_name: "explain_term",
            field_values: {},
            fixed_content: term,
          }),
        }
      );

      const data = await response.json();
      console.log('[HelpTooltip] API Response:', data);
      
      if (data.success && data.prompt) {
        setContent(data.prompt);
      } else {
        console.error('[HelpTooltip] API returned error:', data.error || 'No prompt in response');
        setError("Could not load help content");
      }
    } catch (err) {
      console.error("Error fetching help content:", err);
      setError("Error loading help");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      {/* Info Icon */}
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center justify-center w-5 h-5 ml-1.5 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800 transition-colors"
        title={label || term}
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>

      {/* Tooltip Popover */}
      {isOpen && (
        <div
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-sm text-gray-700 z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
        >
          {loading && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse"></div>
              <span className="text-xs text-gray-500">Loading...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-xs text-red-600 font-medium">{error}</div>
          )}

          {content && !loading && (
            <div className="space-y-3">
              <div className="text-[10px] text-gray-600 leading-relaxed">Need help? Click to open explanation and ask any questions about this feature.</div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(content);
                    const btn = e.currentTarget;
                    const originalText = btn.innerHTML;
                    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
                    setTimeout(() => {
                      btn.innerHTML = originalText;
                    }, 2000);
                  }}
                  className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const chatGptUrl = `https://chat.openai.com/?q=${encodeURIComponent(content)}`;
                    window.open(chatGptUrl, '_blank');
                  }}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                  </svg>
                  ChatGPT
                </button>
              </div>
              <div className="text-center text-[9px] text-gray-400 mt-2">
                powered by <span className="font-graffiti">scaffold</span>
              </div>
            </div>
          )}

          {/* Tooltip arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
