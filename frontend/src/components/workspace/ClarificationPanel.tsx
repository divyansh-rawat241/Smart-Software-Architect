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
      <div className="panel">
        <span className="pill">Phase 2</span>
        <h3 className="mt-2 text-lg font-semibold">Clarifications complete</h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          The workspace is ready for detailed results.
        </p>
      </div>
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="pill">Phase 2</span>
          <h3 className="mt-2 text-lg font-semibold">Follow-up questions</h3>
        </div>
        <span className="text-sm font-medium">
          {workspace.clarification_plan.completeness_score}% complete
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {workspace.clarification_plan.questions.map((question) => (
          <div
            key={question.key}
            className="rounded-lg border p-3"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <div className="flex items-center gap-2">
              <span className="pill">{question.priority}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {question.category}
              </span>
            </div>
            <p className="mt-2 font-medium text-sm">{question.question}</p>
            <select
              className="input-shell mt-2"
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

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="button-brand text-sm"
        >
          {isPending ? 'Updating...' : 'Update Results'}
        </button>
      </div>
    </form>
  )
}
