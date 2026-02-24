import { InstanceSelector } from './InstanceSelector'
import { MoonStar, Sun } from 'lucide-react'

export function Header({
  instances,
  selectedInstanceId,
  onInstanceChange,
  theme,
  onToggleTheme,
  disabled = false,
}) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-brand" aria-label="eGManager">
        <span className="dashboard-brand__mark">
          e<span>G</span>Manager
        </span>
      </div>

      <div className="dashboard-header__controls">
        <InstanceSelector
          instances={instances}
          selectedId={selectedInstanceId}
          onSelect={onInstanceChange}
          disabled={disabled}
        />
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun size={14} aria-hidden="true" />
          ) : (
            <MoonStar size={14} aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  )
}
