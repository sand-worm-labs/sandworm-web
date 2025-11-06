"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import React, { useState } from "react";
import { Button } from "@sandworm/ui/components/button";

interface CodePreviewProps {
  code: string;
  language: string;
}

const MAX_LINES = 15;

export const CodePreview: React.FC<CodePreviewProps> = ({ code, language }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = code.split("\n");
  const needsTruncation = lines.length > MAX_LINES;
  const displayCode =
    isExpanded || !needsTruncation
      ? code
      : lines.slice(0, MAX_LINES).join("\n");

  const customStyle = {
    margin: 0,
    padding: "12px 16px",
    background: "#d4dce5",
    fontSize: "13px",
    lineHeight: "1.6",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  };

  const codeTagProps = {
    style: {
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={customTheme}
          customStyle={customStyle}
          showLineNumbers={true}
          lineNumberStyle={{
            color: "#e06c75",
            fontWeight: 500,
            minWidth: "1rem",
            paddingRight: "1rem",
            textAlign: "right",
            userSelect: "none",
          }}
          codeTagProps={codeTagProps}
          wrapLines={true}
        >
          {displayCode}
        </SyntaxHighlighter>
      </div>

      {needsTruncation && (
        <div className="px-4 pb-3 bg-[#d4dce5]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded
              ? "Show less"
              : `Show ${lines.length - MAX_LINES} more lines...`}
          </Button>
        </div>
      )}
    </div>
  );
};

const customTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#2c313c",
    background: "#d4dce5",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "13px",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.6",
    tabSize: 4,
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#2c313c",
    background: "#d4dce5",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "13px",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.6",
    tabSize: 4,
    hyphens: "none",
    padding: "1em",
    margin: "0",
    overflow: "auto",
  },
  comment: {
    color: "#7d8799",
    fontStyle: "italic",
  },
  prolog: {
    color: "#7d8799",
  },
  doctype: {
    color: "#7d8799",
  },
  cdata: {
    color: "#7d8799",
  },
  punctuation: {
    color: "#2c313c",
  },
  property: {
    color: "#2c313c",
  },
  tag: {
    color: "#61afef",
  },
  boolean: {
    color: "#e06c75",
  },
  number: {
    color: "#e06c75",
  },
  constant: {
    color: "#e06c75",
  },
  symbol: {
    color: "#e06c75",
  },
  deleted: {
    color: "#e06c75",
  },
  selector: {
    color: "#98c379",
  },
  "attr-name": {
    color: "#98c379",
  },
  string: {
    color: "#98c379",
  },
  char: {
    color: "#98c379",
  },
  builtin: {
    color: "#61afef",
  },
  inserted: {
    color: "#98c379",
  },
  operator: {
    color: "#2c313c",
  },
  entity: {
    color: "#2c313c",
    cursor: "help",
  },
  url: {
    color: "#2c313c",
  },
  ".language-css .token.string": {
    color: "#98c379",
  },
  ".style .token.string": {
    color: "#98c379",
  },
  variable: {
    color: "#2c313c",
  },
  atrule: {
    color: "#61afef",
  },
  "attr-value": {
    color: "#98c379",
  },
  function: {
    color: "#2c313c",
  },
  "class-name": {
    color: "#2c313c",
  },
  keyword: {
    color: "#61afef",
  },
  regex: {
    color: "#98c379",
  },
  important: {
    color: "#e06c75",
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
};
