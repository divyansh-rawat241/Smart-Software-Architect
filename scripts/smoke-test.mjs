const apiBase = (process.env.ARCHAI_API_BASE ?? 'http://127.0.0.1:8000/api/v1').replace(
  /\/$/,
  '',
)

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function fetchWithRetry(url, init = {}, attempts = 4) {
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, init)
    } catch (error) {
      lastError = error
      if (attempt === attempts) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
    }
  }

  throw lastError
}

async function request(path, init = {}) {
  const response = await fetchWithRetry(`${apiBase}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  const contentType = response.headers.get('content-type') ?? ''
  const rawBody = await response.text()
  const body =
    contentType.includes('application/json') && rawBody
      ? JSON.parse(rawBody)
      : rawBody

  if (!response.ok) {
    const detail =
      typeof body === 'string' ? body : JSON.stringify(body, null, 2)
    throw new Error(
      `${init.method ?? 'GET'} ${path} failed with ${response.status}: ${detail}`,
    )
  }

  return body
}

function log(step, detail) {
  console.log(`[smoke] ${step}${detail ? `: ${detail}` : ''}`)
}

async function main() {
  log('API base', apiBase)

  const health = await request('/health', {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  assert(health.status === 'ok', 'Health check did not return status=ok')
  log('Health check', `${health.service} (${health.environment})`)

  const titleSuffix = new Date().toISOString().replace(/[:.]/g, '-')
  const payload = {
    title: `VoltReserve Smoke ${titleSuffix}`,
    description:
      'Build an EV charging station booking platform for metro cities with station discovery, live charger availability, slot booking, payments, refunds, operator controls, and charging session tracking.',
    business_context:
      'The first release should support rapid city pilots with auditable payments, operator tooling, and clear charging workflows.',
    budget: 'medium',
    preferred_cloud: 'AWS',
    constraints: [
      'Must use PostgreSQL',
      'Audit logs required',
      '99.9% availability target',
    ],
  }

  const workspace = await request('/workspaces', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  assert(workspace.id, 'Workspace creation did not return an id')
  assert(
    Array.isArray(workspace.architectures) && workspace.architectures.length > 0,
    'Workspace creation did not generate architecture options',
  )
  assert(
    workspace.recommendation?.recommended_architecture_name,
    'Workspace creation did not generate a recommendation',
  )
  assert(
    workspace.requirements?.domain === 'EV Charging Booking Platform',
    'Workspace creation did not detect the EV charging domain',
  )
  assert(
    ['use_case', 'activity', 'sequence', 'class', 'er', 'component', 'deployment'].every(
      (key) => workspace.diagrams?.[key]?.mermaid && workspace.diagrams?.[key]?.plantuml,
    ),
    'Workspace creation did not generate the full diagram pack',
  )
  assert(
    workspace.documentation_markdown?.includes(payload.title),
    'Workspace documentation markdown was not generated',
  )
  log('Workspace created', workspace.id)

  const clarificationAnswers = Object.fromEntries(
    (workspace.clarification_plan?.questions ?? [])
      .filter((question) => question.options?.length)
      .map((question) => [question.key, question.options[0]]),
  )

  if (Object.keys(clarificationAnswers).length > 0) {
    const clarifiedWorkspace = await request(
      `/workspaces/${workspace.id}/clarifications`,
      {
        method: 'POST',
        body: JSON.stringify({ answers: clarificationAnswers }),
      },
    )
    assert(
      clarifiedWorkspace.id === workspace.id,
      'Clarification update returned the wrong workspace id',
    )
    log(
      'Clarifications applied',
      `${Object.keys(clarificationAnswers).length} answers submitted`,
    )
  } else {
    log('Clarifications skipped', 'No follow-up questions were generated')
  }

  const changedWorkspace = await request(`/workspaces/${workspace.id}/changes`, {
    method: 'POST',
    body: JSON.stringify({
      change_request:
        'Add mobile apps to the first release and introduce CDN-backed media delivery.',
    }),
  })
  assert(
    Array.isArray(changedWorkspace.impact_history) &&
      changedWorkspace.impact_history.length > 0,
    'Change request did not record impact history',
  )
  log('Change request applied', `${changedWorkspace.impact_history.length} impact entry`)

  const workspaceDetails = await request(`/workspaces/${workspace.id}`)
  assert(workspaceDetails.id === workspace.id, 'Workspace lookup failed after update')
  log('Workspace lookup', 'ok')

  const markdown = await request(
    `/workspaces/${workspace.id}/documentation/markdown`,
    {
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'application/json',
      },
    },
  )
  assert(
    typeof markdown === 'string' && markdown.includes(payload.title),
    'Markdown export did not include the workspace title',
  )
  log('Markdown export', `${markdown.length} characters`)

  const pdfResponse = await fetchWithRetry(
    `${apiBase}/workspaces/${workspace.id}/documentation/pdf`,
  )
  assert(pdfResponse.ok, `PDF export failed with ${pdfResponse.status}`)
  const pdfBytes = Buffer.from(await pdfResponse.arrayBuffer())
  assert(pdfBytes.length > 0, 'PDF export was empty')
  assert(
    pdfBytes.subarray(0, 4).toString('utf8') === '%PDF',
    'PDF export did not return a PDF file signature',
  )
  log('PDF export', `${pdfBytes.length} bytes`)

  log('Smoke test passed', workspace.id)
}

main().catch((error) => {
  console.error(`[smoke] FAILED: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
