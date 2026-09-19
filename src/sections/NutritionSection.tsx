import type { DailyMacros, Extras, MealPlan, UserInput } from '@/lib/calc'
import { dailyCheck, extrasNote } from '@/lib/calc'
import { fmtGrams, fmtInt } from '@/lib/format'
import { GOALS, HAND_RULE } from '@/data/mealData'
import SectionHeader from './SectionHeader'

function MacroCard({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`tnum mt-1 text-2xl font-bold leading-none md:text-3xl ${accent ? 'text-coral' : ''}`}>
        {value}
        <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

function MealCard({ meal, eggOn }: { meal: MealPlan; eggOn: boolean }) {
  const rows: [string, string][] = [
    ['生肉（蛋白质 ÷ 0.2）', fmtGrams(meal.rawMeat)],
    ['熟肉（生肉 × 0.65）', fmtGrams(meal.cookedMeat)],
    ['生米面（碳水 ÷ 0.75）', fmtGrams(meal.rawGrain)],
    ['熟饭（生米 × 2.9）', fmtGrams(meal.cookedRice)],
    ['烹调油参考量' + (eggOn ? '（已扣除鸡蛋脂肪）' : '（≈ 脂肪目标）'), fmtGrams(meal.oil)],
    ['蔬菜', fmtGrams(meal.veg)],
  ]
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-bold">{meal.label}</h3>
        <span className="tnum text-sm text-muted-foreground">占全天 {Math.round(meal.share * 100)}%</span>
      </div>
      <div className="tnum mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>
          碳水 <b>{fmtInt(meal.carb)}</b> g
        </span>
        <span>
          蛋白质 <b>{fmtInt(meal.protein)}</b> g
        </span>
        <span>
          脂肪 <b>{fmtInt(meal.fat)}</b> g
        </span>
        <span>
          纤维 <b>{fmtInt(meal.fiber)}</b> g
        </span>
        <span className="text-coral">
          热量 <b>{fmtInt(meal.kcal)}</b> kcal
        </span>
      </div>
      <div className="mt-3 divide-y divide-border border-y border-border">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="tnum font-semibold">{value}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed">
        <span className="font-semibold text-brand">估量：</span>
        主食 {meal.estimate.staple} · 肉 {meal.estimate.meat} · 蔬菜 {meal.estimate.veg} · 油 {meal.estimate.oil}
      </p>
    </div>
  )
}

export default function NutritionSection({
  daily,
  meals,
  extras,
  input,
}: {
  daily: DailyMacros
  meals: MealPlan[]
  extras: Extras
  input: UserInput
}) {
  const [lo, hi] = GOALS[input.goal].kcalPerKg
  const note = extrasNote(extras)
  const check = dailyCheck(daily, meals, extras)
  return (
    <section>
      <SectionHeader id="targets" title="营养目标" desc="按每公斤体重比例计算每日总量，再按午/晚占比拆到每餐" />

      {/* 每日大数字 */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MacroCard label="碳水 / 天" value={fmtInt(daily.carb)} unit="g" />
        <MacroCard label="蛋白质 / 天" value={fmtInt(daily.protein)} unit="g" />
        <MacroCard label="脂肪 / 天" value={fmtInt(daily.fat)} unit="g" />
        <MacroCard label="膳食纤维 / 天" value={`${daily.fiber.min}–${daily.fiber.max}`} unit="g" />
        <MacroCard label="每日热量" value={fmtInt(daily.kcalByMacro)} unit="kcal" accent />
      </div>

      {/* 两种热量口径对照 */}
      <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">宏量热量（4×碳水 + 4×蛋白 + 9×脂肪）</div>
            <div className="tnum mt-1 text-xl font-bold text-brand">
              {fmtInt(daily.carb * 4)} + {fmtInt(daily.protein * 4)} + {fmtInt(daily.fat * 9)} ={' '}
              {fmtInt(daily.kcalByMacro)} kcal
            </div>
            <div className="mt-1 text-xs text-brand">本 App 按此口径落地到每一餐</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              体重 × 系数估算（{GOALS[input.goal].label}期 ≈ 体重 × {lo}~{hi}）
            </div>
            <div className="tnum mt-1 text-xl font-bold">
              {fmtInt(daily.kcalEstimate[0])} – {fmtInt(daily.kcalEstimate[1])} kcal
            </div>
            <div className="mt-1 text-xs text-muted-foreground">用于快速核对量级</div>
          </div>
        </div>
        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          两种口径互为对照、取其一即可：想精确执行就按左面的宏量克数吃（本工具即按此展开），右面区间只作 sanity
          check。膳食纤维目标 25–30 g/天（中国营养学会 DRIs），靠 500 g 蔬菜 + 杂粮 + 水果覆盖。
        </p>
      </div>

      {/* 午/晚餐 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {meals.map((m) => (
          <MealCard key={m.label} meal={m} eggOn={extras.eggsPerDay > 0} />
        ))}
      </div>

      {/* 餐外固定项说明带 */}
      {note ? (
        <p className="mt-4 border-l-4 border-brand/60 bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {note}
        </p>
      ) : null}

      {/* 全天核对：两餐 + 餐外 ≈ 全天目标 */}
      <div className="tnum mt-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-xs">
        午餐 <b>{fmtInt(meals[0]?.kcal ?? 0)}</b> + 晚餐 <b>{fmtInt(meals[1]?.kcal ?? 0)}</b> + 餐外{' '}
        <b>{fmtInt(check.extrasKcal)}</b> ≈ <b className="text-brand">{fmtInt(check.sum)} kcal</b>
        <span className="text-muted-foreground">（全天目标 {fmtInt(check.target)} kcal，正餐份量已扣除餐外项）</span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        估量口诀：{HAND_RULE.text}（{HAND_RULE.stapleFist}，{HAND_RULE.meatPalm}，{HAND_RULE.vegFist}，
        {HAND_RULE.oilThumb}）
      </p>
    </section>
  )
}
