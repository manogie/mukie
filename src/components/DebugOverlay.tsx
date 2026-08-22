import { useEffect, useState } from 'react'

export function DebugOverlay() {
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('debug')) return

    const update = () => {
      const canvas = document.querySelector('canvas')
      const rect = canvas?.getBoundingClientRect()
      const root = document.getElementById('root')
      const rootRect = root?.getBoundingClientRect()
      const lines = [
        `window: ${window.innerWidth}x${window.innerHeight}`,
        `visualViewport: ${window.visualViewport?.width ?? '-'}x${window.visualViewport?.height ?? '-'} scale=${window.visualViewport?.scale ?? '-'}`,
        `docEl client: ${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
        `docEl scroll: ${document.documentElement.scrollWidth}x${document.documentElement.scrollHeight}`,
        `dpr: ${window.devicePixelRatio}`,
        `root rect: ${rootRect ? `${Math.round(rootRect.width)}x${Math.round(rootRect.height)} @${Math.round(rootRect.left)},${Math.round(rootRect.top)}` : '-'}`,
        `canvas rect: ${rect ? `${Math.round(rect.width)}x${Math.round(rect.height)} @${Math.round(rect.left)},${Math.round(rect.top)}` : '-'}`,
        `canvas attr: ${canvas?.width}x${canvas?.height}`,
        `UA: ${navigator.userAgent}`,
      ]
      setInfo(lines.join('\n'))
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    const interval = setInterval(update, 1000)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      clearInterval(interval)
    }
  }, [])

  if (!info) return null

  return (
    <pre className="fixed left-0 top-0 z-50 max-w-full whitespace-pre-wrap break-all bg-black/80 p-2 text-[10px] leading-tight text-lime-300">
      {info}
    </pre>
  )
}
