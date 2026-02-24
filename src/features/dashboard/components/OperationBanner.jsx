import * as Progress from '@radix-ui/react-progress'

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

export function OperationBanner({ operation }) {
  if (!operation) {
    return (
      <div className="operation-banner operation-banner--idle">
        <p className="operation-banner__state">No active operation</p>
        <p className="operation-banner__message">System is ready.</p>
      </div>
    )
  }

  const bannerClassName = getBannerClass(operation.state)
  const progress = normalizeProgress(operation.progress)

  return (
    <div className={`operation-banner ${bannerClassName}`}>
      <p className="operation-banner__state">{operation.state}</p>
      <p className="operation-banner__message">{operation.message}</p>
      <Progress.Root className="operation-banner__track" value={progress} max={100}>
        <Progress.Indicator
          className="operation-banner__fill"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      </Progress.Root>
    </div>
  )
}
