import { useCallback } from 'react'
import { getOverview } from '../api/dashboardApi'
import { usePollingResource } from '../../../shared/hooks/usePollingResource'

export function useOverviewData(instanceId) {
  const fetchOverview = useCallback(() => {
    if (!instanceId) {
      return Promise.resolve(null)
    }

    return getOverview(instanceId)
  }, [instanceId])

  return usePollingResource({
    fetcher: fetchOverview,
    enabled: Boolean(instanceId),
    intervalMs: 10000,
  })
}
