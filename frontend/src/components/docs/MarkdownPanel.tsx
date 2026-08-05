import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownPanelProps {
  markdown: string
}

export function MarkdownPanel({ markdown }: MarkdownPanelProps) {
  return (
    <article className="panel space-y-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-1 [&_p]:leading-7 [&_pre]:overflow-x-auto [&_pre]:rounded-3xl [&_pre]:bg-black/85 [&_pre]:p-4 [&_pre]:text-white">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  )
}

