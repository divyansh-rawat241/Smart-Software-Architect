import { formatMetricName } from '../../lib/utils'
import type { ComparisonResult } from '../../types/api'

interface ComparisonTableProps {
  comparison: ComparisonResult
}

export function ComparisonTable({ comparison }: ComparisonTableProps) {
  const metrics = comparison.scorecards[0]?.metric_scores ?? []

  return (
    <div className="panel overflow-x-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="pill">Weighted scorecards</p>
          <h3 className="mt-3 text-xl font-semibold">Architecture comparison table</h3>
        </div>
        <span className="text-sm text-muted">
          Higher scores are better across all metrics.
        </span>
      </div>

      <table className="mt-6 min-w-full border-separate border-spacing-y-2 text-left text-sm">
        <thead>
          <tr className="text-muted">
            <th className="px-3 py-2">Metric</th>
            {comparison.scorecards.map((scorecard) => (
              <th key={scorecard.architecture_id} className="px-3 py-2">
                <div className="font-semibold text-[var(--text)]">
                  {scorecard.architecture_name}
                </div>
                <div className="mt-1 text-xs text-muted">
                  {scorecard.weighted_score} weighted
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.metric} className="rounded-2xl bg-black/5 dark:bg-white/5">
              <td className="rounded-l-2xl px-3 py-3 font-medium">
                {formatMetricName(metric.metric)}
              </td>
              {comparison.scorecards.map((scorecard) => {
                const score = scorecard.metric_scores.find(
                  (metricScore) => metricScore.metric === metric.metric,
                )

                return (
                  <td key={scorecard.architecture_id} className="px-3 py-3">
                    <div className="font-semibold">{score?.score ?? '-'}</div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
