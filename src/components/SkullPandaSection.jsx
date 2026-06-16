import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import './SkullPandaSection.css'

function SkullModel({ scale, position }) {
  const { scene } = useGLTF('/skullpanda.glb')
  const ref = useRef()

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.7
  })

  return (
    <group ref={ref} scale={scale} position={position}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

useGLTF.preload('/skullpanda.glb')

export default function SkullPandaSection() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 640
  )

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const modelScale = isMobile ? 1.8 : 2.6
  const modelPosition = isMobile ? [-0.4, 0, 0] : [-1.8, 0, 0]

  return (
    <section className="skull-section">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 42 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '130%' }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[4, 6, 4]} intensity={1.8} />
        <directionalLight position={[-3, 1, -2]} intensity={0.4} />
        <Suspense fallback={null}>
          <SkullModel scale={modelScale} position={modelPosition} />
        </Suspense>
      </Canvas>

      <div className="skull-search-wrap">
        <svg className="skull-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input className="skull-search-input" type="text" placeholder="search for a color" />
      </div>

      <p className="skull-tagline">
        <span>our defaults</span><br />
        <span>are red. search</span><br />
        <span>for more.</span>
      </p>
    </section>
  )
}
