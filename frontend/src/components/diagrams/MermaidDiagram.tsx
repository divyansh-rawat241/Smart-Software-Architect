import { Copy, Download } from 'lucide-react'
import mermaid from 'mermaid'
import { useEffect, useId, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { downloadBlob } from '../../lib/utils'
import type { DiagramArtifact } from '../../types/api'

interface MermaidDiagramProps {
  artifact: DiagramArtifact
}

export function MermaidDiagram({ artifact }: MermaidDiagramProps) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')
  const [sourceView, setSourceView] = useState<
    'hidden' | 'mermaid' | 'plantuml'
  >('hidden')
  const [zoom, setZoom] = useState(100)
  const { theme } = useTheme()
  const renderId = useId()

  useEffect(() => {
    setSourceView('hidden')
    setZoom(100)
  }, [artifact.title])

  useEffect(() => {
    let isMounted = true

    async function renderDiagram() {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          htmlLabels: true,
          flowchart: {
            curve: 'basis',
            nodeSpacing: 32,
            rankSpacing: 56,
            padding: 18,
          },
          er: {
            minEntityWidth: 220,
            minEntityHeight: 86,
            entityPadding: 14,
            layoutDirection: 'LR',
          },
          sequence: {
            actorMargin: 60,
            messageMargin: 36,
          },
          themeVariables:
            theme === 'dark'
              ? {
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  primaryColor: '#182636',
                  primaryTextColor: '#f7f0e7',
                  primaryBorderColor: '#d2a473',
                  secondaryColor: '#0f1d2d',
                  secondaryTextColor: '#f7f0e7',
                  secondaryBorderColor: '#4c6d8b',
                  tertiaryColor: '#1b3148',
                  tertiaryTextColor: '#f7f0e7',
                  lineColor: '#d2a473',
                  mainBkg: '#122131',
                  clusterBkg: '#101c2a',
                  clusterBorder: '#94683f',
                }
              : {
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  primaryColor: '#fff7ef',
                  primaryTextColor: '#2d1d11',
                  primaryBorderColor: '#b57b45',
                  secondaryColor: '#f8ebdc',
                  secondaryTextColor: '#2d1d11',
                  secondaryBorderColor: '#c69768',
                  tertiaryColor: '#fffaf4',
                  tertiaryTextColor: '#2d1d11',
                  lineColor: '#9b6737',
                  mainBkg: '#fffaf4',
                  clusterBkg: '#fbf1e4',
                  clusterBorder: '#c09160',
                },
        })
        const result = await mermaid.render(
          renderId.replaceAll(':', ''),
          artifact.mermaid,
        )
        if (isMounted) {
          setSvg(result.svg)
          setError('')
        }
      } catch {
        if (isMounted) {
          setError('Mermaid could not render this diagram.')
        }
      }
    }

    void renderDiagram()

    return () => {
      isMounted = false
    }
  }, [artifact.mermaid, renderId, theme])

  async function copyMermaid() {
    await navigator.clipboard.writeText(artifact.mermaid)
  }

  async function copyPlantUml() {
    await navigator.clipboard.writeText(artifact.plantuml)
  }

  function exportSvg() {
    downloadBlob(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      `${artifact.title}.svg`,
    )
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

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${artifact.title}.png`)
        }
      })
      URL.revokeObjectURL(url)
    }

    image.src = url
  }

  return (
    <section className="panel-strong overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="pill">{artifact.title}</p>
          <p className="mt-3 max-w-3xl text-sm text-muted">
            {artifact.description}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted">
            <span>Zoom</span>
            {[100, 125, 150].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setZoom(value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  zoom === value
                    ? 'bg-brand text-white'
                    : 'border border-[var(--card-border)]'
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyMermaid()}
              className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-2">
                <Copy className="size-4" /> Copy Mermaid
              </span>
            </button>
            <button
              type="button"
              onClick={() => void copyPlantUml()}
              className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-2">
                <Copy className="size-4" /> Copy PlantUML
              </span>
            </button>
            <button
              type="button"
              onClick={exportSvg}
              className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-2">
                <Download className="size-4" /> SVG
              </span>
            </button>
            <button
              type="button"
              onClick={exportPng}
              className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-2">
                <Download className="size-4" /> PNG
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-[var(--card-border)] bg-white/35 p-5 dark:bg-black/20">
        {error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : !svg ? (
          <p className="text-sm text-muted">Rendering diagram preview...</p>
        ) : (
          <div className="overflow-auto">
            <div
              className="mx-auto transition-all"
              style={{
                width: `${zoom}%`,
                minWidth: zoom > 100 ? `${zoom}%` : '100%',
              }}
            >
              <div
                className="diagram-canvas"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {sourceView === 'hidden' ? (
          <>
            <button
              type="button"
              onClick={() => setSourceView('mermaid')}
              className="rounded-full border border-[var(--card-border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium"
            >
              View Mermaid source
            </button>
            <button
              type="button"
              onClick={() => setSourceView('plantuml')}
              className="rounded-full border border-[var(--card-border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium"
            >
              View PlantUML reference
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setSourceView('hidden')}
            className="rounded-full border border-[var(--card-border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium"
          >
            Hide source
          </button>
        )}
      </div>

      {sourceView !== 'hidden' ? (
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[var(--card-border)]">
          <div className="border-b border-[var(--card-border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            {sourceView === 'mermaid' ? 'Mermaid source' : 'PlantUML reference'}
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap p-4 text-sm">
            {sourceView === 'mermaid' ? artifact.mermaid : artifact.plantuml}
          </pre>
        </div>
      ) : null}
    </section>
  )
}
