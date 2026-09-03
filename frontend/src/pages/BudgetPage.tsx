import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChevronDown, ChevronUp, DollarSign } from 'lucide-react'
import { StatePanel } from '../components/workspace/StatePanel'
import { useWorkspacesQuery } from '../hooks/useWorkspaces'
import { fetchBudgetComparison, fetchBudgetEstimate } from '../lib/api'
import { deploymentStack, projectConstraints } from '../lib/insightInputs'
import { getActiveWorkspace, getErrorMessage } from '../lib/utils'
import { chartTheme } from '../lib/chartTheme'
import type { BudgetEstimate } from '../types/api'

const categoryColors = { infrastructure: '#2563eb', team: '#16a34a', tooling: '#9333ea' }
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function BudgetPage() {
  const [searchParams] = useSearchParams()
  const workspaceQuery = useWorkspacesQuery()
  const workspace = getActiveWorkspace(workspaceQuery.data, searchParams.get('workspace'))
  const [estimate, setEstimate] = useState<BudgetEstimate | null>(null)
  const [comparison, setComparison] = useState<Record<string, BudgetEstimate>>({})
  const [activeTier, setActiveTier] = useState(0)
  const [assumptionsOpen, setAssumptionsOpen] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const recommended = useMemo(() => workspace && (workspace.architectures.find((architecture) => architecture.id === workspace.recommendation.recommended_architecture_id) ?? workspace.architectures[0]), [workspace])
  const constraints = useMemo(() => workspace ? projectConstraints(workspace) : null, [workspace])
  const stack = useMemo(() => workspace ? deploymentStack(workspace) : [], [workspace])

  useEffect(() => {
    if (!workspace || !recommended || !constraints) return
    let active = true
    setIsLoading(true)
    setError('')
    const stacks = Object.fromEntries(workspace.architectures.map((architecture) => [architecture.id, stack]))
    Promise.all([
      fetchBudgetEstimate({ architecture: recommended, deployment_stack: stack, constraints }),
      fetchBudgetComparison({ architectures: workspace.architectures, deployment_stacks: stacks, constraints }),
    ]).then(([budget, compared]) => {
      if (!active) return
      setEstimate(budget)
      setComparison(compared)
      setActiveTier(0)
    }).catch((requestError) => {
      if (active) setError(getErrorMessage(requestError))
    }).finally(() => {
      if (active) setIsLoading(false)
    })
    return () => { active = false }
  }, [constraints, recommended, stack, workspace])

  const chartData = useMemo(() => estimate?.budgets_by_scale.map((tier) => ({
    tier: tier.scale_tier.replace(/ \(.+\)/, ''),
    infrastructure: tier.line_items.filter((item) => item.category === 'infrastructure').reduce((total, item) => total + item.monthly_cost_usd, 0),
    team: tier.line_items.filter((item) => item.category === 'team').reduce((total, item) => total + item.monthly_cost_usd, 0),
    tooling: tier.line_items.filter((item) => item.category === 'tooling').reduce((total, item) => total + item.monthly_cost_usd, 0),
    total: tier.total_monthly_usd,
  })) ?? [], [estimate])
  const activeBudget = estimate?.budgets_by_scale[activeTier]
  const mediumBudgets = Object.entries(comparison).map(([id, budget]) => ({
    id,
    name: workspace?.architectures.find((architecture) => architecture.id === id)?.name ?? id,
    total: budget.budgets_by_scale[1]?.total_monthly_usd ?? 0,
  }))
  const comparisonMax = Math.max(...mediumBudgets.map((budget) => budget.total), 1)

  if (workspaceQuery.isLoading) return <StatePanel badge="Loading" title="Loading budget" description="Preparing the estimate." />
  if (workspaceQuery.isError) return <StatePanel badge="Backend issue" title="Could not reach the backend" description={getErrorMessage(workspaceQuery.error)} tone="danger" actionLabel="Retry" onAction={() => void workspaceQuery.refetch()} />
  if (!workspace || !recommended) return <StatePanel badge="No workspace" title="No architecture available" description="Create a project brief from the dashboard first." actionLabel="Open Dashboard" actionTo="/dashboard" />

  return <div className="space-y-5">
    <div className="panel"><div className="flex items-center gap-2"><DollarSign className="h-5 w-5" style={{ color: 'var(--brand)' }} /><h2 className="text-lg font-semibold">Budget Estimate</h2></div><p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Illustrative monthly cost view for <strong>{recommended.name}</strong>, using a {constraints?.team_size ?? 0}-person team. These are rough estimates, not vendor quotes.</p></div>
    {isLoading && <div className="panel text-sm" style={{ color: 'var(--text-muted)' }}>Calculating illustrative costs...</div>}
    {error && <div className="panel text-sm text-red-600 dark:text-red-300">{error}</div>}
    {estimate && <>
      <div className="panel"><h3 className="mb-4 text-sm font-semibold">Monthly cost by scale</h3><div className="h-80"><ResponsiveContainer><BarChart data={chartData} margin={{ top: 26, right: 12, left: 12 }}><XAxis dataKey="tier" stroke={chartTheme.axis} tickLine={{ stroke: chartTheme.axis }} tick={{ fill: chartTheme.axis, fontSize: 12 }} /><YAxis stroke={chartTheme.axis} tickLine={{ stroke: chartTheme.axis }} tickFormatter={(value) => `$${value / 1000}k`} tick={{ fill: chartTheme.axis, fontSize: 11 }} /><Tooltip formatter={(value) => money.format(Number(value))} {...chartTheme.tooltip} /><Bar dataKey="infrastructure" stackId="budget" fill={categoryColors.infrastructure} name="Infrastructure" /><Bar dataKey="team" stackId="budget" fill={categoryColors.team} name="Team" /><Bar dataKey="tooling" stackId="budget" fill={categoryColors.tooling} name="Tooling"><LabelList dataKey="total" position="top" formatter={(value) => money.format(Number(value ?? 0))} style={{ fontSize: 11, fill: '#f8fafc' }} /></Bar></BarChart></ResponsiveContainer></div><div className="mt-2 flex justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>{Object.entries(categoryColors).map(([category, color]) => <span key={category} className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />{category}</span>)}</div></div>

      <div className="panel"><h3 className="text-sm font-semibold">Line-item breakdown</h3><div className="mt-3 flex flex-wrap gap-2">{estimate.budgets_by_scale.map((tier, index) => <button key={tier.scale_tier} type="button" className={index === activeTier ? 'button-primary text-xs' : 'button-secondary text-xs'} onClick={() => setActiveTier(index)}>{tier.scale_tier}</button>)}</div>{activeBudget && <div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}><th className="px-2 py-2 font-medium">Item</th><th className="px-2 py-2 font-medium">Category</th><th className="px-2 py-2 text-right font-medium">Monthly</th></tr></thead><tbody>{activeBudget.line_items.map((item) => <tr key={`${item.category}-${item.label}`} className="border-b" style={{ borderColor: 'var(--card-border)' }}><td className="px-2 py-2">{item.label}</td><td className="px-2 py-2 capitalize" style={{ color: 'var(--text-muted)' }}>{item.category}</td><td className="px-2 py-2 text-right tabular-nums">{money.format(item.monthly_cost_usd)}</td></tr>)}<tr className="font-semibold"><td className="px-2 py-3" colSpan={2}>Total</td><td className="px-2 py-3 text-right tabular-nums">{money.format(activeBudget.total_monthly_usd)}</td></tr></tbody></table></div>}</div>

      <div className="panel"><h3 className="text-sm font-semibold">Architecture comparison at medium scale</h3><p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Uses the same project constraints and deployment-plan inputs for each shortlisted architecture.</p><div className="mt-4 space-y-3">{mediumBudgets.map((budget) => <div key={budget.id} className="flex items-center gap-3"><span className="w-40 truncate text-sm">{budget.name}</span><div className="h-5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-amber-500" style={{ width: `${(budget.total / comparisonMax) * 100}%` }} /></div><span className="w-24 text-right text-sm font-medium tabular-nums">{money.format(budget.total)}</span></div>)}</div></div>

      <div className="panel"><button type="button" className="flex w-full items-center justify-between" onClick={() => setAssumptionsOpen((open) => !open)}><h3 className="text-sm font-semibold">How this is estimated</h3>{assumptionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>{assumptionsOpen && <ul className="mt-3 space-y-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>{estimate.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>}</div>
    </>}
    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Rough illustrative estimates only. Validate provider pricing, usage patterns, staffing costs, and contractual commitments before making financial decisions.</p>
  </div>
}
