import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import type { PluggableList } from 'unified';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({
  content,
  className = '',
}: MarkdownRendererProps) => {
  // Type assertion to resolve plugin compatibility issues
  const rehypePlugins: PluggableList = [
    rehypeRaw,
    rehypeSanitize,
    rehypeHighlight,
  ];

  return (
    <ReactMarkdown
      className={`markdown-content ${className}`}
      rehypePlugins={rehypePlugins}
      components={{
        // Removed unused 'node' from destructuring in all components
        h1: (props) => <h1 className="text-lg font-bold my-3" {...props} />,
        h2: (props) => <h2 className="text-base font-bold my-3" {...props} />,
        h3: (props) => <h3 className="text-sm font-bold my-2" {...props} />,
        h4: (props) => <h4 className="text-sm font-semibold my-2" {...props} />,
        p: (props) => <p className="my-2" {...props} />,
        a: (props) => (
          <a
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        ul: (props) => <ul className="list-disc pl-5 my-2" {...props} />,
        ol: (props) => <ol className="list-decimal pl-5 my-2" {...props} />,
        li: (props) => <li className="my-1" {...props} />,
        code: ({ inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline ? (
            <div className="rounded-md overflow-hidden my-2">
              <pre className="bg-background-light p-3 rounded-md overflow-x-auto">
                <code
                  className={match ? `language-${match[1]}` : ''}
                  {...props}>
                  {children}
                </code>
              </pre>
            </div>
          ) : (
            <code
              className="bg-foreground-light/20 px-1 py-0.5 rounded text-sm font-mono"
              {...props}>
              {children}
            </code>
          );
        },
        blockquote: (props) => (
          <blockquote
            className="border-l-4 border-foreground-light/30 pl-4 italic my-2"
            {...props}
          />
        ),
        hr: (props) => (
          <hr className="my-4 border-foreground-light/30" {...props} />
        ),
        table: (props) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse" {...props} />
          </div>
        ),
        thead: (props) => <thead className="bg-background-light" {...props} />,
        tr: (props) => (
          <tr className="border-b border-foreground-light/20" {...props} />
        ),
        th: (props) => (
          <th className="py-2 px-4 text-left font-semibold" {...props} />
        ),
        td: (props) => <td className="py-2 px-4" {...props} />,
      }}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;