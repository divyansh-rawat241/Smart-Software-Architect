import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownPanelProps {
  markdown: string
}

export function MarkdownPanel({ markdown }: MarkdownPanelProps) {
  return (
    <article className="panel prose prose-sm max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-0.5 [&_p]:leading-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  )
}
