import { cn } from '@/lib/utils'

interface Props {
  id: string
  title: string
  desc?: string
  className?: string
}

export default function SectionHeader({ id, title, desc, className }: Props) {
  return (
    <div id={id} className={cn('scroll-mt-24 border-b-2 border-ink/80 pb-3', className)}>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-muted-foreground">{desc}</p> : null}
    </div>
  )
}
