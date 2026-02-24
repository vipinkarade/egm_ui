import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getLogGenerationStatus,
  OPERATION_STATES,
  startLogGeneration,
} from '../api/dashboardApi'
import { usePollingResource } from '../../../shared/hooks/usePollingResource'

function triggerDownload(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 0)
}

export function useLogDownload(instanceId) {
  const [jobInstanceId, setJobInstanceId] = useState(null)
  const [seedJob, setSeedJob] = useState(null)
  const [trackedJobId, setTrackedJobId] = useState(null)
  const [submitError, setSubmitError] = useState({
    instanceId: null,
    error: null,
  })
  const downloadedJobIdsRef = useRef(new Set())

  const requestLogs = useCallback(async () => {
    if (!instanceId) {
      return
    }

    setSubmitError({ instanceId: null, error: null })

    try {
      const createdJob = await startLogGeneration(instanceId)
      setJobInstanceId(instanceId)
      setSeedJob(createdJob)

      if (createdJob?.state === OPERATION_STATES.EXECUTING) {
        setTrackedJobId(createdJob.id)
      } else {
        setTrackedJobId(null)
      }
    } catch (error) {
      setSubmitError(
        {
          instanceId,
          error:
            error instanceof Error
              ? error
              : new Error('Failed to start log generation'),
        },
      )
    }
  }, [instanceId])

  const fetchLogStatus = useCallback(async () => {
    if (!instanceId || !trackedJobId || jobInstanceId !== instanceId) {
      return Promise.resolve(null)
    }

    const nextJob = await getLogGenerationStatus(instanceId, trackedJobId)

    if (nextJob && nextJob.state !== OPERATION_STATES.EXECUTING) {
      setTrackedJobId(null)
      setSeedJob(nextJob)
    }

    return nextJob
  }, [instanceId, trackedJobId, jobInstanceId])

  const { data: polledJob, error: pollingError } = usePollingResource({
    fetcher: fetchLogStatus,
    enabled: Boolean(instanceId && trackedJobId && jobInstanceId === instanceId),
    intervalMs: 2000,
  })

  const job = useMemo(() => {
    if (!instanceId || jobInstanceId !== instanceId) {
      return null
    }

    return polledJob ?? seedJob
  }, [instanceId, jobInstanceId, polledJob, seedJob])

  useEffect(() => {
    if (
      !job ||
      job.state !== OPERATION_STATES.SUCCESS ||
      !job.download?.filename ||
      !job.download?.content
    ) {
      return
    }

    if (downloadedJobIdsRef.current.has(job.id)) {
      return
    }

    triggerDownload(job.download.filename, job.download.content)
    downloadedJobIdsRef.current.add(job.id)
  }, [job])

  const syncJob = useCallback((nextJob) => {
    if (!instanceId || !nextJob) {
      return
    }

    setJobInstanceId(instanceId)
    setSeedJob(nextJob)

    if (nextJob.state === OPERATION_STATES.EXECUTING) {
      setTrackedJobId(nextJob.id)
      return
    }

    setTrackedJobId(null)
  }, [instanceId])

  return {
    job,
    requestLogs,
    syncJob,
    isExecuting: job?.state === OPERATION_STATES.EXECUTING,
    error:
      (submitError.instanceId === instanceId ? submitError.error : null) ??
      (jobInstanceId === instanceId ? pollingError : null),
  }
}
