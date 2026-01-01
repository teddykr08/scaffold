"use client";

import { useState, useEffect } from "react";

type TemplateImproverModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: string;
  fieldNames: string[];
  taskDescription?: string;
  customColor: string;
  fontFamily: string;
  improverAppId?: string;
};

export default function TemplateImproverModal({
  isOpen,
  onClose,
  currentTemplate,
  fieldNames,
  taskDescription = "",
  customColor,
  fontFamily,
  improverAppId = process.env.NEXT_PUBLIC_IMPROVER_APP_ID || "template-improver",
}: TemplateImproverModalProps) {
  const [improvedTemplate, setImprovedTemplate] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Build the embed form URL
  const fieldList = fieldNames.join(", ");
  const embedUrl = new URL("/embed/form", "https://scaffoldtool.vercel.app");
  embedUrl.searchParams.set("app_id", improverAppId);
  embedUrl.searchParams.set("task_name", "improve_template");
  embedUrl.searchParams.set("fixed", currentTemplate);
  embedUrl.searchParams.set("color", customColor);
  embedUrl.searchParams.set("font", fontFamily);

  const handleUseTemplate = () => {
    if (improvedTemplate.trim()) {
      // Trigger callback to parent to update template
      const event = new CustomEvent("templateImproved", {
        detail: { template: improvedTemplate },
      });
      window.dispatchEvent(event);
      setImprovedTemplate("");
      onClose();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(improvedTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600"
                >
                  <path d="M12 2v20M2 12h20" />
                  <path d="M4.22 4.22l14.24 14.24M19.78 4.22L5.54 18.46" />
                </svg>
              </div>
              <div>
                <h2 className="font-graffiti text-2xl text-black">Improve Template</h2>
                <p className="text-xs text-gray-500">Let AI help you write a better prompt</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Content - Tabbed Interface */}
          <div className="flex-1 overflow-hidden flex">
            {/* Tab: Form */}
            <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <p className="text-xs text-gray-600 font-medium">
                  Answer a few questions to improve your template
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <iframe
                  key={iframeKey}
                  src={embedUrl.toString()}
                  className="w-full h-full border-0"
                  title="Template improver form"
                />
              </div>
            </div>

            {/* Tab: Result */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-600 font-medium">Improved Template</p>
                {improvedTemplate && (
                  <span className="text-xs text-green-600 font-bold">✓ Ready</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {!improvedTemplate ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-400"
                        >
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                          <path d="M21 3v5h-5"></path>
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                          <path d="M3 21v-5h5"></path>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Submit the form on the left</p>
                      <p className="text-xs text-gray-400 mt-1">
                        to see the improved template here
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Your Improved Template
                      </p>
                      <textarea
                        value={improvedTemplate}
                        onChange={(e) => setImprovedTemplate(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 p-4 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                        rows={12}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                      >
                        {copied ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleUseTemplate}
                        style={{ backgroundColor: customColor, color: "#ffffff" }}
                        className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Use This
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listen for improved template from iframe */}
      {isOpen && (
        <IFrameResultListener
          onTemplateReceived={(template) => setImprovedTemplate(template)}
        />
      )}
    </>
  );
}

// Helper component to listen for messages from embedded form
function IFrameResultListener({
  onTemplateReceived,
}: {
  onTemplateReceived: (template: string) => void;
}) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "improvedTemplate") {
        onTemplateReceived(event.data.template);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onTemplateReceived]);

  return null;
}
