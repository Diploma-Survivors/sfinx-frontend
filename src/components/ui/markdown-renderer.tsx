import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ node, ...props }) => (
          <h1
            className="text-2xl font-bold mb-4 mt-6 text-slate-900 dark:text-slate-100"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-xl font-bold mb-3 mt-5 text-slate-900 dark:text-slate-100"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-lg font-bold mb-2 mt-4 text-slate-900 dark:text-slate-100"
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <p
            className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
            {...props}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul
            className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300"
            {...props}
          />
        ),
        ol: ({ node, ...props }) => (
          <ol
            className="list-decimal pl-6 mb-4 text-slate-700 dark:text-slate-300"
            {...props}
          />
        ),
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-slate-300 dark:border-slate-700 pl-4 italic my-4 text-slate-600 dark:text-slate-400"
            {...props}
          />
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              className={`${className} bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-200`}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
