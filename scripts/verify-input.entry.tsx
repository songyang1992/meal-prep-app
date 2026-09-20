// 逐键输入模拟验证入口（esbuild 打包后在 jsdom 中运行）
// 挂载真实的 PriceCell / QtyCell / WeightInput，模拟 focus → 逐键输入 → blur
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PriceCell, QtyCell } from '../src/sections/ShoppingSection'
import { WeightInput } from '../src/sections/ParamPanel'

const results: string[] = []
let failCount = 0

function expect(actual: unknown, expected: unknown, label: string) {
  const ok = String(actual) === String(expected)
  if (!ok) failCount++
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${label}  → 显示=${JSON.stringify(actual)}（期望 ${JSON.stringify(expected)}）`)
}

function Harness() {
  const [price, setPrice] = useState(22.9)
  const [qty, setQty] = useState(3)
  const [weight, setWeight] = useState(75)
  return (
    <div>
      <div data-testid="price">
        <PriceCell price={price} onCommit={setPrice} />
      </div>
      <div data-testid="qty">
        <QtyCell qty={qty} onCommit={setQty} />
      </div>
      <div data-testid="weight">
        <WeightInput weight={weight} onWeight={setWeight} />
      </div>
      <output data-testid="vals">{`${price}|${qty}|${weight}`}</output>
      <button
        data-testid="reset-price"
        onClick={() => {
          setPrice(8.8)
          setQty(5)
          setWeight(88)
        }}
      />
    </div>
  )
}

const container = document.getElementById('root')!
const root = createRoot(container)
act(() => root.render(<Harness />))

const $ = (id: string) => container.querySelector(`[data-testid="${id}"] input`) as HTMLInputElement
const vals = () => (container.querySelector('[data-testid="vals"]') as HTMLOutputElement).textContent

const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
function setNativeValue(el: HTMLInputElement, v: string) {
  nativeSetter.call(el, v)
}
function focusEl(el: HTMLInputElement) {
  act(() => {
    el.dispatchEvent(new window.FocusEvent('focusin', { bubbles: true }))
  })
}
function blurEl(el: HTMLInputElement) {
  act(() => {
    el.dispatchEvent(new window.FocusEvent('focusout', { bubbles: true }))
  })
}
function typeChar(el: HTMLInputElement, ch: string) {
  act(() => {
    setNativeValue(el, el.value + ch)
    el.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
}
function replaceValue(el: HTMLInputElement, v: string) {
  act(() => {
    setNativeValue(el, v)
    el.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
}

// ============ PriceCell ============
const price = $('price')
expect(price.value, '22.90', '单价初始显示（props 格式化为两位小数）')

focusEl(price)
replaceValue(price, '')
typeChar(price, '4')
expect(price.value, '4', '单价聚焦敲 4')
typeChar(price, '5')
expect(price.value, '45', '单价敲 45（不回写成 45.0）')
expect(vals()!.split('|')[0], '45', '单价数值实时生效（committed=45）')
typeChar(price, '.')
expect(price.value, '45.', '单价敲 45.（小数点中间态原样保留）')
typeChar(price, '9')
expect(price.value, '45.9', '单价敲 45.9')
blurEl(price)
expect(price.value, '45.90', '单价 blur 后格式化为两位小数')
expect(vals()!.split('|')[0], '45.9', '单价 blur 后 committed=45.9')

// 外部变化（模拟「恢复默认」）：未聚焦时显示刷新
act(() => {
  ;(container.querySelector('[data-testid="reset-price"]') as HTMLButtonElement).dispatchEvent(
    new window.MouseEvent('click', { bubbles: true }),
  )
})
expect(price.value, '8.80', '恢复默认后单价显示刷新为 8.80')
expect($('qty').value, '5', '恢复默认后份数显示刷新为 5')
expect($('weight').value, '88', '恢复默认后体重显示刷新为 88')

// ============ QtyCell ============
const qty = $('qty')
focusEl(qty)
replaceValue(qty, '')
typeChar(qty, '1')
expect(qty.value, '1', '份数聚焦敲 1')
expect(vals()!.split('|')[1], '1', '份数数值实时生效（committed=1）')
typeChar(qty, '2')
expect(qty.value, '12', '份数敲 12')
blurEl(qty)
expect(qty.value, '12', '份数 blur 后显示 12')

focusEl(qty)
replaceValue(qty, '150')
expect(qty.value, '150', '份数敲 150（聚焦时原样显示，不回写成 99）')
expect(vals()!.split('|')[1], '99', '份数 150 实时夹取提交为 99')
blurEl(qty)
expect(qty.value, '99', '份数 blur 后显示夹取结果 99')

focusEl(qty)
replaceValue(qty, '0')
blurEl(qty)
expect(qty.value, '1', '份数 0 blur 后夹取为 1')

// ============ WeightInput ============
const weight = $('weight')
focusEl(weight)
replaceValue(weight, '')
typeChar(weight, '8')
expect(weight.value, '8', '体重聚焦敲 8')
expect(vals()!.split('|')[2], '88', '体重 8 超出下限，暂不提交（保持 88）')
typeChar(weight, '0')
expect(weight.value, '80', '体重敲 80')
expect(vals()!.split('|')[2], '80', '体重 80 在范围内，实时生效')
typeChar(weight, '.')
expect(weight.value, '80.', '体重敲 80.（小数点中间态保留）')
typeChar(weight, '5')
expect(weight.value, '80.5', '体重敲 80.5')
blurEl(weight)
expect(weight.value, '80.5', '体重 blur 后显示 80.5')

focusEl(weight)
replaceValue(weight, '130')
blurEl(weight)
expect(weight.value, '120', '体重 130 blur 后夹取为 120')
expect(vals()!.split('|')[2], '120', '体重 committed=120')

console.log('===== 逐键输入模拟验证 =====')
results.forEach((r) => console.log(r))
console.log(failCount === 0 ? 'VERIFY_OK' : `VERIFY_FAIL (${failCount})`)
;(globalThis as Record<string, unknown>).__EXIT_CODE = failCount === 0 ? 0 : 1
