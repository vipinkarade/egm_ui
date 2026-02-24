import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'egmanager-theme'

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getStoredTheme() {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return null
}

export function useThemeMode() {
  const storedTheme = getStoredTheme()
  const [theme, setTheme] = useState(storedTheme ?? getSystemTheme)
  const [hasUserPreference, setHasUserPreference] = useState(Boolean(storedTheme))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!hasUserPreference || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme, hasUserPreference])

  useEffect(() => {
    if (hasUserPreference || typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (event) => {
      setTheme(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [hasUserPreference])

  const toggleTheme = useCallback(() => {
    setHasUserPreference(true)
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
