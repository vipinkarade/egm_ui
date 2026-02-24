import { Download, Play, RotateCw, Square } from 'lucide-react'

const iconByVariant = {
  start: Play,
  stop: Square,
  restart: RotateCw,
  download: Download,
}

export function ActionButton({
  label,
  variant,
  disabled,
  onClick,
  isLoading = false,
}) {
  const Icon = iconByVariant[variant]

  return (
    <button
      type="button"
      className={`action-button action-button--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon ? <Icon size={14} className="action-button__icon" aria-hidden="true" /> : null}
      <span>{isLoading ? `${label}...` : label}</span>
    </button>
  )
}
