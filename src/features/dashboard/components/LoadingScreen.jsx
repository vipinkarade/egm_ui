export function LoadingScreen() {
  return (
    <section className="loading-screen" role="status" aria-live="polite" aria-label="Loading">
      <div className="loading-screen__center">
        <div className="loading-screen__brand" aria-label="eGManager">
          e<span>G</span>Manager
        </div>

        <div className="loading-screen__progress" aria-hidden="true">
          <span className="loading-screen__progress-fill" />
        </div>
      </div>
    </section>
  )
}
