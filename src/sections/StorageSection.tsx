import { STORAGE_RULES } from '@/data/mealData'
import SectionHeader from './SectionHeader'

export default function StorageSection() {
  return (
    <section>
      <SectionHeader id="storage" title="复热与保存" desc="吃一周不坏、口感不掉线的五条铁律" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STORAGE_RULES.map((r) => (
          <div key={r.title} className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <h3 className="font-bold text-brand">{r.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
