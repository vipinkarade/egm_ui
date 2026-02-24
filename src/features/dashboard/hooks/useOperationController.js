import { useCallback, useEffect, useState } from 'react'
import {
  getOperationStatus,
  OPERATION_STATES,
  restartApp,
  startApp,
  stopApp,
  TERMINAL_OPERATION_STATES,
} from '../api/dashboardApi'
import { usePollingResource } from '../../../shared/hooks/usePollingResource'

const actionHandlers = {
  start: startApp,
  stop: stopApp,
  restart: restartApp,
}

export function useOperationController(instanceId, onOperationSettled) {
  const [operation, setOperation] = useState(null)
  const [trackedOperationId, setTrackedOperationId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    setOperation(null)
    setTrackedOperationId(null)
    setIsSubmitting(false)
    setSubmitError(null)
  }, [instanceId])

  const runAction = useCallback(
    async (action) => {
      const run = actionHandlers[action]
      if (!run || !instanceId) {
        return
      }

      setIsSubmitting(true)
      setSubmitError(null)

      try {
        const createdOperation = await run(instanceId)
        setOperation(createdOperation)

        if (createdOperation?.state === OPERATION_STATES.EXECUTING) {
          setTrackedOperationId(createdOperation.id)
        }

        if (
          createdOperation &&
          TERMINAL_OPERATION_STATES.has(createdOperation.state)
        ) {
          onOperationSettled?.(createdOperation)
        }
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error : new Error('Failed to run action'),
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [instanceId, onOperationSettled],
  )

  const fetchOperationStatus = useCallback(() => {
    if (!instanceId || !trackedOperationId) {
      return Promise.resolve(null)
    }

    return getOperationStatus(instanceId, trackedOperationId)
  }, [instanceId, trackedOperationId])

  const { data: polledOperation, error: pollingError } = usePollingResource({
    fetcher: fetchOperationStatus,
    enabled: Boolean(instanceId && trackedOperationId),
    intervalMs: 2000,
  })

  useEffect(() => {
    if (!polledOperation) {
      return
    }

    setOperation(polledOperation)

    if (!TERMINAL_OPERATION_STATES.has(polledOperation.state)) {
      return
    }

    setTrackedOperationId(null)
    onOperationSettled?.(polledOperation)
  }, [polledOperation, onOperationSettled])

  const syncOperation = useCallback((nextOperation) => {
    if (!nextOperation) {
      return
    }

    setOperation((currentOperation) => {
      if (
        currentOperation?.state === OPERATION_STATES.EXECUTING &&
        currentOperation.id !== nextOperation.id
      ) {
        return currentOperation
      }

      return nextOperation
    })

    if (nextOperation.state === OPERATION_STATES.EXECUTING) {
      setTrackedOperationId(nextOperation.id)
    }
  }, [])

  return {
    operation,
    isSubmitting,
    isExecuting: operation?.state === OPERATION_STATES.EXECUTING,
    runAction,
    syncOperation,
    error: submitError ?? pollingError,
  }
}
