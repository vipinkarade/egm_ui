import { useEffect, useRef, useState } from 'react'
import { CopyButton } from './CopyButton'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function StatusCard({
  title,
  value,
  subtitle,
  tone = 'default',
  statusDot,
  copyValue,
  valueOptions,
  onValueChange,
}) {
  const hasDropdown = Array.isArray(valueOptions) && valueOptions.length > 0
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!open || !hasDropdown) {
      return undefined
    }

    const closeOnOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [hasDropdown, open])

  return (
    <article
      className={`status-card ${
        hasDropdown && open ? 'status-card--dropdown-open' : ''
      }`}
    >
      <p className="status-card__title">{title}</p>
      <div className="status-card__value-row">
        {hasDropdown ? (
          <div className="status-card__dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="status-card__dropdown-trigger"
              onClick={() => setOpen((isOpen) => !isOpen)}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <span className="status-card__dropdown-value">{value}</span>
              <span className="status-card__dropdown-icon" aria-hidden="true">
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
            {open ? (
              <ul className="status-card__dropdown-menu" role="listbox">
                {valueOptions.map((option) => (
                  <li key={option}>
                    <button
                      type="button"
                      className={`status-card__dropdown-option ${
                        option === value ? 'is-selected' : ''
                      }`}
                      onClick={() => {
                        onValueChange?.(option)
                        setOpen(false)
                      }}
                      role="option"
                      aria-selected={option === value}
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className={`status-card__value status-card__value--${tone}`}>
            {statusDot ? <span className="status-card__dot" aria-hidden="true" /> : null}
            {value}
          </p>
        )}
        {copyValue ? <CopyButton text={copyValue} label={title} /> : null}
      </div>
      {subtitle ? <p className="status-card__subtitle">{subtitle}</p> : null}
    </article>
  )
}
