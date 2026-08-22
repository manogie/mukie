import { useEffect, useRef } from 'react'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './gradientShader'

export interface GradientParams {
  color1: string
  color2: string
  color3: string
  color4: string
  distortion: number
  zoom: number
  noise: number
}

// static layout taken from monopo.london's own hero gradient, so the
// composition matches theirs — only color/distortion/zoom/noise are tunable.
const COLOR_SIZE = 0.58
const COLOR_SPACING = 0.52
const COLOR_ROTATION = -0.381592653589793
const COLOR_SPREAD = 4.52
const COLOR_OFFSET: [number, number] = [-0.7741174697875977, -0.20644775390624992]
const TRANSFORM_POSITION: [number, number] = [-0.2816110610961914, -0.43914794921875]
const SPACING = 4.27
const NOISE_SIZE = 0.5

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  return [r, g, b]
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Kunde inte skapa shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader-kompilering misslyckades: ${info}`)
  }
  return shader
}

export function GradientMesh(params: GradientParams) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const paramsRef = useRef(params)
  paramsRef.current = params

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2')
    if (!gl) return

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program-länkning misslyckades:', gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const aPosition = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    const uViewportSize = gl.getUniformLocation(program, 'uViewportSize')
    const uColor1 = gl.getUniformLocation(program, 'uColor1')
    const uColor2 = gl.getUniformLocation(program, 'uColor2')
    const uColor3 = gl.getUniformLocation(program, 'uColor3')
    const uColor4 = gl.getUniformLocation(program, 'uColor4')
    const uColorSize = gl.getUniformLocation(program, 'uColorSize')
    const uColorSpacing = gl.getUniformLocation(program, 'uColorSpacing')
    const uColorRotation = gl.getUniformLocation(program, 'uColorRotation')
    const uColorSpread = gl.getUniformLocation(program, 'uColorSpread')
    const uDisplacement = gl.getUniformLocation(program, 'uDisplacement')
    const uZoom = gl.getUniformLocation(program, 'uZoom')
    const uSpacing = gl.getUniformLocation(program, 'uSpacing')
    const uSeed = gl.getUniformLocation(program, 'uSeed')
    const uColorOffset = gl.getUniformLocation(program, 'uColorOffset')
    const uTransformPosition = gl.getUniformLocation(program, 'uTransformPosition')
    const uNoiseSize = gl.getUniformLocation(program, 'uNoiseSize')
    const uNoiseIntensity = gl.getUniformLocation(program, 'uNoiseIntensity')

    let width = 0
    let height = 0
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)

    const resize = () => {
      const cssWidth = window.innerWidth
      const cssHeight = window.innerHeight
      width = Math.floor(cssWidth * pixelRatio)
      height = Math.floor(cssHeight * pixelRatio)
      canvas.width = width
      canvas.height = height
      // set the CSS box size explicitly in pixels rather than relying on
      // percentage sizing — iOS Safari can miscompute a fixed-position
      // element's percentage width/height right after an orientation change.
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`
      gl.viewport(0, 0, width, height)
    }
    resize()
    window.addEventListener('resize', resize)
    // iOS Safari can briefly report stale window dimensions right when
    // orientationchange fires, before layout has settled — re-check shortly after.
    const handleOrientationChange = () => {
      resize()
      setTimeout(resize, 150)
      setTimeout(resize, 400)
    }
    window.addEventListener('orientationchange', handleOrientationChange)

    // matches monopo.london's own mapping: pointer x (0..1) drives the
    // noise displacement strength, pointer y (0..1) drives which slice of
    // the 3D noise field is sampled (the "seed"). pointermove covers mouse,
    // touch-drag and pen alike, so it works on phones/tablets too.
    let hasMoved = false
    let targetForce = 0
    let targetSeed = 0
    let force = 0
    let seed = 0

    const handlePointerMove = (e: PointerEvent) => {
      hasMoved = true
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      targetForce = x * paramsRef.current.distortion
      targetSeed = -1 + 2 * y
    }
    window.addEventListener('pointermove', handlePointerMove)

    let frame: number

    const render = () => {
      force += (targetForce - force) * 0.1
      seed += (targetSeed - seed) * 0.1

      const p = paramsRef.current

      gl.uniform2f(uViewportSize, width, height)
      gl.uniform3fv(uColor1, hexToRgb(p.color1))
      gl.uniform3fv(uColor2, hexToRgb(p.color2))
      gl.uniform3fv(uColor3, hexToRgb(p.color3))
      gl.uniform3fv(uColor4, hexToRgb(p.color4))
      gl.uniform1f(uColorSize, COLOR_SIZE)
      gl.uniform1f(uColorSpacing, COLOR_SPACING)
      gl.uniform1f(uColorRotation, COLOR_ROTATION)
      gl.uniform1f(uColorSpread, COLOR_SPREAD)
      gl.uniform1f(uDisplacement, hasMoved ? force : 0)
      gl.uniform1f(uZoom, p.zoom)
      gl.uniform1f(uSpacing, SPACING)
      gl.uniform1f(uSeed, hasMoved ? seed : 0)
      gl.uniform2f(uColorOffset, COLOR_OFFSET[0], COLOR_OFFSET[1])
      gl.uniform2f(uTransformPosition, TRANSFORM_POSITION[0], TRANSFORM_POSITION[1])
      gl.uniform1f(uNoiseSize, NOISE_SIZE)
      gl.uniform1f(uNoiseIntensity, p.noise)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
