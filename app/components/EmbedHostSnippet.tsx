"use client";

import { useState } from "react";

export default function EmbedHostSnippet() {
  const [copied, setCopied] = useState(false);
  const snippet = `(function(){window.addEventListener('message',function(e){try{const d=e.data||{};if(d.type!=='scaffold:scrollToPrompt')return;const iframes=Array.from(document.getElementsByTagName('iframe'));let matched=null;for(const f of iframes){try{if(f.contentWindow===e.source){matched=f;break}}catch(_){} }if(!matched && d.src){for(const f of iframes){try{const src=f.src||'';if(src===d.src||src.startsWith(d.src)||d.src.includes('/embed/form')&&d.src.includes('/embed/form')){matched=f;break}}catch(_){} }}if(!matched){for(const f of iframes){try{const src=f.src||'';if(src.includes('/embed/form')){matched=f;break}}catch(_){} }}if(matched){try{matched.scrollIntoView({behavior:'smooth',block:'center'});matched.focus&&matched.focus({preventScroll:true});matched.style.outline='4px solid rgba(59,130,246,0.6)';setTimeout(()=>{try{matched.style.outline=''}catch(_){}},2000)}catch(_){} }else{try{window.scrollBy({top:200,left:0,behavior:'smooth'})}catch(_){} }if(e.source&&typeof e.source.postMessage==='function'){const ack={type:'scaffold:scrolledToPrompt',handled:!!matched};if(d.iframe_id)ack.iframe_id=d.iframe_id;e.source.postMessage(ack,'*')} }catch(err){}},false)})();`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="rounded-lg border p-4 bg-white shadow-sm text-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold mb-1">Embed host snippet</div>
          <div className="text-xs text-gray-600 mb-3">Copy this small script into your host page to allow the scaffold embed to request scrolling for generated prompts (works cross-origin).</div>
          <button onClick={onCopy} className="px-3 py-2 bg-gray-100 rounded text-sm">{copied ? 'Copied' : 'Copy Snippet'}</button>
        </div>
        <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-w-[420px]">{snippet}</pre>
      </div>
    </div>
  );
}
