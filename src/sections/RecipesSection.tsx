import { RECIPES } from '@/data/mealData'
import type { Recipe } from '@/data/mealData'
import type { ShoppingResult } from '@/lib/calc'
import { fmtGrams } from '@/lib/format'
import SectionHeader from './SectionHeader'

// 菜谱 → 购物清单条目（用于把「按清单量」换算成当前参数下的具体克数）
const RECIPE_ITEMS: Record<string, string[]> = {
  'lu-beef': ['beef-shank'],
  'lu-chicken-egg': ['chicken-leg', 'eggs'],
  'chicken-breast': ['chicken-breast'],
  shrimp: ['shrimp'],
  grains: ['rice', 'brown-rice', 'millet', 'sweet-potato', 'corn'],
  'veg-mix': ['broccoli', 'carrot', 'spinach', 'bell-pepper', 'mushroom'],
}

function RecipeCard({ recipe, usage }: { recipe: Recipe; usage: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold">{recipe.name}</h3>
        <span className="text-xs text-muted-foreground">覆盖：{recipe.covers}</span>
      </div>

      {/* 动态换算：按当前参数的本周用量 */}
      <p className="tnum mt-3 rounded-md bg-brand/10 px-3 py-2 text-sm font-medium text-brand">
        本周用量（按当前参数）：{usage}
      </p>

      {recipe.advance ? (
        <p className="mt-3 rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm leading-relaxed text-coral">
          <b>提前做：</b>
          {recipe.advance}
        </p>
      ) : null}

      <div className="mt-3">
        <div className="text-xs font-semibold text-muted-foreground">食材</div>
        <p className="mt-1 text-sm leading-relaxed">{recipe.ingredients.join('、')}</p>
      </div>

      <div className="mt-3">
        <div className="text-xs font-semibold text-muted-foreground">步骤</div>
        <ol className="mt-1 space-y-1.5 text-sm leading-relaxed">
          {recipe.steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 space-y-1 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          <b className="text-ink">冷冻：</b>
          {recipe.freezeTip}
        </p>
        <p>
          <b className="text-ink">复热：</b>
          {recipe.reheatTip}
        </p>
      </div>
    </div>
  )
}

export default function RecipesSection({ shopping }: { shopping: ShoppingResult }) {
  const rowById = new Map(shopping.rows.map((r) => [r.item.id, r]))
  const usageOf = (recipeId: string) =>
    (RECIPE_ITEMS[recipeId] ?? [])
      .map((id) => {
        const r = rowById.get(id)
        if (!r) return null
        return r.needGrams > 0 ? `${r.item.name} ${fmtGrams(r.needGrams)}` : `${r.item.name} ${r.qty} 份`
      })
      .filter(Boolean)
      .join(' · ')

  return (
    <section>
      <SectionHeader
        id="recipes"
        title="菜谱"
        desc="6 个菜撑起 14 餐；食材量标注「按清单量」的，已按你的参数换算成具体克数"
      />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {RECIPES.map((r) => (
          <RecipeCard key={r.id} recipe={r} usage={usageOf(r.id)} />
        ))}
      </div>
    </section>
  )
}
