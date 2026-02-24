import { useEffect, useMemo, useRef, useState } from 'react'

export function InstanceSelector({ instances, selectedId, onSelect, disabled }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selectedInstance = useMemo(
    () => instances.find((instance) => instance.id === selectedId) ?? null,
    [instances, selectedId],
  )

  const filteredInstances = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return instances
    }

    return instances.filter((instance) => {
      const searchable = `${instance.name} ${instance.host} ${instance.tenantId}`.toLowerCase()
      return searchable.includes(normalizedQuery)
    })
  }, [instances, query])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const handleSelect = (instanceId) => {
    onSelect(instanceId)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="instance-selector" ref={containerRef}>
      <button
        type="button"
        className="instance-selector__trigger"
        onClick={() => setOpen((isOpen) => !isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="instance-selector__label">Instance</span>
        <span className="instance-selector__value">
          {selectedInstance ? selectedInstance.host : 'Select instance'}
        </span>
        <span className="instance-selector__icon" aria-hidden="true">
          {open ? '^' : 'v'}
        </span>
      </button>

      {open ? (
        <div className="instance-selector__menu">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="instance-selector__search"
            placeholder="Search instance..."
            aria-label="Search instances"
          />
          <ul className="instance-selector__list" role="listbox">
            {filteredInstances.length ? (
              filteredInstances.map((instance) => (
                <li key={instance.id}>
                  <button
                    type="button"
                    className={`instance-selector__option ${
                      instance.id === selectedId ? 'is-selected' : ''
                    }`}
                    onClick={() => handleSelect(instance.id)}
                    role="option"
                    aria-selected={instance.id === selectedId}
                  >
                    <strong>{instance.name}</strong>
                    <small>{instance.host}</small>
                  </button>
                </li>
              ))
            ) : (
              <li className="instance-selector__empty">No instances found.</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
