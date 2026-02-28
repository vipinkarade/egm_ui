import { useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [isPopping, setIsPopping] = useState(false)
  const buttonRef = useRef(null)

  const handleMagneticMove = (event) => {
    const element = buttonRef.current
    if (!element) {
      return
    }

    const rect = element.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    const clampedX = Math.max(-4, Math.min(4, x * 0.32))
    const clampedY = Math.max(-4, Math.min(4, y * 0.32))
    element.style.setProperty('--magnetic-x', `${clampedX}px`)
    element.style.setProperty('--magnetic-y', `${clampedY}px`)
  }

  const resetMagneticMove = () => {
    const element = buttonRef.current
    if (!element) {
      return
    }

    element.style.setProperty('--magnetic-x', '0px')
    element.style.setProperty('--magnetic-y', '0px')
  }

  const handleCopy = async () => {
    if (!text) {
      return
    }

    try {
      await copyTextToClipboard(text)
      setIsPopping(false)
      window.setTimeout(() => setIsPopping(true), 0)
      window.setTimeout(() => setIsPopping(false), 260)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="icon"
      className={`copy-button ${copied ? 'is-copied' : ''} ${isPopping ? 'is-pop' : ''}`}
      onClick={handleCopy}
      onMouseMove={handleMagneticMove}
      onMouseLeave={resetMagneticMove}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
    </Button>
  )
}
