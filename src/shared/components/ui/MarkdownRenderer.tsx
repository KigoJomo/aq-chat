'use client';

import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeCopyButton } from './CodeCopyButton';

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
          code: ({
            inline,
            className,
            children,
            ...rest
          }: {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInlineCode =
              inline || (className === undefined && !codeString.includes('\n'));

            return !isInlineCode ? (
              <div className="code-block-wrapper rounded-md my-0 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-1 bg-foreground-light/20 text-xs text-foreground/60">
                  <span>{match ? match[1] : 'txt'}</span>
                  <CodeCopyButton textToCopy={codeString} />
                </div>

                <SyntaxHighlighter
                  style={tomorrow}
                  language={match ? match[1] : 'text'}
                  PreTag={'div'}
                  {...rest}>
                  {codeString}
                </SyntaxHighlighter>
              </div>
            ) : (
              <span
                className={`font-mono text-sm bg-foreground-light/30 px-1.5 py-0.5 rounded whitespace-nowrap ${className}`}
                {...rest}>
                {String(children).replace(/`/g, '')}
              </span>
            );
          },

          // customizing other elements
          a: ({ ...rest }) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline text-accent hover:text-accent/70 transition-all duration-100"
              {...rest}
            />
          ),
          table: ({ ...rest }) => (
            <div className="overflow-x-auto">
              <table
                className="my-custom-table-class border-collapse border border-foreground-light w-full text-sm overflow-hidden"
                {...rest}
              />
            </div>
          ),
          th: ({ ...rest }) => (
            <th
              className="border border-background-light px-2 py-2 bg-background-light/100 font-semibold text-left"
              {...rest}
            />
          ),
          td: ({ ...rest }) => (
            <td
              className="border border-background-light hover:bg-background-light px-2 py-1 transition-all duration-300"
              {...rest}
            />
          ),
        }}>
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
