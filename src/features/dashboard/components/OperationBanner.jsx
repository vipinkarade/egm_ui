import { Ban, CheckCircle2, Info, LoaderCircle, XCircle } from 'lucide-react'

function getBannerClass(state) {
  switch (state) {
    case 'Success':
      return 'is-success'
    case 'Failed':
      return 'is-failed'
    case 'Cancelled':
      return 'is-cancelled'
    default:
      return 'is-executing'
  }
}

function normalizeProgress(value) {
  if (typeof value !== 'number') {
    return 0
  }

  return Math.max(0, Math.min(100, value))
}

function OperationIcon({ state, isExecuting }) {
  let icon = <LoaderCircle size={14} strokeWidth={2.2} />

  if (state === 'Success') {
    icon = <CheckCircle2 size={14} strokeWidth={2.2} />
  } else if (state === 'Failed') {
    icon = <XCircle size={14} strokeWidth={2.2} />
  } else if (state === 'Cancelled') {
    icon = <Ban size={14} strokeWidth={2.2} />
  }

  return (
    <span
      className={`operation-banner__icon${isExecuting ? ' is-spinning' : ''}`}
      aria-hidden="true"
    >
      {icon}
    </span>
  )
}

export function OperationBanner({ operation }) {
  if (!operation) {
    return (
      <div
        className="operation-banner operation-banner--idle"
        style={{ '--operation-progress': '100%' }}
      >
        <span className="operation-banner__icon" aria-hidden="true">
          <Info size={14} strokeWidth={2.2} />
        </span>
        <p className="operation-banner__message" title="System is ready.">
          System is ready.
        </p>
      </div>
    )
  }

  const bannerClassName = getBannerClass(operation.state)
  const isExecuting = operation.state === 'Executing'
  const progress = isExecuting ? normalizeProgress(operation.progress) : 100
  const message = operation.message ?? operation.state

  return (
    <div
      className={`operation-banner ${bannerClassName}`}
      style={{ '--operation-progress': `${progress}%` }}
    >
      <OperationIcon state={operation.state} isExecuting={isExecuting} />
      <p className="operation-banner__message" title={message}>
        {message}
      </p>
    </div>
  )
}
