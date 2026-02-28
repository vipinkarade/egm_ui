import { useEffect, useState } from 'react'
import { OverviewPage } from '../features/dashboard/OverviewPage'
import { CommandPrompt } from '../features/dashboard/components/CommandPrompt'
import { useThemeMode } from '../shared/hooks/useThemeMode'

function AppShell() {
  const { theme, toggleTheme } = useThemeMode()
  const [isCommandPromptOpen, setIsCommandPromptOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.repeat) {
        return
      }

      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return
      }

      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        event.code === 'KeyP'
      ) {
        event.preventDefault()
        setIsCommandPromptOpen((isOpen) => !isOpen)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="app-shell">
      <OverviewPage theme={theme} onToggleTheme={toggleTheme} />
      <CommandPrompt
        open={isCommandPromptOpen}
        onOpenChange={setIsCommandPromptOpen}
      />
    </div>
  )
}

export default AppShell
