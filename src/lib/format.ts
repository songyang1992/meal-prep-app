// 展示格式化：克数取整（<1000 显示 g，≥1000 显示 kg 保留 1 位小数），价格保留 2 位小数

export function fmtGrams(g: number): string {
  if (!isFinite(g) || g <= 0) return '—'
  if (g < 1000) return `${Math.round(g)} g`
  return `${(g / 1000).toFixed(1)} kg`
}

export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('zh-CN')
}

export function fmtPrice(n: number): string {
  return `¥${n.toFixed(2)}`
}

// 每 kg 比例显示：去掉多余的尾零（1.50 → 1.5，1.75 → 1.75）
export function fmtRatio(v: number): string {
  return String(Math.round(v * 100) / 100)
}
