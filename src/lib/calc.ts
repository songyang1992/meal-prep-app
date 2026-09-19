// ============================================================
// 计算逻辑（纯函数）：公式全部来自知识库图片
// 模型：全天目标 = 午餐 + 晚餐 + 餐外固定项（卤蛋 1 枚 + 水果 250g）
// 餐外项的热量/宏量营养素计入全天目标，从午晚餐预算中扣除，保证总数对得上
// ============================================================
import {
  GOALS, FIBER_TARGET, VEG_TARGET, FRUIT_TARGET, FRUIT_PER100, EGG_NUTRITION,
  RAW_MEAT_PROTEIN, RAW_STAPLE_CARB, RICE_COOK_RATIO, MEAT_COOK_RATIO,
  SHOP_ITEMS, CATEGORY_META, FOODS,
} from '../data/mealData'
import type { Gender, Goal, ShopItem, ShopCategory } from '../data/mealData'

export interface UserInput {
  gender: Gender
  weight: number // kg
  goal: Goal
  carbPerKg: number
  proteinPerKg: number
  fatPerKg: number
  lunchShare: number // 0–1，午餐占全天比例（晚餐=1-午餐）
  includeEgg: boolean   // 每天 1 枚卤蛋（餐外）
  includeFruit: boolean // 每天 250g 低 GI 水果（餐外）
}

export const DEFAULT_INPUT: UserInput = {
  gender: 'male',
  weight: 75,
  goal: 'cut',
  carbPerKg: GOALS.cut.ranges.male.carb.def,
  proteinPerKg: GOALS.cut.ranges.male.protein.def,
  fatPerKg: GOALS.cut.ranges.male.fat.def,
  lunchShare: 0.5,
  includeEgg: true,
  includeFruit: true,
}

export interface DailyMacros {
  carb: number
  protein: number
  fat: number
  fiber: { min: number; max: number }
  kcalByMacro: number
  kcalEstimate: [number, number]
}

export function computeDaily(input: UserInput): DailyMacros {
  const { weight, carbPerKg, proteinPerKg, fatPerKg } = input
  const carb = weight * carbPerKg
  const protein = weight * proteinPerKg
  const fat = weight * fatPerKg
  const kcalByMacro = carb * 4 + protein * 4 + fat * 9
  const [lo, hi] = GOALS[input.goal].kcalPerKg
  return {
    carb,
    protein,
    fat,
    fiber: FIBER_TARGET,
    kcalByMacro,
    kcalEstimate: [weight * lo, weight * hi],
  }
}

// ---------- 餐外固定项 ----------
export interface Extras {
  eggsPerDay: number
  fruitG: number
  carb: number    // 餐外碳水合计 g/天
  protein: number
  fat: number
  kcal: number
}

export function computeExtras(input: UserInput): Extras {
  const eggsPerDay = input.includeEgg ? 1 : 0
  const fruitG = input.includeFruit ? FRUIT_TARGET : 0
  const carb = eggsPerDay * EGG_NUTRITION.carb + (fruitG * FRUIT_PER100.carb) / 100
  const protein = eggsPerDay * EGG_NUTRITION.protein
  const fat = eggsPerDay * EGG_NUTRITION.fat
  const kcal = eggsPerDay * EGG_NUTRITION.kcal + (fruitG * FRUIT_PER100.kcal) / 100
  return { eggsPerDay, fruitG, carb, protein, fat, kcal }
}

export function extrasNote(extras: Extras): string {
  const parts: string[] = []
  if (extras.eggsPerDay > 0) parts.push(`卤蛋 ${extras.eggsPerDay} 枚（≈${Math.round(extras.eggsPerDay * EGG_NUTRITION.kcal)} kcal，不装盒、随餐吃）`)
  if (extras.fruitG > 0) parts.push(`低 GI 水果 ${extras.fruitG}g（≈${Math.round((extras.fruitG * FRUIT_PER100.kcal) / 100)} kcal，两餐之间或下午加餐）`)
  if (parts.length === 0) return ''
  return `每天餐外：${parts.join(' + ')}，共 ≈${Math.round(extras.kcal)} kcal —— 已计入全天目标，正餐份量已相应扣减`
}

export interface MealPlan {
  label: '午餐' | '晚餐'
  share: number
  carb: number
  protein: number
  fat: number
  kcal: number
  fiber: number
  // 食材量
  rawMeat: number      // 生肉 g（÷0.2 公式）
  cookedMeat: number   // 熟肉 g（×0.65）
  rawGrain: number     // 生米面 g（÷0.75 公式）
  cookedRice: number   // 若全吃米饭的熟重 g（×2.9）
  oil: number          // 油 g（脂肪预算扣除鸡蛋脂肪后的烹调油参考量）
  veg: number          // 蔬菜 g
  // 估量
  estimate: { staple: string; meat: string; veg: string; oil: string }
}

function fist(n: number, per: number) {
  const v = n / per
  return v < 0.75 ? `${v.toFixed(1)} 拳头` : v < 1.25 ? '约 1 拳头' : v < 1.75 ? '约 1.5 拳头' : `约 ${Math.round(v)} 拳头`
}

export function computeMeals(daily: DailyMacros, lunchShare: number, extras: Extras): MealPlan[] {
  // 正餐预算 = 全天目标 − 餐外固定项（扣到 0 为止）
  const mealBudget = {
    carb: Math.max(0, daily.carb - extras.carb),
    protein: Math.max(0, daily.protein - extras.protein),
    fat: Math.max(0, daily.fat - extras.fat),
  }
  return (['午餐', '晚餐'] as const).map((label, i) => {
    const share = i === 0 ? lunchShare : 1 - lunchShare
    const carb = mealBudget.carb * share
    const protein = mealBudget.protein * share
    const fat = mealBudget.fat * share
    const kcal = carb * 4 + protein * 4 + fat * 9
    const rawMeat = protein / RAW_MEAT_PROTEIN
    const cookedMeat = rawMeat * MEAT_COOK_RATIO
    const rawGrain = carb / RAW_STAPLE_CARB
    const cookedRice = rawGrain * RICE_COOK_RATIO
    return {
      label, share, carb, protein, fat, kcal,
      fiber: ((daily.fiber.min + daily.fiber.max) / 2) * share,
      rawMeat, cookedMeat, rawGrain, cookedRice,
      oil: fat,
      veg: VEG_TARGET * share,
      estimate: {
        staple: fist(cookedRice, 165),
        meat: cookedMeat < 90 ? `${(cookedMeat / 110).toFixed(1)} 掌心` : cookedMeat < 140 ? '约 1 掌心' : `约 ${(cookedMeat / 110).toFixed(1)} 掌心`,
        veg: `约 ${Math.round((VEG_TARGET * share) / 110)} 拳头`,
        oil: `约 ${Math.max(1, Math.round(fat / 6))} 拇指`,
      },
    }
  })
}

// ---------- 购物清单 ----------

export interface ShoppingRow {
  item: ShopItem
  qty: number          // 购买份数
  needGrams: number    // 需求克数（fixed 项为 0）
  subtotal: number
}

export interface ShoppingResult {
  rows: ShoppingRow[]
  byCategory: { category: ShopCategory; label: string; icon: string; rows: ShoppingRow[]; subtotal: number }[]
  total: number
  // 需求池克数，供 UI 展示“为什么这么买”
  pools: { meat: number; stapleGrain: number; stapleTuber: number; veg: number; fruit: number }
}

// 一周 = 14 餐（午+晚×7，不吃早餐）
export const MEALS_PER_WEEK = 14
// 主食结构中，谷物饭 vs 薯玉 的占比
export const GRAIN_SHARE = 0.65

export function buildShoppingList(
  daily: DailyMacros,
  extras: Extras,
  priceOverrides: Record<string, number> = {},
): ShoppingResult {
  // 正餐预算（扣除餐外项）
  const mealCarb = Math.max(0, daily.carb - extras.carb)
  const mealProtein = Math.max(0, daily.protein - extras.protein)

  // 需求池（一周 7 天）
  const pools = {
    meat: (mealProtein / RAW_MEAT_PROTEIN) * 7,        // 生肉 g
    stapleGrain: (mealCarb / RAW_STAPLE_CARB) * 7 * GRAIN_SHARE, // 生谷物 g
    stapleTuber: 0, // 下方换算
    veg: VEG_TARGET * 7,
    fruit: extras.fruitG * 7,
  }
  // 薯玉池换算：薯玉熟重提供等量碳水 ≈ 谷物生重×0.75÷0.20（薯玉碳水≈20%）
  pools.stapleTuber = (mealCarb / RAW_STAPLE_CARB) * 7 * (1 - GRAIN_SHARE) * (RAW_STAPLE_CARB / 0.20)

  const rows: ShoppingRow[] = SHOP_ITEMS.map((item) => {
    const price = priceOverrides[item.id] ?? item.unitPrice
    let qty = 0
    let needGrams = 0
    if (item.id === 'eggs') {
      qty = extras.eggsPerDay > 0 ? 1 : 0 // 30 枚/盒，覆盖每日 1 枚
    } else if (item.qtyRule.type === 'fixed') {
      qty = item.qtyRule.qty
    } else {
      const pool = pools[item.group as keyof typeof pools] ?? 0
      needGrams = pool * item.qtyRule.share
      qty = needGrams <= 0 ? 0 : Math.max(1, Math.ceil(needGrams / item.qtyRule.gramsPerUnit))
    }
    return { item: { ...item, unitPrice: price }, qty, needGrams, subtotal: qty * price }
  }).filter((r) => r.qty > 0) // 关闭水果/鸡蛋开关时对应行直接不出现在清单

  const cats = (Object.keys(CATEGORY_META) as ShopCategory[]).map((category) => {
    const catRows = rows.filter((r) => r.item.category === category)
    return {
      category,
      label: CATEGORY_META[category].label,
      icon: CATEGORY_META[category].icon,
      rows: catRows,
      subtotal: catRows.reduce((s, r) => s + r.subtotal, 0),
    }
  }).filter((c) => c.rows.length > 0)

  return { rows, byCategory: cats, total: rows.reduce((s, r) => s + r.subtotal, 0), pools }
}

// ---------- 14 盒分装表 ----------

export interface BoxPlan {
  day: string
  meal: '午餐' | '晚餐'
  proteinDish: string
  stapleDish: string
  cookedMeatG: number
  cookedStapleG: number
  vegG: number
  kcal: number
  storage: '冷藏' | '冷冻'
  estimate: string
}

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
// 蛋白质轮换（尽量让卤味在前半周先吃冷藏的）
const PROTEIN_ROTATION_LUNCH = ['卤牛腱', '卤鸡腿', '蒜香鸡胸', '卤牛腱', '卤鸡腿', '蒜香鸡胸', '卤牛腱']
const PROTEIN_ROTATION_DINNER = ['卤鸡腿', '卤牛腱', '蒜香鸡胸', '白灼虾仁', '卤鸡腿', '蒜香鸡胸', '白灼虾仁']
// 主食轮换：杂粮饭为主，薯玉穿插
const STAPLE_ROTATION = ['杂粮饭', '杂粮饭', '蒸红薯+玉米', '杂粮饭', '杂粮饭', '蒸红薯+玉米', '杂粮饭']

export function buildBoxPlans(meals: MealPlan[]): BoxPlan[] {
  const plans: BoxPlan[] = []
  WEEK_DAYS.forEach((day, di) => {
    meals.forEach((m) => {
      const isLunch = m.label === '午餐'
      const stapleDish = STAPLE_ROTATION[di]
      // 薯玉餐：熟重按等碳水换算（薯玉碳水≈20% vs 米饭 26%）
      const cookedStapleG = stapleDish === '杂粮饭'
        ? m.cookedRice
        : m.carb / 0.20
      plans.push({
        day,
        meal: m.label,
        proteinDish: isLunch ? PROTEIN_ROTATION_LUNCH[di] : PROTEIN_ROTATION_DINNER[di],
        stapleDish,
        cookedMeatG: m.cookedMeat,
        cookedStapleG,
        vegG: m.veg,
        kcal: m.kcal,
        // 周一二冷藏，其余冷冻
        storage: di <= 1 ? '冷藏' : '冷冻',
        estimate: `主食${m.estimate.staple} + 肉${m.estimate.meat} + 蔬菜${m.estimate.veg}`,
      })
    })
  })
  return plans
}

// ---------- 每餐热量与宏量营养素对照 ----------
export function macroKcal(carb: number, protein: number, fat: number) {
  return carb * 4 + protein * 4 + fat * 9
}

// 全天核对：两餐热量 + 餐外热量 ≈ 宏量热量目标
export function dailyCheck(daily: DailyMacros, meals: MealPlan[], extras: Extras) {
  const mealsKcal = meals.reduce((s, m) => s + m.kcal, 0)
  return {
    mealsKcal,
    extrasKcal: extras.kcal,
    sum: mealsKcal + extras.kcal,
    target: daily.kcalByMacro,
  }
}

// 每餐纤维估算：蔬菜 500g≈11g + 杂粮/薯类 + 水果，粗略达到 25–30g/天
export function fiberNote() {
  return '500g 蔬菜（≈11g）+ 杂粮饭/薯玉（≈8–10g）+ 250g 低 GI 水果（≈4–6g）合计约 25–30g，达标'
}

// 食物表分组（用于“知识库”页签）
export function foodsByCategory() {
  return {
    carb: FOODS.filter((f) => f.category === 'carb'),
    protein: FOODS.filter((f) => f.category === 'protein'),
    fat: FOODS.filter((f) => f.category === 'fat'),
  }
}
