import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  invert = false,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: string
  className?: string
  invert?: boolean
}) {
  return (
    <div className={cn('flex max-w-2xl flex-col gap-3', className)}>
      <span
        className={cn(
          'w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest',
          invert ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground',
        )}
      >
        {eyebrow}
      </span>
      <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{title}</h2>
      {description && (
        <p
          className={cn(
            'text-pretty text-lg leading-relaxed',
            invert ? 'text-secondary-foreground/70' : 'text-muted-foreground',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
