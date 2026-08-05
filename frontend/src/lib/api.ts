import type { Workspace, WorkspaceCreatePayload } from '../types/api'
import type { HealthStatus } from '../types/client'

const STORAGE_KEY = 'archai-api-base'

function resolveDefaultApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000/api/v1`
  }

  return 'http://127.0.0.1:8000/api/v1'
}

const DEFAULT_API_BASE_URL = resolveDefaultApiBaseUrl()

export function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return DEFAULT_API_BASE_URL
  }

  return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE_URL
}

export function setApiBaseUrl(value: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, value)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new Error(
      `Could not reach the ArchAI API at ${getApiBaseUrl()}. Start the backend and make sure this frontend origin is allowed.`,
    )
  }

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json() as Promise<T>
}

export function listWorkspaces() {
  return request<Workspace[]>('/workspaces')
}

export function getHealth() {
  return request<HealthStatus>('/health')
}

export function createWorkspace(payload: WorkspaceCreatePayload) {
  return request<Workspace>('/workspaces', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function answerClarifications(
  workspaceId: string,
  answers: Record<string, string>,
) {
  return request<Workspace>(`/workspaces/${workspaceId}/clarifications`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

export function applyChangeRequest(workspaceId: string, changeRequest: string) {
  return request<Workspace>(`/workspaces/${workspaceId}/changes`, {
    method: 'POST',
    body: JSON.stringify({ change_request: changeRequest }),
  })
}

export async function downloadMarkdown(workspaceId: string) {
  let response: Response

  try {
    response = await fetch(
      `${getApiBaseUrl()}/workspaces/${workspaceId}/documentation/markdown`,
    )
  } catch {
    throw new Error(
      `Could not reach the ArchAI API at ${getApiBaseUrl()} while downloading markdown.`,
    )
  }

  if (!response.ok) {
    throw new Error(await response.text())
  }
  return response.text()
}

export async function downloadPdf(workspaceId: string) {
  let response: Response

  try {
    response = await fetch(
      `${getApiBaseUrl()}/workspaces/${workspaceId}/documentation/pdf`,
    )
  } catch {
    throw new Error(
      `Could not reach the ArchAI API at ${getApiBaseUrl()} while downloading the PDF export.`,
    )
  }

  if (!response.ok) {
    throw new Error(await response.text())
  }
  return response.blob()
}
