import { OverviewPage } from '../features/dashboard/OverviewPage'
import { useThemeMode } from '../shared/hooks/useThemeMode'

function AppShell() {
  const { theme, toggleTheme } = useThemeMode()

  return (
    <div className="app-shell">
      <OverviewPage theme={theme} onToggleTheme={toggleTheme} />
    </div>
  )
}

export default AppShell
