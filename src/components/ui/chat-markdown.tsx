'use client';

import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMarkdownProps {
  content: string;
}

/**
 * Compact markdown renderer for chat bubbles.
 * Tighter spacing and smaller type than the full-page FormattedMarkdown.
 */
export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkBreaks]}
      components={{
        h1: ({ children }) => (
          <p className="font-bold text-sm mb-1 mt-2 first:mt-0">{children}</p>
        ),
        h2: ({ children }) => (
          <p className="font-semibold text-sm mb-1 mt-2 first:mt-0">{children}</p>
        ),
        h3: ({ children }) => (
          <p className="font-medium text-sm mb-1 mt-1 first:mt-0">{children}</p>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-4 mb-2 last:mb-0 space-y-0.5 text-sm">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-4 mb-2 last:mb-0 space-y-0.5 text-sm">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="text-sm">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-current/30 pl-3 my-1 opacity-80">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: '6px 0',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-[12px] font-mono break-words"
              {...props}
            >
              {children}
            </code>
          );
        },
        hr: () => <hr className="my-2 border-current/20" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
