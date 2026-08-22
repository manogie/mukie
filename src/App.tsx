import { useState } from 'react'
import { GradientMesh, type GradientParams } from './components/GradientMesh'
import { GradientControls } from './components/GradientControls'

const DEFAULT_PARAMS: GradientParams = {
  color1: '#47afff',
  color2: '#5e68e8',
  color3: '#4d24ae',
  color4: '#3957c0',
  distortion: 5,
  zoom: 0.72,
  noise: 0.04,
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
