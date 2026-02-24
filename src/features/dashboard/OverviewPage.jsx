import { useCallback, useEffect, useMemo, useState } from 'react'
import { getInstances } from './api/dashboardApi'
import { ActionButton } from './components/ActionButton'
import { AppInformationPanel } from './components/AppInformationPanel'
import { Header } from './components/Header'
import { OperationBanner } from './components/OperationBanner'
import { ServerMonitorPanel } from './components/ServerMonitorPanel'
import { StatusCard } from './components/StatusCard'
import { TabBar } from './components/TabBar'
import { useLogDownload } from './hooks/useLogDownload'
import { useOperationController } from './hooks/useOperationController'
import { useOverviewData } from './hooks/useOverviewData'

const TABS = [
  { id: 'overview', label: 'Overview', enabled: true },
  { id: 'management', label: 'Management', enabled: true },
  { id: 'code-change', label: 'Code Change', enabled: true },
  { id: 'logs', label: 'Logs', enabled: true },
  { id: 'utilities', label: 'Utilities', enabled: true },
]

function getLatestStatus(operation, job) {
  if (!operation && !job) {
    return null
  }

  if (operation?.state === 'Executing') {
    return operation
  }

  if (job?.state === 'Executing') {
    return job
  }

  const operationTimestamp = operation?.updatedAt ?? 0
  const jobTimestamp = job?.updatedAt ?? 0

  return operationTimestamp >= jobTimestamp ? operation : job
}

export function OverviewPage({ theme, onToggleTheme }) {
  const [instances, setInstances] = useState([])
  const [instanceError, setInstanceError] = useState(null)
  const [isLoadingInstances, setIsLoadingInstances] = useState(true)
  const [selectedInstanceId, setSelectedInstanceId] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [tenantSelectionByInstance, setTenantSelectionByInstance] = useState({})

  const loadInstances = useCallback(async () => {
    setIsLoadingInstances(true)
    setInstanceError(null)

    try {
      const response = await getInstances()
      setInstances(response)

      setSelectedInstanceId((currentId) => currentId || response[0]?.id || '')
    } catch (error) {
      setInstanceError(
        error instanceof Error ? error : new Error('Failed to load instances'),
      )
    } finally {
      setIsLoadingInstances(false)
    }
  }, [])

  useEffect(() => {
    loadInstances()
  }, [loadInstances])

  const {
    data: overview,
    error: overviewError,
    isLoading: isLoadingOverview,
    refresh: refreshOverview,
  } = useOverviewData(selectedInstanceId)

  const scopedOverview =
    overview?.instance?.id === selectedInstanceId ? overview : null

  const {
    operation,
    isSubmitting: isSubmittingAction,
    isExecuting: isOperationExecuting,
    runAction,
    syncOperation,
    error: operationError,
  } = useOperationController(selectedInstanceId, refreshOverview)

  const {
    job: logJob,
    requestLogs,
    syncJob,
    isExecuting: isLogGenerationRunning,
    error: logError,
  } = useLogDownload(selectedInstanceId)

  useEffect(() => {
    if (!scopedOverview?.currentOperation) {
      return
    }

    syncOperation(scopedOverview.currentOperation)
  }, [scopedOverview?.currentOperation, syncOperation])

  useEffect(() => {
    if (!scopedOverview?.currentLogJob) {
      return
    }

    syncJob(scopedOverview.currentLogJob)
  }, [scopedOverview?.currentLogJob, syncJob])

  const selectedInstance = useMemo(
    () => instances.find((instance) => instance.id === selectedInstanceId) ?? null,
    [instances, selectedInstanceId],
  )

  const activeTabInfo = useMemo(
    () => TABS.find((tab) => tab.id === activeTab) ?? TABS[0],
    [activeTab],
  )

  const selectedTenantId = useMemo(() => {
    if (!scopedOverview) {
      return ''
    }

    const options = scopedOverview.tenantOptions ?? [scopedOverview.tenantId]
    const selected = tenantSelectionByInstance[selectedInstanceId] ?? scopedOverview.tenantId

    if (options.includes(selected)) {
      return selected
    }

    return options[0] ?? ''
  }, [scopedOverview, selectedInstanceId, tenantSelectionByInstance])

  const statusCards = useMemo(() => {
    if (!scopedOverview) {
      return []
    }

    return [
      {
        title: 'App Running Status',
        value: scopedOverview.appStatus,
        tone: scopedOverview.appStatus === 'Running' ? 'success' : 'danger',
        subtitle: scopedOverview.instance.host,
        statusDot: true,
      },
      {
        title: 'Deployment Id',
        value: scopedOverview.deploymentId,
        copyValue: scopedOverview.deploymentId,
      },
      {
        title: 'Tenant Id',
        value: selectedTenantId,
        subtitle: scopedOverview.tenantType,
        copyValue: selectedTenantId,
        valueOptions: scopedOverview.tenantOptions ?? [scopedOverview.tenantId],
        onValueChange: (nextValue) => {
          setTenantSelectionByInstance((current) => ({
            ...current,
            [selectedInstanceId]: nextValue,
          }))
        },
      },
      {
        title: 'Version',
        value: scopedOverview.version,
        subtitle: scopedOverview.versionLabel,
        copyValue: `${scopedOverview.version} (${scopedOverview.versionLabel})`,
      },
    ]
  }, [scopedOverview, selectedInstanceId, selectedTenantId])

  const activeStatus = useMemo(
    () => getLatestStatus(operation, logJob),
    [operation, logJob],
  )

  const isBusy = isOperationExecuting || isSubmittingAction || isLogGenerationRunning

  const actionAvailability = scopedOverview?.actionAvailability ?? {
    start: false,
    stop: false,
    restart: false,
    downloadLogs: false,
  }

  const errorMessage =
    instanceError?.message ??
    overviewError?.message ??
    operationError?.message ??
    logError?.message ??
    null

  return (
    <main className="dashboard-root">
      <Header
        instances={instances}
        selectedInstanceId={selectedInstanceId}
        onInstanceChange={setSelectedInstanceId}
        theme={theme}
        onToggleTheme={onToggleTheme}
        disabled={isLoadingInstances}
      />

      {errorMessage ? (
        <div className="dashboard-alert" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {!selectedInstance && !isLoadingInstances ? (
        <div className="dashboard-empty">No instances available.</div>
      ) : null}

      {selectedInstance ? (
        <section className="dashboard-main">
          <section className="status-cards">
            {statusCards.length ? (
              statusCards.map((card) => <StatusCard key={card.title} {...card} />)
            ) : (
              <article className="status-card status-card--placeholder">
                Loading overview...
              </article>
            )}
          </section>

          <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

          <section className="tab-content">
            {activeTab === 'overview' ? (
              <section className="overview-layout">
                {isLoadingOverview && !scopedOverview ? (
                  <article className="overview-panel overview-panel--placeholder">
                    Loading instance details...
                  </article>
                ) : (
                  <AppInformationPanel
                    key={`${scopedOverview?.instance?.id ?? 'default'}-app-info`}
                    components={scopedOverview?.components ?? []}
                    database={
                      scopedOverview?.database ?? {
                        server: '-',
                        selected: '',
                        options: [],
                      }
                    }
                  />
                )}

                {isLoadingOverview && !scopedOverview ? (
                  <article className="overview-panel overview-panel--placeholder">
                    Loading server metrics...
                  </article>
                ) : (
                  <ServerMonitorPanel
                    metrics={
                      scopedOverview?.metrics ?? {
                        cpuPercent: 0,
                        ram: { usedGb: 0, totalGb: 1 },
                        disks: [],
                      }
                    }
                  />
                )}
              </section>
            ) : (
              <section className="development-placeholder" role="status">
                <h2>{activeTabInfo.label}</h2>
                <p>development in progress</p>
              </section>
            )}
          </section>

          <section className="action-row">
            <ActionButton
              label="Start"
              variant="start"
              disabled={!actionAvailability.start || isBusy}
              onClick={() => runAction('start')}
            />
            <ActionButton
              label="Stop"
              variant="stop"
              disabled={!actionAvailability.stop || isBusy}
              onClick={() => runAction('stop')}
            />
            <ActionButton
              label="Restart"
              variant="restart"
              disabled={!actionAvailability.restart || isBusy}
              onClick={() => runAction('restart')}
            />
            <ActionButton
              label="Download Logs"
              variant="download"
              disabled={!actionAvailability.downloadLogs || isBusy}
              onClick={requestLogs}
              isLoading={isLogGenerationRunning}
            />
            <OperationBanner operation={activeStatus} />
          </section>
        </section>
      ) : null}
    </main>
  )
}
