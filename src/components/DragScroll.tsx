import { ReactNode, useEffect, useRef } from 'react'

const DRAG_THRESHOLD = 5

// Elementos que continuam clicáveis normalmente (não iniciam o arrasto)
const INTERACTIVE = 'button, a, input, textarea, select, [role="button"], th'

interface DragScrollProps {
  children: ReactNode
}

// Permite rolar a tabela para os lados clicando e arrastando com o mouse.
// Só no eixo X; na vertical a página rola normalmente.
export function DragScroll({ children }: DragScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // A área que rola é o elemento que envolve a <table> no NextUI
    const element = containerRef.current?.querySelector('table')
      ?.parentElement as HTMLElement | undefined
    if (!element) {
      return
    }

    let isPointerDown = false
    let hasDragged = false
    let startX = 0
    let startScrollLeft = 0

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement
      if (
        event.pointerType !== 'mouse' ||
        event.button !== 0 ||
        target.closest(INTERACTIVE)
      ) {
        return
      }
      isPointerDown = true
      hasDragged = false
      startX = event.clientX
      startScrollLeft = element!.scrollLeft
    }

    function handlePointerMove(event: PointerEvent) {
      if (!isPointerDown) {
        return
      }
      const deltaX = event.clientX - startX
      if (!hasDragged && Math.abs(deltaX) < DRAG_THRESHOLD) {
        return
      }
      if (!hasDragged) {
        hasDragged = true
        element!.style.cursor = 'grabbing'
        element!.style.userSelect = 'none'
      }
      element!.scrollLeft = startScrollLeft - deltaX
    }

    function handlePointerUp() {
      if (!isPointerDown) {
        return
      }
      isPointerDown = false
      element!.style.cursor = ''
      element!.style.userSelect = ''
    }

    // Depois de arrastar, o clique que vem junto não deve abrir nada
    function handleClick(event: MouseEvent) {
      if (hasDragged) {
        event.stopPropagation()
        event.preventDefault()
        hasDragged = false
      }
    }

    element.classList.add('md:cursor-grab')
    element.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    element.addEventListener('click', handleClick, true)

    return () => {
      element.classList.remove('md:cursor-grab')
      element.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      element.removeEventListener('click', handleClick, true)
    }
  }, [])

  return (
    <div ref={containerRef} className="min-w-0">
      {children}
    </div>
  )
}
