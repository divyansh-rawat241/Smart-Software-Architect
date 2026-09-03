import { Copy, Download } from 'lucide-react'
import mermaid from 'mermaid'
import { useCallback, useEffect, useRef, useState } from 'react'
import { downloadBlob } from '../../lib/utils'
import type { DiagramArtifact } from '../../types/api'

interface MermaidDiagramProps {
  artifact: DiagramArtifact
}

let diagramCounter = 0

export function MermaidDiagram({ artifact }: MermaidDiagramProps) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')
  const [showSource, setShowSource] = useState<'hidden' | 'mermaid' | 'plantuml'>('hidden')
  const diagramId = useRef(`diagram-${++diagramCounter}`)

  const renderDiagram = useCallback(async () => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          background: '#1b263b',
          primaryColor: '#1e293b',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#94a3b8',
          secondaryColor: '#172554',
          tertiaryColor: '#1f2937',
          lineColor: '#cbd5e1',
          edgeLabelBackground: '#131c2d',
          nodeBorder: '#94a3b8',
          clusterBkg: '#1e293b',
          clusterBorder: '#64748b',
          textColor: '#f8fafc',
          mainBkg: '#1e293b',
        },
        securityLevel: 'loose',
        htmlLabels: true,
      })

      const id = diagramId.current
      const { svg: renderedSvg } = await mermaid.render(id, artifact.mermaid)
      setSvg(renderedSvg)
      setError('')
    } catch (err) {
      console.error('Mermaid render error:', err)
      setError(`Mermaid error: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }, [artifact.mermaid])

  useEffect(() => {
    setSvg('')
    setError('')
    void renderDiagram()
  }, [renderDiagram])

  async function copySource(source: string) {
    await navigator.clipboard.writeText(source)
  }

  function exportPng() {
    const image = new Image()
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width * 2
      canvas.height = image.height * 2
      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(url)
        return
      }
      context.fillStyle = '#131c2d'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `${artifact.title}.png`)
      })
      URL.revokeObjectURL(url)
    }

    image.src = url
  }

  return (
    <div className="panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="pill">{artifact.title}</span>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {artifact.description}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => void copySource(artifact.mermaid)}
            className="button-secondary flex items-center gap-1.5 text-xs"
          >
            <Copy className="h-3.5 w-3.5" /> Mermaid
          </button>
          <button
            type="button"
            onClick={() => void copySource(artifact.plantuml)}
            className="button-secondary flex items-center gap-1.5 text-xs"
          >
            <Copy className="h-3.5 w-3.5" /> PlantUML
          </button>
          <button
            type="button"
            onClick={exportPng}
            className="button-secondary flex items-center gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border p-4" style={{ borderColor: 'var(--card-border)', background: 'var(--surface-strong)' }}>
        {error ? (
          <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
        ) : !svg ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Rendering diagram...</p>
        ) : (
          <div className="overflow-auto">
            <div className="diagram-canvas" dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setShowSource(showSource === 'hidden' ? 'mermaid' : 'hidden')}
          className="text-xs font-medium underline"
          style={{ color: 'var(--text-muted)' }}
        >
          {showSource === 'hidden' ? 'Show source' : 'Hide source'}
        </button>
      </div>

      {showSource !== 'hidden' ? (
        <pre className="mt-3 overflow-x-auto rounded-lg border p-3 text-xs" style={{ borderColor: 'var(--card-border)', background: 'var(--surface-strong)' }}>
          {showSource === 'mermaid' ? artifact.mermaid : artifact.plantuml}
        </pre>
      ) : null}
    </div>
  )
}
