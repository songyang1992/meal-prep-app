// jsdom 环境搭建 + 加载打包后的验证 bundle
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true })
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.HTMLInputElement = dom.window.HTMLInputElement
globalThis.HTMLOutputElement = dom.window.HTMLOutputElement
globalThis.FocusEvent = dom.window.FocusEvent
globalThis.MouseEvent = dom.window.MouseEvent
globalThis.Event = dom.window.Event
globalThis.localStorage = dom.window.localStorage
globalThis.IS_REACT_ACT_ENVIRONMENT = true

await import('./.verify-input.bundle.mjs')

process.exit(globalThis.__EXIT_CODE ?? 1)
