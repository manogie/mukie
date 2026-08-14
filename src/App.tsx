import { useState } from 'react'
import { GradientMesh, type GradientParams } from './components/GradientMesh'
import { GradientControls } from './components/GradientControls'

const DEFAULT_PARAMS: GradientParams = {
  color1: '#e2483a',
  color2: '#f3a93f',
  color3: '#1f6fd1',
  distortion: 1.6,
  scale: 1.4,
  noise: 0.05,
}

function App() {
  const [params, setParams] = useState<GradientParams>(DEFAULT_PARAMS)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <GradientMesh {...params} />
      <h1 className="relative z-10" style={{ color: '#ffffff' }}>
        Här var det text
      </h1>
      <GradientControls
        {...params}
        onChange={(patch) => setParams((prev) => ({ ...prev, ...patch }))}
      />
    </div>
  )
}

export default App
