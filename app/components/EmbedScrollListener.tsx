"use client";

import { useEffect, useState } from "react";

export default function EmbedScrollListener() {
  // minimal listener - no debug UI in production

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      try {
        const data = (e.data as any) || {};
        // record and debug the inbound message
        // (silent in production)
        if (data?.type !== "scaffold:scrollToPrompt") return;

        const iframes = Array.from(document.getElementsByTagName("iframe"));
        let handled = false;

        // If iframe_id provided, try to match by a data attribute first
        if (!handled && data?.iframe_id) {
          for (const iframe of iframes) {
            try {
              const attr = (iframe as HTMLIFrameElement).getAttribute('data-scaffold-iframe-id') || (iframe as any).dataset?.scaffoldIframeId;
              if (attr && attr === data.iframe_id) {
                (iframe as HTMLIFrameElement).scrollIntoView({ behavior: "smooth", block: "center" });
                (iframe as HTMLIFrameElement).focus({ preventScroll: true });
                try { (iframe as HTMLIFrameElement).style.outline = '4px solid rgba(59,130,246,0.6)'; setTimeout(() => { try { (iframe as HTMLIFrameElement).style.outline = ''; } catch (e) {} }, 2000); } catch (e) {}
                handled = true;
                break;
              }
            } catch (err) {
              // ignore
            }
          }
        }

        // 1) Try exact contentWindow match (works when same-origin or browser allows reference)
        for (const iframe of iframes) {
          try {
              if ((iframe as HTMLIFrameElement).contentWindow === e.source) {
                (iframe as HTMLIFrameElement).scrollIntoView({ behavior: "smooth", block: "center" });
                try { (iframe as HTMLIFrameElement).focus && (iframe as HTMLIFrameElement).focus({ preventScroll: true }); } catch (e) {}
                try { (iframe as HTMLIFrameElement).style.outline = '4px solid rgba(59,130,246,0.6)'; setTimeout(() => { try { (iframe as HTMLIFrameElement).style.outline = ''; } catch (e) {} }, 2000); } catch (e) {}
                handled = true;
                break;
              }
          } catch (err) {
            // ignore cross-origin access errors when reading contentWindow
          }
        }

        // 2) Try to match by src params (app_id / task_name) if provided by the iframe
        if (!handled && data?.app_id) {
          for (const iframe of iframes) {
            try {
              const src = (iframe as HTMLIFrameElement).src || "";
              if (src.includes(`app_id=${encodeURIComponent(data.app_id)}`) && (!data.task_name || src.includes(`task_name=${encodeURIComponent(data.task_name)}`))) {
                (iframe as HTMLIFrameElement).scrollIntoView({ behavior: "smooth", block: "center" });
                try { (iframe as HTMLIFrameElement).focus && (iframe as HTMLIFrameElement).focus({ preventScroll: true }); } catch (e) {}
                try { (iframe as HTMLIFrameElement).style.outline = '4px solid rgba(59,130,246,0.6)'; setTimeout(() => { try { (iframe as HTMLIFrameElement).style.outline = ''; } catch (e) {} }, 2000); } catch (e) {}
                handled = true;
                break;
              }
            } catch (err) {
              // ignore
            }
          }
        }

        // 3) Try to match by src URL if provided
        if (!handled && data?.src) {
          for (const iframe of iframes) {
            try {
              const src = (iframe as HTMLIFrameElement).src || "";
              if (src === data.src || src.startsWith(data.src) || data.src.startsWith(src)) {
                (iframe as HTMLIFrameElement).scrollIntoView({ behavior: "smooth", block: "center" });
                try { (iframe as HTMLIFrameElement).focus && (iframe as HTMLIFrameElement).focus({ preventScroll: true }); } catch (e) {}
                try { (iframe as HTMLIFrameElement).style.outline = '4px solid rgba(59,130,246,0.6)'; setTimeout(() => { try { (iframe as HTMLIFrameElement).style.outline = ''; } catch (e) {} }, 2000); } catch (e) {}
                handled = true;
                break;
              }
            } catch (err) {
              // ignore
            }
          }
        }

        // 4) Fallback: first embed/form iframe
        if (!handled) {
          for (const iframe of iframes) {
            try {
              const src = (iframe as HTMLIFrameElement).src || "";
              if (src.includes("/embed/form")) {
                (iframe as HTMLIFrameElement).scrollIntoView({ behavior: "smooth", block: "center" });
                try { (iframe as HTMLIFrameElement).focus && (iframe as HTMLIFrameElement).focus({ preventScroll: true }); } catch (e) {}
                try { (iframe as HTMLIFrameElement).style.outline = '4px solid rgba(59,130,246,0.6)'; setTimeout(() => { try { (iframe as HTMLIFrameElement).style.outline = ''; } catch (e) {} }, 2000); } catch (e) {}
                handled = true;
                break;
              }
            } catch (err) {
              // ignore
            }
          }
        }

        if (!handled) {
          // Fallback: scroll the whole window a bit to reveal the iframe area
          window.scrollBy({ top: 200, left: 0, behavior: "smooth" });
        }

        // Notify iframe that parent handled the scroll (include iframe_id if provided)
        try {
          const ack = { type: "scaffold:scrolledToPrompt", handled } as any;
          if (data?.iframe_id) ack.iframe_id = data.iframe_id;
          if (e.source && typeof (e.source as WindowProxy).postMessage === "function") {
            (e.source as WindowProxy).postMessage(ack, "*");
          }
        } catch (err) {
          // ignore
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
