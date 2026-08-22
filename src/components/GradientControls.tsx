import { useState } from 'react'
import type { GradientParams } from './GradientMesh'

interface GradientControlsProps extends GradientParams {
  onChange: (patch: Partial<GradientParams>) => void
}

export function GradientControls({
  color1,
  color2,
  color3,
  color4,
  distortion,
  zoom,
  noise,
  onChange,
}: GradientControlsProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Stäng gradientinställningar' : 'Öppna gradientinställningar'}
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-transform hover:scale-105"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 13a7.6 7.6 0 0 0 .07-1 7.6 7.6 0 0 0-.07-1l2.03-1.58a.5.5 0 0 0 .12-.63l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.4.96a7.7 7.7 0 0 0-1.73-1l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54a7.7 7.7 0 0 0-1.73 1l-2.4-.96a.5.5 0 0 0-.6.22L2.73 9.79a.5.5 0 0 0 .12.63L4.88 12a7.6 7.6 0 0 0 0 2l-2.03 1.58a.5.5 0 0 0-.12.63l1.92 3.32a.5.5 0 0 0 .6.22l2.4-.96c.53.42 1.1.76 1.73 1l.36 2.54a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.54a7.7 7.7 0 0 0 1.73-1l2.4.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.63L19.4 13Z" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-20 flex w-56 flex-col gap-4 rounded-xl border border-white/15 bg-black/40 p-4 text-sm text-white backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <span>Färg 1</span>
            <input
              type="color"
              value={color1}
              onChange={(e) => onChange({ color1: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border border-white/20 bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Färg 2</span>
            <input
              type="color"
              value={color2}
              onChange={(e) => onChange({ color2: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border border-white/20 bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Färg 3</span>
            <input
              type="color"
              value={color3}
              onChange={(e) => onChange({ color3: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border border-white/20 bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Färg 4</span>
            <input
              type="color"
              value={color4}
              onChange={(e) => onChange({ color4: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border border-white/20 bg-transparent"
            />
          </div>

          <label className="flex flex-col gap-1">
            <span>Förvrängning</span>
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={distortion}
              onChange={(e) => onChange({ distortion: Number(e.target.value) })}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>Skala</span>
            <input
              type="range"
              min={0.2}
              max={2.5}
              step={0.01}
              value={zoom}
              onChange={(e) => onChange({ zoom: Number(e.target.value) })}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>Brus</span>
            <input
              type="range"
              min={0}
              max={0.15}
              step={0.002}
              value={noise}
              onChange={(e) => onChange({ noise: Number(e.target.value) })}
            />
          </label>
        </div>
      )}
    </>
  )
}
