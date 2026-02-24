const SIMULATED_NETWORK_RANGE = [140, 320]

const OPERATION_STATES = {
  EXECUTING: 'Executing',
  SUCCESS: 'Success',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
}

const TERMINAL_OPERATION_STATES = new Set([
  OPERATION_STATES.SUCCESS,
  OPERATION_STATES.FAILED,
  OPERATION_STATES.CANCELLED,
])

const instances = [
  {
    id: 'vm-0839',
    name: 'Commercial East',
    host: 'ussuhvin0839.egeng.info',
    deploymentId: 'EG5810AIN',
    tenantId: 'TMPROD326782',
    tenantOptions: ['TMPROD326782', 'TMPROD326783', 'TMPROD326784'],
    tenantType: 'Commercial Deployment',
    version: '21.22.0 M6',
    versionLabel: 'Autobuild_178037588745',
    databaseServer: 'ussuhvvm0340.egn.na',
    databaseOptions: ['vm0839_eGMasterDB_VK', 'vm0839_eGReportingDB_VK'],
    components: [
      { name: 'Application', host: 'ussuhvin0839.egeng.info' },
      { name: 'Messaging', host: 'ussuhvin0839.egeng.info' },
      { name: 'Services', host: 'ussuhvin0839.egeng.info' },
    ],
  },
  {
    id: 'vm-1120',
    name: 'Commercial West',
    host: 'ussuhvin1120.egeng.info',
    deploymentId: 'EG6023AIN',
    tenantId: 'TMPROD401188',
    tenantOptions: ['TMPROD401188', 'TMPROD401190', 'TMPROD401191'],
    tenantType: 'Commercial Deployment',
    version: '21.23.0 M1',
    versionLabel: 'Autobuild_178137591133',
    databaseServer: 'ussuhvvm0440.egn.na',
    databaseOptions: ['vm1120_eGMasterDB_VK', 'vm1120_eGReportingDB_VK'],
    components: [
      { name: 'Application', host: 'ussuhvin1120.egeng.info' },
      { name: 'Messaging', host: 'ussuhvin1120.egeng.info' },
      { name: 'Services', host: 'ussuhvin1120.egeng.info' },
    ],
  },
  {
    id: 'vm-1404',
    name: 'Pilot Tenant',
    host: 'ussuhvin1404.egeng.info',
    deploymentId: 'EG6409AIN',
    tenantId: 'TMPILOT915002',
    tenantOptions: ['TMPILOT915002', 'TMPILOT915003', 'TMPILOT915004'],
    tenantType: 'Pilot Deployment',
    version: '21.21.8 M5',
    versionLabel: 'Autobuild_177607581444',
    databaseServer: 'ussuhvvm0528.egn.na',
    databaseOptions: ['vm1404_eGMasterDB_VK', 'vm1404_eGReportingDB_VK'],
    components: [
      { name: 'Application', host: 'ussuhvin1404.egeng.info' },
      { name: 'Messaging', host: 'ussuhvin1404.egeng.info' },
      { name: 'Services', host: 'ussuhvin1404.egeng.info' },
    ],
  },
]

let operationCounter = 1
let logJobCounter = 1

const instanceStore = Object.fromEntries(
  instances.map((instance) => [
    instance.id,
    {
      ...instance,
      appStatus: 'Running',
      selectedDatabase: instance.databaseOptions[0],
      metrics: {
        cpuPercent: randomBetween(3, 16),
        ram: {
          usedGb: randomBetween(4.8, 7.3),
          totalGb: 12,
        },
        disks: [
          { name: 'C:\\', usedGb: randomBetween(102, 132), totalGb: 150 },
          { name: 'D:\\', usedGb: randomBetween(44, 88), totalGb: 150 },
        ],
      },
      operation: null,
      logJob: null,
    },
  ]),
)

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function round(value, digits = 1) {
  const divisor = 10 ** digits
  return Math.round(value * divisor) / divisor
}

function clone(value) {
  if (value === null || value === undefined) {
    return value
  }

  return JSON.parse(JSON.stringify(value))
}

function assertInstance(instanceId) {
  const instance = instanceStore[instanceId]
  if (!instance) {
    throw new Error('Instance not found')
  }

  return instance
}

function getOperationMessage(type, state) {
  const dictionary = {
    start: {
      Executing: 'Starting application',
      Success: 'Application started successfully',
      Failed: 'Failed to start application',
      Cancelled: 'Start operation cancelled',
    },
    stop: {
      Executing: 'Stopping application',
      Success: 'Application stopped successfully',
      Failed: 'Failed to stop application',
      Cancelled: 'Stop operation cancelled',
    },
    restart: {
      Executing: 'Restarting application',
      Success: 'Application restarted successfully',
      Failed: 'Failed to restart application',
      Cancelled: 'Restart operation cancelled',
    },
  }

  return dictionary[type][state]
}

function mutateMetrics(instance) {
  instance.metrics.cpuPercent = round(
    clamp(instance.metrics.cpuPercent + randomBetween(-2.5, 4.2), 1, 98),
    0,
  )

  instance.metrics.ram.usedGb = round(
    clamp(instance.metrics.ram.usedGb + randomBetween(-0.5, 0.65), 2, 11.8),
  )

  instance.metrics.disks = instance.metrics.disks.map((disk) => ({
    ...disk,
    usedGb: round(
      clamp(disk.usedGb + randomBetween(-1.7, 1.4), 25, disk.totalGb - 4),
      0,
    ),
  }))
}

function buildOverview(instance) {
  const hasExecutingOperation =
    instance.operation?.state === OPERATION_STATES.EXECUTING

  return {
    instance: {
      id: instance.id,
      name: instance.name,
      host: instance.host,
    },
    appStatus: instance.appStatus,
    deploymentId: instance.deploymentId,
    tenantId: instance.tenantId,
    tenantOptions: instance.tenantOptions,
    tenantType: instance.tenantType,
    version: instance.version,
    versionLabel: instance.versionLabel,
    components: instance.components,
    database: {
      server: instance.databaseServer,
      selected: instance.selectedDatabase,
      options: instance.databaseOptions,
    },
    metrics: {
      cpuPercent: instance.metrics.cpuPercent,
      ram: {
        usedGb: instance.metrics.ram.usedGb,
        totalGb: instance.metrics.ram.totalGb,
      },
      disks: instance.metrics.disks.map((disk) => ({
        ...disk,
      })),
    },
    actionAvailability: {
      start: !hasExecutingOperation && instance.appStatus !== 'Running',
      stop: !hasExecutingOperation && instance.appStatus === 'Running',
      restart: !hasExecutingOperation && instance.appStatus === 'Running',
      downloadLogs: !hasExecutingOperation,
    },
    currentOperation: instance.operation,
    currentLogJob: instance.logJob,
    updatedAt: new Date().toISOString(),
  }
}

function scheduleOperationProgress(instance, operation, done) {
  const progressTimer = window.setInterval(() => {
    if (
      instance.operation?.id !== operation.id ||
      instance.operation.state !== OPERATION_STATES.EXECUTING
    ) {
      window.clearInterval(progressTimer)
      return
    }

    instance.operation.progress = round(
      clamp(instance.operation.progress + randomBetween(6, 14), 10, 95),
      0,
    )
    instance.operation.updatedAt = Date.now()
  }, 900)

  const completionMs = operation.type === 'restart' ? 6800 : 5200

  window.setTimeout(() => {
    window.clearInterval(progressTimer)

    if (
      instance.operation?.id !== operation.id ||
      instance.operation.state !== OPERATION_STATES.EXECUTING
    ) {
      return
    }

    done()
  }, completionMs)
}

function startOperation(instanceId, type) {
  const instance = assertInstance(instanceId)

  if (instance.operation?.state === OPERATION_STATES.EXECUTING) {
    throw new Error('Another operation is already executing for this instance')
  }

  if (type === 'start' && instance.appStatus === 'Running') {
    throw new Error('Application is already running')
  }

  if ((type === 'stop' || type === 'restart') && instance.appStatus === 'Stopped') {
    throw new Error('Application is already stopped')
  }

  const operation = {
    id: `op-${operationCounter++}`,
    type,
    state: OPERATION_STATES.EXECUTING,
    message: getOperationMessage(type, OPERATION_STATES.EXECUTING),
    progress: 10,
    startedAt: Date.now(),
    updatedAt: Date.now(),
  }

  instance.operation = operation

  scheduleOperationProgress(instance, operation, () => {
    instance.operation = {
      ...instance.operation,
      state: OPERATION_STATES.SUCCESS,
      message: getOperationMessage(type, OPERATION_STATES.SUCCESS),
      progress: 100,
      updatedAt: Date.now(),
      completedAt: Date.now(),
    }

    if (type === 'start') {
      instance.appStatus = 'Running'
    }

    if (type === 'stop') {
      instance.appStatus = 'Stopped'
    }

    if (type === 'restart') {
      instance.appStatus = 'Running'
      instance.versionLabel = `Autobuild_${Math.floor(
        randomBetween(178000000000, 178999999999),
      )}`
    }
  })

  return operation
}

function createLogFile(instance) {
  return [
    `Instance: ${instance.host}`,
    `Generated At: ${new Date().toISOString()}`,
    `App Status: ${instance.appStatus}`,
    `Version: ${instance.version} (${instance.versionLabel})`,
    '---',
    'INFO Bootstrapping metrics collector',
    'INFO Scheduler running every 5s',
    'INFO Queue depth 0',
    'INFO Health check passed',
    'INFO Audit trail persisted',
  ].join('\n')
}

function scheduleLogProgress(instance, job) {
  const progressTimer = window.setInterval(() => {
    if (
      instance.logJob?.id !== job.id ||
      instance.logJob.state !== OPERATION_STATES.EXECUTING
    ) {
      window.clearInterval(progressTimer)
      return
    }

    instance.logJob.progress = round(
      clamp(instance.logJob.progress + randomBetween(9, 18), 8, 94),
      0,
    )
    instance.logJob.updatedAt = Date.now()
  }, 800)

  window.setTimeout(() => {
    window.clearInterval(progressTimer)

    if (
      instance.logJob?.id !== job.id ||
      instance.logJob.state !== OPERATION_STATES.EXECUTING
    ) {
      return
    }

    const safeHost = instance.host.replaceAll('.', '-')

    instance.logJob = {
      ...instance.logJob,
      state: OPERATION_STATES.SUCCESS,
      message: 'Logs are ready for download',
      progress: 100,
      updatedAt: Date.now(),
      completedAt: Date.now(),
      download: {
        filename: `${safeHost}-${new Date().toISOString().replaceAll(':', '-')}.log`,
        content: createLogFile(instance),
      },
    }
  }, 4600)
}

function startLogJob(instanceId) {
  const instance = assertInstance(instanceId)

  if (instance.logJob?.state === OPERATION_STATES.EXECUTING) {
    return instance.logJob
  }

  const job = {
    id: `log-${logJobCounter++}`,
    state: OPERATION_STATES.EXECUTING,
    message: 'Generating logs package',
    progress: 8,
    startedAt: Date.now(),
    updatedAt: Date.now(),
  }

  instance.logJob = job
  scheduleLogProgress(instance, job)

  return job
}

async function withLatency(payload) {
  const latency = randomBetween(
    SIMULATED_NETWORK_RANGE[0],
    SIMULATED_NETWORK_RANGE[1],
  )
  await delay(latency)
  return clone(payload)
}

export async function getInstances() {
  return withLatency(
    instances.map((instance) => ({
      id: instance.id,
      name: instance.name,
      host: instance.host,
      tenantId: instance.tenantId,
    })),
  )
}

export async function getOverview(instanceId) {
  const instance = assertInstance(instanceId)
  mutateMetrics(instance)
  return withLatency(buildOverview(instance))
}

export async function startApp(instanceId) {
  return withLatency(startOperation(instanceId, 'start'))
}

export async function stopApp(instanceId) {
  return withLatency(startOperation(instanceId, 'stop'))
}

export async function restartApp(instanceId) {
  return withLatency(startOperation(instanceId, 'restart'))
}

export async function getOperationStatus(instanceId, operationId) {
  const instance = assertInstance(instanceId)

  if (!instance.operation) {
    return withLatency(null)
  }

  if (operationId && instance.operation.id !== operationId) {
    return withLatency(null)
  }

  return withLatency(instance.operation)
}

export async function startLogGeneration(instanceId) {
  return withLatency(startLogJob(instanceId))
}

export async function getLogGenerationStatus(instanceId, jobId) {
  const instance = assertInstance(instanceId)

  if (!instance.logJob) {
    return withLatency(null)
  }

  if (jobId && instance.logJob.id !== jobId) {
    return withLatency(null)
  }

  return withLatency(instance.logJob)
}

export { OPERATION_STATES, TERMINAL_OPERATION_STATES }
