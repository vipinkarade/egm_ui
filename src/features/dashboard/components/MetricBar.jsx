import * as Progress from '@radix-ui/react-progress'

function toPercent(value) {
  return Math.max(0, Math.min(100, value))
}

export function MetricBar({ label, valueLabel, percent, tone = 'primary' }) {
  const safePercent = toPercent(percent)

  return (
    <div className="metric-bar">
      <div className="metric-bar__head">
        <p>{label}</p>
        <strong>{valueLabel}</strong>
      </div>
      <Progress.Root className="metric-bar__track" value={safePercent} max={100}>
        <Progress.Indicator
          className={`metric-bar__fill metric-bar__fill--${tone}`}
          style={{ width: `${safePercent}%` }}
        />
      </Progress.Root>
    </div>
  )
}
