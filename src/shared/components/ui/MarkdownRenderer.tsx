'use client';

import { FC, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Should definitely change this to github colors
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Check, CopyIcon } from 'lucide-react';

const CodeCopyButton: FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-foreground/50 hover:text-foreground transition-colors p-1 rounded cursor-pointer"
      aria-label={isCopied ? 'Copied!' : 'Copy code'}>
      {isCopied ? (
        <Check size={14} className="text-green-500" />
      ) : (
        <CopyIcon size={14} />
      )}
    </button>
  );
};

interface MarkdownRendererProps {
  markdownContent: string;
  className?: string;
}

const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  markdownContent,
  className,
}) => {
  return (
    <div className={`${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            return !inline && match ? (
              <div className="code-block-wrapper rounded-md my-4 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-1 bg-background-light/20 text-xs text-foreground/60">
                  <span>{match[1]}</span>
                  <CodeCopyButton textToCopy={codeString} />
                </div>

                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  // PreTag={'div'}
                  {...props}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={`${className}`} {...props}>
                {String(children).replace(/`/g, 'f')}
                {/* {children} */}
              </code>
            );
          },
          // customizing other elements
          a: ({ ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table
                className="my-custom-table-class border-collapse border border-foreground-light w-full text-sm overflow-hidden"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="border border-background-light px-2 py-2 bg-background-light/100 font-semibold text-left"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border border-background-light px-2 py-1"
              {...props}
            />
          ),
          // Add other customizations as needed (e.g., h1, p, ul, li)
          // h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
          // p: ({node, ...props}) => <p className="mb-4" {...props} />,
        }}>
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
