"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { twilight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CheckIcon, CopyIcon } from "lucide-react";

interface WormQLPreviewProps {
  query: string;
}

export const WormQLPreview = ({ query }: WormQLPreviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-sm border border-zinc-700 overflow-hidden pb-12 bg-[#ffffff15] ">
      <SyntaxHighlighter
        language="sql"
        style={twilight}
        customStyle={{
          margin: 0,
          background: "none",
          boxShadow: "none",

          borderRadius: 0,
          borderWidth: 0,
          borderColor: "#ffffff25",
          overflowY: "hidden",
        }}
      >
        {query}
      </SyntaxHighlighter>

      <button
        type="button"
        onClick={handleCopy}
        className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-zinc-800 hover:bg-zinc-700 px-2 py-1 text-xs text-white transition"
      >
        {copied ? (
          <>
            <CheckIcon size={14} />
            Copied
          </>
        ) : (
          <>
            <CopyIcon size={14} />
            Copy
          </>
        )}
      </button>
    </div>
  );
};
