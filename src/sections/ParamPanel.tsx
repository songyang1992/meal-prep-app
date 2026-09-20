import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Gender, Goal, RatioRange } from '@/data/mealData'
import { GOALS } from '@/data/mealData'
import type { UserInput } from '@/lib/calc'
import { fmtRatio } from '@/lib/format'

interface Props {
  input: UserInput
  onGender: (g: Gender) => void
  onGoal: (g: Goal) => void
  onWeight: (kg: number) => void
  onRatio: (key: 'carbPerKg' | 'proteinPerKg' | 'fatPerKg', v: number) => void
  onLunchShare: (v: number) => void
  onToggleExtra: (key: 'includeEgg' | 'includeFruit', v: boolean) => void
  onReset: () => void
}

function RatioSlider({
  label,
  range,
  value,
  onChange,
}: {
  label: string
  range: RatioRange
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="tnum font-semibold text-brand">{fmtRatio(value)} g/kg</span>
      </div>
      <Slider
        min={range.min}
        max={range.max}
        step={0.05}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
      />
      <div className="tnum mt-0.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{fmtRatio(range.min)}</span>
        <span>默认 {fmtRatio(range.def)}</span>
        <span>{fmtRatio(range.max)}</span>
      </div>
    </div>
  )
}

// 体重输入：focus-aware raw text，聚焦期间显示原始输入不回写，blur 时夹取 40–120 并提交
export function WeightInput({ weight, onWeight }: { weight: number; onWeight: (kg: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <Input
      inputMode="decimal"
      className="tnum h-8 w-20 text-right"
      value={draft ?? String(weight)}
      onFocus={(e) => setDraft(e.target.value)}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        const v = parseFloat(raw)
        if (!isNaN(v) && v >= 40 && v <= 120) onWeight(v) // 范围内的值实时生效；范围外等 blur 夹取
      }}
      onBlur={() => {
        if (draft === null) return
        const v = parseFloat(draft)
        if (!isNaN(v)) onWeight(Math.min(120, Math.max(40, v)))
        setDraft(null)
      }}
    />
  )
}

export default function ParamPanel({ input, onGender, onGoal, onWeight, onRatio, onLunchShare, onToggleExtra, onReset }: Props) {
  const goalCfg = GOALS[input.goal]
  const ranges = goalCfg.ranges[input.gender]
  const lunchPct = Math.round(input.lunchShare * 100)

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold">我的参数</h2>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={onReset}>
          重置
        </Button>
      </div>

      {/* 性别 */}
      <div className="mb-4">
        <div className="mb-1.5 text-xs text-muted-foreground">性别</div>
        <ToggleGroup
          type="single"
          value={input.gender}
          onValueChange={(v) => v && onGender(v as Gender)}
          className="grid w-full grid-cols-2"
        >
          <ToggleGroupItem value="male" className="data-[state=on]:bg-brand data-[state=on]:text-white">
            男
          </ToggleGroupItem>
          <ToggleGroupItem value="female" className="data-[state=on]:bg-brand data-[state=on]:text-white">
            女
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* 体重 */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">体重</span>
          <div className="flex items-center gap-1">
            <WeightInput weight={input.weight} onWeight={onWeight} />
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
        </div>
        <Slider min={40} max={120} step={1} value={[input.weight]} onValueChange={(v) => onWeight(v[0])} />
        <div className="tnum mt-0.5 flex justify-between text-[11px] text-muted-foreground">
          <span>40</span>
          <span>120</span>
        </div>
      </div>

      {/* 目标 */}
      <div className="mb-4">
        <div className="mb-1.5 text-xs text-muted-foreground">目标</div>
        <ToggleGroup
          type="single"
          value={input.goal}
          onValueChange={(v) => v && onGoal(v as Goal)}
          className="grid w-full grid-cols-2"
        >
          <ToggleGroupItem value="cut" className="data-[state=on]:bg-brand data-[state=on]:text-white">
            减脂
          </ToggleGroupItem>
          <ToggleGroupItem value="gain" className="data-[state=on]:bg-brand data-[state=on]:text-white">
            增肌
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{goalCfg.desc}</p>
      </div>

      <Separator className="my-4" />

      {/* 每 kg 比例 */}
      <div className="space-y-4">
        <div className="text-xs text-muted-foreground">每公斤体重摄入量（切换性别/目标时重置为默认）</div>
        <RatioSlider label="碳水" range={ranges.carb} value={input.carbPerKg} onChange={(v) => onRatio('carbPerKg', v)} />
        <RatioSlider
          label="蛋白质"
          range={ranges.protein}
          value={input.proteinPerKg}
          onChange={(v) => onRatio('proteinPerKg', v)}
        />
        <RatioSlider label="脂肪" range={ranges.fat} value={input.fatPerKg} onChange={(v) => onRatio('fatPerKg', v)} />
      </div>

      <Separator className="my-4" />

      {/* 午/晚分配 */}
      <div>
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span>午餐 / 晚餐分配</span>
          <span className="tnum font-semibold text-brand">
            {lunchPct}% / {100 - lunchPct}%
          </span>
        </div>
        <Slider
          min={30}
          max={70}
          step={5}
          value={[lunchPct]}
          onValueChange={(v) => onLunchShare(v[0] / 100)}
        />
        <div className="tnum mt-0.5 flex justify-between text-[11px] text-muted-foreground">
          <span>午餐多</span>
          <span>晚餐多</span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* 餐外固定项 */}
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground">餐外固定项（计入全天目标，正餐份量相应扣减）</div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="sw-egg" className="cursor-pointer text-sm leading-snug">
            每天 1 枚卤蛋<span className="text-muted-foreground">（餐外加餐）</span>
          </label>
          <Switch
            id="sw-egg"
            checked={input.includeEgg}
            onCheckedChange={(v) => onToggleExtra('includeEgg', v)}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="sw-fruit" className="cursor-pointer text-sm leading-snug">
            每天 250g 低 GI 水果<span className="text-muted-foreground">（餐外）</span>
          </label>
          <Switch
            id="sw-fruit"
            checked={input.includeFruit}
            onCheckedChange={(v) => onToggleExtra('includeFruit', v)}
          />
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        所有参数自动保存在本机浏览器，下次打开继续沿用。
      </p>
    </div>
  )
}
