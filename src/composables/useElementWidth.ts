import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Tracks the content width of an element via ResizeObserver.
 * Used by the SVG charts to re-calculate their geometry (1 viewBox unit = 1 px),
 * so fonts keep their size and the chart stays readable on every screen.
 *
 * @param target - Template ref of the element to observe
 * @param initial - Fallback width before the first measurement (px)
 * @returns Reactive width in px
 */
export function useElementWidth(target: Ref<HTMLElement | null>, initial = 300) {
  const width = ref(initial)
  let observer: ResizeObserver | null = null

  onMounted(() => {
    const el = target.value
    if (!el) return
    width.value = el.clientWidth || initial
    observer = new ResizeObserver(([entry]) => {
      if (entry) width.value = Math.round(entry.contentRect.width) || initial
    })
    observer.observe(el)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return width
}
