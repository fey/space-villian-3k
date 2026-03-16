type Child = HTMLElement | string | number | null | undefined

type Props = {
  class?: string
  onclick?: (e: MouseEvent) => void
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Props | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {

  const el = document.createElement(tag)

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key === 'class') {
        el.className = value as string
        continue
      }

      if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2), value as EventListener)
        continue
      }

      el.setAttribute(key, String(value))
    }
  }

  for (const child of children) {
    if (child == null) continue

    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)))
    } else {
      el.appendChild(child)
    }
  }

  return el
}
