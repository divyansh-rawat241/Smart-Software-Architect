import { useState, type FormEvent } from 'react'
import type { Workspace } from '../../types/api'

interface ClarificationPanelProps {
  workspace: Workspace
  isPending: boolean
  onSubmit: (answers: Record<string, string>) => void
}

export function ClarificationPanel({
  workspace,
  isPending,
  onSubmit,
}: ClarificationPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  if (!workspace.clarification_plan.questions.length) {
    return (
      <section className="panel">
        <p className="pill">Phase 2</p>
        <h3 className="mt-3 text-xl font-semibold">Clarifications complete</h3>
        <p className="mt-2 text-sm text-muted">
          The workspace is ready for the detailed results.
        </p>
      </section>
    )
  }

  function updateAnswer(key: string, value: string) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(
      Object.fromEntries(
        Object.entries(answers).filter(([, value]) => value.trim().length > 0),
      ),
    )
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="pill">Phase 2</p>
          <h3 className="mt-3 text-xl font-semibold">Required follow-ups</h3>
        </div>
        <div className="rounded-2xl bg-[var(--brand-soft)] px-4 py-3 text-sm">
          Completeness score: <strong>{workspace.clarification_plan.completeness_score}%</strong>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {workspace.clarification_plan.questions.map((question) => (
          <div key={question.key} className="rounded-2xl border border-[var(--card-border)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill">{question.priority}</span>
              <span className="text-xs uppercase tracking-[0.24em] text-muted">
                {question.category}
              </span>
            </div>
            <p className="mt-3 font-semibold">{question.question}</p>
            <select
              className="mt-4 w-full rounded-2xl border border-[var(--card-border)] bg-white/50 px-4 py-3 outline-none transition focus:border-brand dark:bg-white/5"
              value={answers[question.key] ?? ''}
              onChange={(event) => updateAnswer(question.key, event.target.value)}
            >
              <option value="">Select an answer</option>
              {question.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-[var(--card-border)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Updating...' : 'Update Results'}
        </button>
      </div>
    </form>
  )
}
