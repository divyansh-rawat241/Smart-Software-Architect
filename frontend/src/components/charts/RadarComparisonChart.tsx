import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { formatMetricName } from '../../lib/utils'
import type { ComparisonResult } from '../../types/api'

interface RadarComparisonChartProps {
  comparison: ComparisonResult
}

const COLORS = ['#b55d25', '#2563eb', '#16a34a']

export function RadarComparisonChart({
  comparison,
}: RadarComparisonChartProps) {
  const metrics = comparison.scorecards[0]?.metric_scores ?? []
  const data = metrics.map((metric) => {
    const row: Record<string, number | string> = {
      metric: formatMetricName(metric.metric),
    }

    for (const scorecard of comparison.scorecards) {
      const metricScore = scorecard.metric_scores.find(
        (item) => item.metric === metric.metric,
      )
      row[scorecard.architecture_name] = metricScore?.score ?? 0
    }

    return row
  })

  return (
    <section className="panel h-full">
      <p className="pill">Score visualization</p>
      <h3 className="mt-3 text-xl font-semibold">Radar chart</h3>
      <div className="mt-6 h-[360px]">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <Tooltip />
            {comparison.scorecards.map((scorecard, index) => (
              <Radar
                key={scorecard.architecture_id}
                name={scorecard.architecture_name}
                dataKey={scorecard.architecture_name}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.16}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

