import { Download, LoaderCircle, Play, RotateCw, Square } from 'lucide-react'

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
  const isDisabled = disabled || isLoading

  return (
    <button
      type="button"
      className={`action-button action-button--${variant}`}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isLoading}
    >
      <span className="action-button__shine" aria-hidden="true" />
      {isLoading ? (
        <LoaderCircle size={14} className="action-button__icon action-button__icon--spinning" aria-hidden="true" />
      ) : Icon ? (
        <Icon size={14} className="action-button__icon" aria-hidden="true" />
      ) : null}
      <span>{isLoading ? `${label}...` : label}</span>
    </button>
  )
}
