import type { DailyMacros } from '@/lib/calc'
import { fmtInt } from '@/lib/format'

const NAV = [
  { href: '#targets', label: '营养目标' },
  { href: '#shopping', label: '采购清单' },
  { href: '#prep', label: '备餐流程' },
  { href: '#recipes', label: '菜谱' },
  { href: '#boxes', label: '分装表' },
  { href: '#storage', label: '保存复热' },
]

export default function StickyHeader({ daily }: { daily: DailyMacros }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-5 px-4">
        <a href="#top" className="shrink-0 text-base font-bold tracking-tight">
          周末<span className="text-brand">备餐</span>
        </a>
        <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors hover:text-brand">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-baseline gap-3 text-sm">
          <span className="tnum text-base font-bold text-coral">{fmtInt(daily.kcalByMacro)} kcal/天</span>
          <span className="tnum hidden text-muted-foreground sm:inline">
            碳水 {fmtInt(daily.carb)} · 蛋白 {fmtInt(daily.protein)} · 脂肪 {fmtInt(daily.fat)} g
          </span>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-4 pb-2 text-sm text-muted-foreground md:hidden">
        {NAV.map((n) => (
          <a key={n.href} href={n.href} className="shrink-0">
            {n.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
