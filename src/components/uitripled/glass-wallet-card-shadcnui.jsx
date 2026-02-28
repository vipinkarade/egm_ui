import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const toneClassName = {
  default: 'text-foreground',
  success: 'text-emerald-500 dark:text-emerald-400',
  danger: 'text-rose-500 dark:text-rose-400',
}

export function GlassWalletCard({
  title,
  value,
  subtitle,
  tone = 'default',
  statusDot = false,
  controls,
  copyAction,
  className,
}) {
  return (
    <article className={cn('status-card relative', className)}>
      <Card className="status-card__shell relative h-full overflow-visible rounded-2xl shadow-none backdrop-blur-xl">
        <div className="relative flex h-full flex-col p-4">
          <p className="status-card__title text-[0.73rem] tracking-[0.09em]">{title}</p>
          <div className="status-card__value-row mt-2">
            {controls ? (
              controls
            ) : (
              <p className={cn('status-card__value mt-0 text-[1.36rem]', toneClassName[tone] ?? toneClassName.default)}>
                {statusDot ? <span className="status-card__dot" aria-hidden="true" /> : null}
                {value}
              </p>
            )}
            {copyAction}
          </div>
          {subtitle ? <p className="status-card__subtitle mt-2.5">{subtitle}</p> : null}
        </div>
      </Card>
    </article>
  )
}
