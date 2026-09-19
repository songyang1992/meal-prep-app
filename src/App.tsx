import { useEffect, useMemo, useState } from 'react'
import type { Gender, Goal } from './data/mealData'
import { GOALS, NUTRITION_DISCLAIMER } from './data/mealData'
import type { UserInput } from './lib/calc'
import { DEFAULT_INPUT, buildBoxPlans, buildShoppingList, computeDaily, computeExtras, computeMeals } from './lib/calc'
import StickyHeader from './sections/StickyHeader'
import ParamPanel from './sections/ParamPanel'
import NutritionSection from './sections/NutritionSection'
import ShoppingSection from './sections/ShoppingSection'
import PrepSection from './sections/PrepSection'
import RecipesSection from './sections/RecipesSection'
import BoxesSection from './sections/BoxesSection'
import StorageSection from './sections/StorageSection'

const LS_INPUT = 'mealprep.input.v1'
const LS_PRICES = 'mealprep.prices.v1'
const LS_CHECKED = 'mealprep.checked.v1'

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch {
    return fallback
  }
}

function loadInput(): UserInput {
  const raw = loadJSON<UserInput>(LS_INPUT, DEFAULT_INPUT)
  const gender: Gender = raw.gender === 'female' ? 'female' : 'male'
  const goal: Goal = raw.goal === 'gain' ? 'gain' : 'cut'
  const ranges = GOALS[goal].ranges[gender]
  const clamp = (v: number, min: number, max: number) =>
    isFinite(v) ? Math.min(max, Math.max(min, v)) : min
  return {
    gender,
    goal,
    weight: clamp(raw.weight, 40, 120),
    carbPerKg: clamp(raw.carbPerKg, ranges.carb.min, ranges.carb.max),
    proteinPerKg: clamp(raw.proteinPerKg, ranges.protein.min, ranges.protein.max),
    fatPerKg: clamp(raw.fatPerKg, ranges.fat.min, ranges.fat.max),
    lunchShare: clamp(raw.lunchShare, 0.3, 0.7),
    // 旧 localStorage 数据没有这两个字段，缺省视为 true（与 DEFAULT_INPUT 一致）
    includeEgg: raw.includeEgg !== false,
    includeFruit: raw.includeFruit !== false,
  }
}

export default function App() {
  const [input, setInput] = useState<UserInput>(loadInput)
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>(() =>
    loadJSON(LS_PRICES, {} as Record<string, number>),
  )
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    loadJSON(LS_CHECKED, {} as Record<string, boolean>),
  )

  useEffect(() => {
    localStorage.setItem(LS_INPUT, JSON.stringify(input))
  }, [input])
  useEffect(() => {
    localStorage.setItem(LS_PRICES, JSON.stringify(priceOverrides))
  }, [priceOverrides])
  useEffect(() => {
    localStorage.setItem(LS_CHECKED, JSON.stringify(checked))
  }, [checked])

  // 切换性别/目标时，三项每 kg 比例重置为该组合默认值
  const setGender = (gender: Gender) =>
    setInput((prev) => {
      const r = GOALS[prev.goal].ranges[gender]
      return { ...prev, gender, carbPerKg: r.carb.def, proteinPerKg: r.protein.def, fatPerKg: r.fat.def }
    })
  const setGoal = (goal: Goal) =>
    setInput((prev) => {
      const r = GOALS[goal].ranges[prev.gender]
      return { ...prev, goal, carbPerKg: r.carb.def, proteinPerKg: r.protein.def, fatPerKg: r.fat.def }
    })

  const daily = useMemo(() => computeDaily(input), [input])
  const extras = useMemo(() => computeExtras(input), [input])
  const meals = useMemo(() => computeMeals(daily, input.lunchShare, extras), [daily, input.lunchShare, extras])
  const shopping = useMemo(() => buildShoppingList(daily, extras, priceOverrides), [daily, extras, priceOverrides])
  const boxes = useMemo(() => buildBoxPlans(meals), [meals])

  return (
    <div className="min-h-screen bg-paper text-ink">
      <StickyHeader daily={daily} />

      {/* Hero */}
      <section id="top" className="scroll-mt-24 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            周末备餐 · <span className="text-brand">一周健身餐</span>
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            输入性别、体重和目标，自动算出每天和每餐的碳水 / 蛋白质 / 脂肪 /
            膳食纤维；一次买齐食材，周末 3 小时做完 14 盒午餐 + 晚餐，冷冻复热吃一周。
          </p>
          <div className="tnum mt-5 flex flex-wrap gap-2 text-sm">
            {['14 餐 / 周', '周末 3 小时', '1 次买齐', '冷冻复热'].map((t) => (
              <span key={t} className="rounded-full border border-brand/30 bg-brand/5 px-3 py-1 font-medium text-brand">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 主体：左侧参数栏 + 右侧内容流 */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:flex lg:items-start lg:gap-8">
        <aside className="mb-8 lg:sticky lg:top-20 lg:mb-0 lg:w-80 lg:shrink-0">
          <ParamPanel
            input={input}
            onGender={setGender}
            onGoal={setGoal}
            onWeight={(kg) => setInput((p) => ({ ...p, weight: kg }))}
            onRatio={(key, v) => setInput((p) => ({ ...p, [key]: v }))}
            onLunchShare={(v) => setInput((p) => ({ ...p, lunchShare: v }))}
            onToggleExtra={(key, v) => setInput((p) => ({ ...p, [key]: v }))}
            onReset={() => setInput(DEFAULT_INPUT)}
          />
        </aside>

        <main className="min-w-0 flex-1 space-y-14">
          <NutritionSection daily={daily} meals={meals} extras={extras} input={input} />
          <ShoppingSection
            shopping={shopping}
            checked={checked}
            onToggleChecked={(id) => setChecked((p) => ({ ...p, [id]: !p[id] }))}
            onPrice={(id, v) => setPriceOverrides((p) => ({ ...p, [id]: v }))}
            weeklyOil={daily.fat * 7}
          />
          <PrepSection />
          <RecipesSection shopping={shopping} />
          <BoxesSection boxes={boxes} extras={extras} />
          <StorageSection />
        </main>
      </div>

      {/* 页脚 */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl space-y-2 px-4 py-8 text-xs leading-relaxed text-muted-foreground">
          <p>{NUTRITION_DISCLAIMER}</p>
          <p>
            数据来源：用户提供的健身餐笔记（营养素表与换算公式），口径与《中国食物成分表》一致；价格为小象超市 /
            七鲜超市北京参考价，仅供预算估算。
          </p>
        </div>
      </footer>
    </div>
  )
}
