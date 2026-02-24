import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CopyButton } from './CopyButton'

export function AppInformationPanel({ components, database }) {
  const [selectedDatabase, setSelectedDatabase] = useState(
    database.selected ?? database.options[0] ?? '',
  )
  const [databaseMenuOpen, setDatabaseMenuOpen] = useState(false)
  const databaseMenuRef = useRef(null)

  useEffect(() => {
    if (!databaseMenuOpen) {
      return undefined
    }

    const closeOnOutsideClick = (event) => {
      if (!databaseMenuRef.current?.contains(event.target)) {
        setDatabaseMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [databaseMenuOpen])

  return (
    <section className="overview-panel app-info-panel">
      <h2>App Information</h2>

      <div className="app-info-panel__section app-info-panel__section--components">
        <h3>Components</h3>
        <ul className="component-list">
          {components.map((component) => (
            <li key={component.name} className="component-list__item">
              <div className="component-list__name">
                <strong>{component.name}</strong>
              </div>
              <div className="component-list__line">
                <span>{component.host}</span>
                <CopyButton text={component.host} label={`${component.name} host`} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="app-info-panel__section app-info-panel__section--database">
        <h3>Database</h3>
        <div className="database-server-wrap">
          <p className="database-server">{database.server}</p>
          <CopyButton text={database.server} label="database server" />
        </div>
        <div className="database-select-wrap">
          <label htmlFor="database-selection">Database</label>
          <div className="database-select-row" ref={databaseMenuRef}>
            <div className="database-select-field">
              <button
                id="database-selection"
                type="button"
                className="database-select-trigger"
                onClick={() => setDatabaseMenuOpen((isOpen) => !isOpen)}
                aria-haspopup="listbox"
                aria-expanded={databaseMenuOpen}
              >
                <span>{selectedDatabase || 'Select database'}</span>
                <span className="database-select-icon" aria-hidden="true">
                  {databaseMenuOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>
              {databaseMenuOpen ? (
                <ul className="database-select-menu" role="listbox">
                  {database.options.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        className={`database-select-option ${
                          option === selectedDatabase ? 'is-selected' : ''
                        }`}
                        onClick={() => {
                          setSelectedDatabase(option)
                          setDatabaseMenuOpen(false)
                        }}
                        role="option"
                        aria-selected={option === selectedDatabase}
                      >
                        {option}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <CopyButton text={selectedDatabase} label="database name" />
          </div>
        </div>
      </div>
    </section>
  )
}
