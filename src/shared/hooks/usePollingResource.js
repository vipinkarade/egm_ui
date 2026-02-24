import { useCallback, useEffect, useRef, useState } from 'react'
import { pollingTransport } from '../live/pollingTransport'

export function usePollingResource({
  fetcher,
  enabled = true,
  intervalMs = 10000,
  immediate = true,
  transport = pollingTransport,
}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(enabled))
  const inFlightRef = useRef(false)

  const refresh = useCallback(async () => {
    if (!enabled || inFlightRef.current) {
      return null
    }

    inFlightRef.current = true

    try {
      const nextData = await fetcher()
      setData(nextData)
      setError(null)
      return nextData
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError
          : new Error('Failed to load resource'),
      )
      return null
    } finally {
      setIsLoading(false)
      inFlightRef.current = false
    }
  }, [enabled, fetcher])

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return undefined
    }

    setIsLoading(true)

    if (immediate) {
      refresh()
    }

    const unsubscribe = transport.subscribe({
      intervalMs,
      onUpdate: refresh,
    })

    return unsubscribe
  }, [enabled, immediate, intervalMs, refresh, transport])

  return {
    data,
    error,
    isLoading,
    refresh,
    setData,
  }
}
