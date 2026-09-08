import Link from "next/link";
import React, { memo, useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PiCheck, PiCopyLight } from "react-icons/pi";

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const language = /language-(\w+)/.exec(className || "")?.[1];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  return (
    <div className="relative group/code">
      <pre className="text-sm w-[80dvw] md:max-w-[500px] overflow-x-scroll p-3 rounded-lg mt-2 bg-zinc-800">
        <code className={language}>{children}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-4 right-2 flex items-center justify-center w-6 h-6 rounded-md bg-zinc-700/80 hover:bg-zinc-600 text-zinc-200 transition-colors opacity-0 group-hover/code:opacity-100 focus-visible:opacity-100"
      >
        {copied ? <PiCheck size={13} /> : <PiCopyLight size={13} />}
      </button>
    </div>
  );
}

const components = {
  code: ({ _, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <CodeBlock className={className}>{children}</CodeBlock>
    ) : (
      <code
        className={`${className} text-sm bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  },
  ol: ({ _, children, ...props }: any) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ _, children, ...props }: any) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ _, children, ...props }: any) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ _, children, ...props }: any) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ _, children, ...props }: any) => {
    return (
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
