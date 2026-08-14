import { useEffect, useRef } from 'react'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './gradientShader'

export interface GradientParams {
  color1: string
  color2: string
  color3: string
  distortion: number
  scale: number
  noise: number
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  return [r, g, b]
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
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
    const gl = canvas.getContext('webgl')
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

    const uResolution = gl.getUniformLocation(program, 'uResolution')
    const uMouse = gl.getUniformLocation(program, 'uMouse')
    const uMouseInfluence = gl.getUniformLocation(program, 'uMouseInfluence')
    const uColor1 = gl.getUniformLocation(program, 'uColor1')
    const uColor2 = gl.getUniformLocation(program, 'uColor2')
    const uColor3 = gl.getUniformLocation(program, 'uColor3')
    const uDistortion = gl.getUniformLocation(program, 'uDistortion')
    const uScale = gl.getUniformLocation(program, 'uScale')
    const uNoiseAmt = gl.getUniformLocation(program, 'uNoiseAmt')

    let width = 0
    let height = 0
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)

    const resize = () => {
      width = Math.floor(window.innerWidth * pixelRatio)
      height = Math.floor(window.innerHeight * pixelRatio)
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
    }
    resize()
    window.addEventListener('resize', resize)

    const mouse = { x: 0.5, y: 0.5 }
    const targetMouse = { x: 0.5, y: 0.5 }
    let influenceTarget = 0
    let influence = 0
    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX / window.innerWidth
      targetMouse.y = 1 - e.clientY / window.innerHeight
      influenceTarget = 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    let frame: number

    const render = () => {
      const p = paramsRef.current
      mouse.x += (targetMouse.x - mouse.x) * 0.08
      mouse.y += (targetMouse.y - mouse.y) * 0.08
      influence += (influenceTarget - influence) * 0.08

      gl.uniform2f(uResolution, width, height)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uMouseInfluence, influence)
      gl.uniform3fv(uColor1, hexToRgb(p.color1))
      gl.uniform3fv(uColor2, hexToRgb(p.color2))
      gl.uniform3fv(uColor3, hexToRgb(p.color3))
      gl.uniform1f(uDistortion, p.distortion)
      gl.uniform1f(uScale, p.scale)
      gl.uniform1f(uNoiseAmt, p.noise)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
