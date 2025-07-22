import React from "react";
import ReactMarkdown from "react-markdown";

interface WrapWithMarkdownProps {
  text: string;
}
const WrapWithMarkdown = ({ text }: WrapWithMarkdownProps) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-2">{children}</ul>
        ),
        li: ({ children }) => <li className="mb-1">{children}</li>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default WrapWithMarkdown;
