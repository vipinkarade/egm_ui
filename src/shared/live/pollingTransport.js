export const pollingTransport = {
  subscribe({ intervalMs, onUpdate }) {
    const timerId = window.setInterval(onUpdate, intervalMs)
    return () => window.clearInterval(timerId)
  },
}
