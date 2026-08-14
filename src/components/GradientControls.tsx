import type { GradientParams } from './GradientMesh'

interface GradientControlsProps extends GradientParams {
  onChange: (patch: Partial<GradientParams>) => void
}

export function GradientControls({
  color1,
  color2,
  color3,
  distortion,
  scale,
  noise,
  onChange,
}: GradientControlsProps) {
  return (
    <div className="fixed bottom-4 right-4 z-20 flex w-56 flex-col gap-4 rounded-xl border border-white/15 bg-black/40 p-4 text-sm text-white backdrop-blur-md">
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

      <label className="flex flex-col gap-1">
        <span>Förvrängning</span>
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={distortion}
          onChange={(e) => onChange({ distortion: Number(e.target.value) })}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>Skala</span>
        <input
          type="range"
          min={0.3}
          max={4}
          step={0.01}
          value={scale}
          onChange={(e) => onChange({ scale: Number(e.target.value) })}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>Brus</span>
        <input
          type="range"
          min={0}
          max={0.3}
          step={0.005}
          value={noise}
          onChange={(e) => onChange({ noise: Number(e.target.value) })}
        />
      </label>
    </div>
  )
}
