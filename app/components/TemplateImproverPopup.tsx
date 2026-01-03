"use client";

import { useEffect } from "react";

interface TemplateImproverPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: string;
  fieldList?: string[];
}

export default function TemplateImproverPopup({
  isOpen,
  onClose,
  currentTemplate,
  fieldList = [],
}: TemplateImproverPopupProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const improverAppId = process.env.NEXT_PUBLIC_IMPROVER_APP_ID || '87c1a384-47ff-41af-aa81-b72ba6f08b37';
  const fieldListStr = fieldList.join(', ');
  const fixedContent = `Current Template: ${currentTemplate}\n\nFields: ${fieldListStr}`;
  const embedUrl = `/embed/form?app_id=${encodeURIComponent(improverAppId)}&task_name=improve_template&fixed=${encodeURIComponent(fixedContent)}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full h-full max-w-7xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              ✨
            </div>
            <div>
              <h2 className="text-xl font-graffiti text-gray-900">Improve Template</h2>
              <p className="text-xs text-gray-500">AI-powered prompt enhancement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
            title="Close (Esc)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Iframe Content */}
        <div className="w-full h-full pt-[72px]">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            title="Template Improver"
          />
        </div>
      </div>
    </div>
  );
}
