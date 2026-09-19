import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { BoxPlan, Extras } from '@/lib/calc'
import { fmtGrams, fmtInt } from '@/lib/format'
import SectionHeader from './SectionHeader'

export default function BoxesSection({ boxes, extras }: { boxes: BoxPlan[]; extras: Extras }) {
  // 装盒提醒：餐外项不进盒
  const notes: string[] = []
  if (extras.eggsPerDay > 0)
    notes.push('卤蛋不装盒——带卤汁冷藏、前 4 天吃完，后半周换带壳水煮蛋（带壳冷藏可放 5–7 天）')
  if (extras.fruitG > 0) notes.push(`水果不装盒——每天 ${extras.fruitG}g 低 GI 水果，放两餐之间或下午加餐吃`)
  // 按天分组
  const days: { day: string; plans: BoxPlan[] }[] = []
  for (const p of boxes) {
    const last = days[days.length - 1]
    if (last && last.day === p.day) last.plans.push(p)
    else days.push({ day: p.day, plans: [p] })
  }

  return (
    <section>
      <SectionHeader
        id="boxes"
        title="14 盒分装表"
        desc="一周 7 天 × 午/晚 = 14 盒。分装规则：每盒 = 主食 + 蛋白 + 蔬菜；周一、周二的 4 盒冷藏（48 小时内吃完），周三起 10 盒冷冻；盒盖贴标签注明日期 + 午/晚 + 热量"
      />

      {notes.length > 0 ? (
        <p className="mt-4 border-l-4 border-coral/60 bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          <b className="text-ink">装盒提醒：</b>
          {notes.join('；')}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">日期</TableHead>
              <TableHead>餐</TableHead>
              <TableHead className="whitespace-nowrap">蛋白菜</TableHead>
              <TableHead className="whitespace-nowrap">主食</TableHead>
              <TableHead className="whitespace-nowrap text-right">熟肉</TableHead>
              <TableHead className="whitespace-nowrap text-right">主食量</TableHead>
              <TableHead className="whitespace-nowrap text-right">蔬菜</TableHead>
              <TableHead className="whitespace-nowrap text-right">热量</TableHead>
              <TableHead>保存</TableHead>
              <TableHead className="min-w-56">估量</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {days.map(({ day, plans }) =>
              plans.map((p, i) => (
                <TableRow key={`${day}-${p.meal}`}>
                  {i === 0 ? (
                    <TableCell rowSpan={plans.length} className="align-middle font-bold">
                      {day}
                    </TableCell>
                  ) : null}
                  <TableCell className="text-muted-foreground">{p.meal}</TableCell>
                  <TableCell className="whitespace-nowrap font-medium">{p.proteinDish}</TableCell>
                  <TableCell className="whitespace-nowrap">{p.stapleDish}</TableCell>
                  <TableCell className="tnum text-right">{fmtGrams(p.cookedMeatG)}</TableCell>
                  <TableCell className="tnum text-right">{fmtGrams(p.cookedStapleG)}</TableCell>
                  <TableCell className="tnum text-right">{fmtGrams(p.vegG)}</TableCell>
                  <TableCell className="tnum text-right font-semibold text-coral">
                    {fmtInt(p.kcal)} kcal
                  </TableCell>
                  <TableCell>
                    {p.storage === '冷藏' ? (
                      <Badge variant="outline" className="border-brand/40 bg-brand/10 text-brand">
                        冷藏
                      </Badge>
                    ) : (
                      <Badge variant="secondary">冷冻</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.estimate}</TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        估量按「拳头/掌心」给出，赶时间时不用称重也能装盒；同一午/晚每餐克数相同，称重一次可分多盒。
      </p>
    </section>
  )
}
