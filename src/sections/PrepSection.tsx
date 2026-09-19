import type { PrepBlock } from '@/data/mealData'
import { PREP_SATURDAY, PREP_SUNDAY } from '@/data/mealData'
import SectionHeader from './SectionHeader'

function Lane({ lane, items }: { lane: string; items: string[] }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="mt-0.5 inline-block w-20 shrink-0 rounded-md bg-brand/10 px-2 py-0.5 text-center text-xs font-semibold text-brand">
        {lane}
      </span>
      <ul className="min-w-0 flex-1 space-y-0.5 text-sm leading-relaxed">
        {items.map((it, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/40" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SundayBlock({ block, index }: { block: PrepBlock; index: number }) {
  return (
    <div className="relative flex gap-4">
      {/* 时间轴 */}
      <div className="flex w-16 shrink-0 flex-col items-center">
        <span className="tnum rounded-md border border-border bg-card px-1.5 py-1 text-center text-xs font-bold leading-tight shadow-xs">
          {block.time}
        </span>
        {index < PREP_SUNDAY.length - 1 ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
      </div>
      <div className="min-w-0 flex-1 pb-6">
        <h3 className="pt-1 text-base font-bold">{block.title}</h3>
        <div className="mt-2 divide-y divide-border/60">
          {block.tracks.map((t) => (
            <Lane key={t.lane} lane={t.lane} items={t.items} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PrepSection() {
  return (
    <section>
      <SectionHeader
        id="prep"
        title="周末 3 小时备餐流程"
        desc="周六晚 10 分钟预处理 + 周日 3 小时并行作业：卤锅 / 煎锅 / 电饭煲 / 蒸锅同时推进"
      />

      {/* 周六晚预处理 */}
      <div className="mt-4 rounded-xl border-l-4 border-coral bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-bold">{PREP_SATURDAY.title}</h3>
          <span className="tnum text-sm font-semibold text-coral">{PREP_SATURDAY.time}</span>
        </div>
        <div className="mt-3 space-y-2">
          {PREP_SATURDAY.tracks.map((t) => (
            <div key={t.lane} className="flex items-start gap-3">
              <span className="mt-0.5 inline-block w-16 shrink-0 rounded-md bg-coral/10 px-2 py-0.5 text-center text-xs font-semibold text-coral">
                {t.lane}
              </span>
              <p className="text-sm leading-relaxed">{t.items.join('；')}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-md bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">
          关键：卤牛肉必须提前泡冷水（最好过夜），泡出血水才不腥——别省这一步。
        </p>
      </div>

      {/* 周日时间线 */}
      <div className="mt-6">
        {PREP_SUNDAY.map((b, i) => (
          <SundayBlock key={b.time} block={b} index={i} />
        ))}
      </div>
    </section>
  )
}
