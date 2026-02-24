import { MetricBar } from './MetricBar'

function buildValueText(used, total, digits = 1) {
  return `${used.toFixed(digits)} GB / ${total.toFixed(0)} GB`
}

export function ServerMonitorPanel({ metrics }) {
  const ramPercent = (metrics.ram.usedGb / metrics.ram.totalGb) * 100

  return (
    <section className="overview-panel server-monitor-panel">
      <h2>Server Monitor</h2>
      <div className="server-monitor-panel__content">
        <div className="server-monitor-panel__cpu">
          <span>CPU</span>
          <strong>{metrics.cpuPercent}%</strong>
        </div>

        <div className="server-monitor-panel__ram">
          <MetricBar
            label="RAM"
            valueLabel={buildValueText(metrics.ram.usedGb, metrics.ram.totalGb, 1)}
            percent={ramPercent}
            tone="blue"
          />
        </div>

        <div className="server-monitor-panel__disk-section">
          <h3>Disk</h3>
          {metrics.disks.map((disk, index) => (
            <MetricBar
              key={disk.name}
              label={disk.name}
              valueLabel={buildValueText(disk.usedGb, disk.totalGb, 0)}
              percent={(disk.usedGb / disk.totalGb) * 100}
              tone={index % 2 === 0 ? 'green' : 'teal'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
