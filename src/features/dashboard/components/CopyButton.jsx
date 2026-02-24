import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const fallbackElement = document.createElement('textarea')
  fallbackElement.value = text
  fallbackElement.style.position = 'fixed'
  fallbackElement.style.opacity = '0'
  document.body.append(fallbackElement)
  fallbackElement.focus()
  fallbackElement.select()
  document.execCommand('copy')
  fallbackElement.remove()
}

export function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!text) {
      return
    }

    try {
      await copyTextToClipboard(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      className={`copy-button ${copied ? 'is-copied' : ''}`}
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
    </button>
  )
}
