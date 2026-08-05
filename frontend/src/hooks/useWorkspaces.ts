import { useQuery } from '@tanstack/react-query'
import { getApiBaseUrl, getHealth, listWorkspaces } from '../lib/api'

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: ['workspaces', getApiBaseUrl()],
    queryFn: listWorkspaces,
  })
}

export function useHealthQuery() {
  return useQuery({
    queryKey: ['health', getApiBaseUrl()],
    queryFn: getHealth,
    retry: 1,
    staleTime: 15_000,
  })
}

