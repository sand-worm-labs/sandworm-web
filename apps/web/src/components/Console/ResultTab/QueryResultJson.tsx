import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { twilight } from "react-syntax-highlighter/dist/esm/styles/prism";

export const QueryResultJson = ({ result }: { result: any }) => {
  return (
    <SyntaxHighlighter
      language="json"
      style={twilight}
      customStyle={{
        margin: 0,
        background: "#000",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "#ffffff25",
        fontSize: "14px",
      }}
      wrapLongLines
    >
      {JSON.stringify(result, null, 2)}
    </SyntaxHighlighter>
  );
};
