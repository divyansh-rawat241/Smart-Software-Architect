import type { ArchitectureOption } from '../../types/api'

interface ArchitectureFlowProps {
  architecture: ArchitectureOption
}

export function ArchitectureFlow({ architecture }: ArchitectureFlowProps) {
  return (
    <section className="panel h-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="pill">Component view</p>
          <h3 className="mt-3 text-2xl font-semibold">{architecture.name}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            {architecture.overview}
          </p>
        </div>
        <div className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm text-muted">
          {architecture.deployment}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {architecture.components.map((component, index) => (
          <div key={component.name} className="space-y-3">
            <article className="rounded-[1.55rem] border border-[var(--card-border)] bg-black/5 p-4 dark:bg-white/5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="flex items-center gap-3 lg:min-w-[10rem]">
                  <div className="flex size-11 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-strong)]">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted">
                      Stage {index + 1}
                    </div>
                    <h4 className="mt-1 text-xl font-semibold">{component.name}</h4>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm leading-7 text-muted">
                    {component.responsibility}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {component.technologies.map((technology) => (
                      <span
                        key={technology}
                        className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold text-muted"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {index < architecture.components.length - 1 ? (
              <div className="flex justify-center">
                <div className="h-8 w-px bg-[var(--card-border)]" />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[1.55rem] border border-[var(--card-border)] bg-black/5 p-4 dark:bg-white/5">
        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted">
          Data flow
        </div>
        <ul className="mt-3 grid gap-2 text-sm">
          {architecture.data_flow.map((step) => (
            <li key={step}>- {step}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
