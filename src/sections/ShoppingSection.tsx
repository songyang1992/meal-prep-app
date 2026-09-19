import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { OIL_ADVICE, PRICE_DISCLAIMER } from '@/data/mealData'
import type { ShoppingResult, ShoppingRow } from '@/lib/calc'
import { fmtGrams, fmtPrice } from '@/lib/format'
import SectionHeader from './SectionHeader'

// 用户对某一行的改动：规格文本 / 份数 / 单价（undefined = 用默认值）
export interface ItemOverride {
  spec?: string
  qty?: number
  price?: number
}

function SpecCell({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const [text, setText] = useState(value)
  useEffect(() => {
    setText(value)
  }, [value])
  return (
    <Input
      className="h-8 w-24 text-xs"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const t = text.trim()
        if (t && t !== value) onCommit(t)
        else setText(value)
      }}
    />
  )
}

function QtyCell({ qty, onCommit }: { qty: number; onCommit: (v: number) => void }) {
  const [text, setText] = useState(String(qty))
  useEffect(() => {
    setText(String(qty))
  }, [qty])
  return (
    <Input
      inputMode="numeric"
      className="tnum h-8 w-14 text-right"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        const v = parseInt(e.target.value, 10)
        if (!isNaN(v)) onCommit(Math.min(99, Math.max(1, v)))
      }}
      onBlur={() => setText(String(qty))}
    />
  )
}

function PriceCell({ price, onCommit }: { price: number; onCommit: (v: number) => void }) {
  const [text, setText] = useState(price.toFixed(1))
  useEffect(() => {
    setText(price.toFixed(1))
  }, [price])
  return (
    <Input
      inputMode="decimal"
      className="tnum h-8 w-20 text-right"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        const v = parseFloat(e.target.value)
        if (!isNaN(v) && v >= 0) onCommit(v)
      }}
      onBlur={() => setText(price.toFixed(1))}
    />
  )
}

// 应用 override 后的行视图
interface RowView {
  row: ShoppingRow
  isChecked: boolean
  effSpec: string
  effQty: number
  effPrice: number
  effSubtotal: number
}

interface Props {
  shopping: ShoppingResult
  checked: Record<string, boolean>
  onToggleChecked: (id: string) => void
  overrides: Record<string, ItemOverride>
  onOverride: (id: string, patch: ItemOverride) => void
  onResetOverrides: () => void
  weeklyOil: number
}

export default function ShoppingSection({
  shopping,
  checked,
  onToggleChecked,
  overrides,
  onOverride,
  onResetOverrides,
  weeklyOil,
}: Props) {
  // 在 UI 层应用 override 并重算小计（calc 层保持纯净）
  const catsView = shopping.byCategory.map((cat) => {
    const rows: RowView[] = cat.rows.map((r) => {
      const o = overrides[r.item.id] ?? {}
      const effQty = o.qty ?? r.qty
      const effPrice = o.price ?? r.item.unitPrice
      return {
        row: r,
        isChecked: !!checked[r.item.id],
        effSpec: o.spec ?? r.item.spec,
        effQty,
        effPrice,
        effSubtotal: effQty * effPrice,
      }
    })
    return {
      ...cat,
      rows,
      // 勾选 = 已有/不买，不计入小计
      subtotal: rows.filter((v) => !v.isChecked).reduce((s, v) => s + v.effSubtotal, 0),
    }
  })
  const total = catsView.reduce((s, c) => s + c.subtotal, 0)
  const excluded = catsView.reduce(
    (s, c) => s + c.rows.filter((v) => v.isChecked).reduce((x, v) => x + v.effSubtotal, 0),
    0,
  )
  const hasOverrides = Object.keys(overrides).length > 0

  return (
    <section>
      <SectionHeader
        id="shopping"
        title="本周采购清单"
        desc="数量随左侧参数实时联动；规格/份数/单价都可直接修改，自动保存在本机"
      />

      <p className="mt-4 border-l-4 border-coral/60 bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        {PRICE_DISCLAIMER}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          打勾 = 已有或不买，该行<em className="not-italic text-coral">不计入总价</em>。
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-7 shrink-0 px-2.5 text-xs"
          disabled={!hasOverrides}
          onClick={onResetOverrides}
        >
          恢复默认
        </Button>
      </div>

      <div className="mt-4 space-y-6">
        {catsView.map((cat) => (
          <div key={cat.category}>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-base font-bold">
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
              </h3>
              <span className="tnum text-sm text-muted-foreground">
                小计 <b className="text-ink">{fmtPrice(cat.subtotal)}</b>
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>品名</TableHead>
                    <TableHead className="whitespace-nowrap">规格</TableHead>
                    <TableHead className="whitespace-nowrap text-right">需要量</TableHead>
                    <TableHead className="text-right">份数</TableHead>
                    <TableHead className="text-right">单价</TableHead>
                    <TableHead className="text-right">小计</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cat.rows.map((v) => {
                    const r = v.row
                    return (
                      <TableRow key={r.item.id} className={v.isChecked ? 'opacity-45' : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={v.isChecked}
                            onCheckedChange={() => onToggleChecked(r.item.id)}
                            aria-label={`已有或不买 ${r.item.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${v.isChecked ? 'line-through' : ''}`}>{r.item.name}</div>
                          {r.item.tip ? (
                            <div className="mt-0.5 text-xs leading-snug text-muted-foreground">{r.item.tip}</div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <SpecCell value={v.effSpec} onCommit={(s) => onOverride(r.item.id, { spec: s })} />
                        </TableCell>
                        <TableCell className="tnum text-right font-medium">
                          {r.item.qtyRule.type === 'fixed' ? '—' : fmtGrams(r.needGrams)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <QtyCell qty={v.effQty} onCommit={(q) => onOverride(r.item.id, { qty: q })} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <PriceCell price={v.effPrice} onCommit={(p) => onOverride(r.item.id, { price: p })} />
                          </div>
                        </TableCell>
                        <TableCell className="tnum text-right font-semibold">
                          {fmtPrice(v.effSubtotal)}
                          {v.isChecked ? (
                            <div className="text-[10px] font-normal text-muted-foreground">不计入</div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>

      {/* 总计：合计（未勾选项）+ 已勾掉 */}
      <div className="mt-6 rounded-xl border-2 border-brand bg-brand/5 px-5 py-4">
        <div className="flex items-baseline justify-between">
          <span className="font-bold">合计</span>
          <span className="tnum text-3xl font-bold text-brand">{fmtPrice(total)}</span>
        </div>
        <div className="tnum mt-1 text-right text-xs text-muted-foreground">
          已勾掉 {fmtPrice(excluded)}（已有/不买）
        </div>
      </div>

      {/* 油脂建议 */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-bold">油脂建议</h3>
          <span className="tnum text-sm text-muted-foreground">
            本周用油总量 ≈ <b className="text-ink">{fmtGrams(weeklyOil)}</b>（每日脂肪 × 7）
          </span>
        </div>
        <p className="mt-1 text-xs text-coral">
          脂肪 100% 来自油，不计入购物清单、不参与总价，按需选购（家里常有的不用重复买）。
        </p>
        <div className="mt-3 divide-y divide-border border-y border-border">
          {OIL_ADVICE.map((o) => (
            <div key={o.name} className="grid gap-0.5 py-2 text-sm sm:grid-cols-[10rem_9rem_1fr] sm:gap-3">
              <span className="font-medium">{o.name}</span>
              <span className="text-brand">{o.use}</span>
              <span className="text-muted-foreground">{o.note}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          每日用油分摊：炒菜用山茶油/菜籽油，凉拌和复热后淋油用橄榄油/亚麻籽油，大致按「每餐约 1
          拇指」执行即可。
        </p>
      </div>
    </section>
  )
}
