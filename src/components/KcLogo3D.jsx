import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import gsap from 'gsap'
import logoImg from '../../images/kc-logo.svg'
import './KcLogo3D.css'

// Same paths as images/kc-logo.svg, extruded into a 3D mark.
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="660 108 884 568">
  <path d="M703 115 H773 Q808 115 808 150 V408 L1003 237 H1083 Q1120 237 1110 266 Q1106 274 1098 282 L950 425 L1093 622 Q1112 650 1086 663 H975 Q955 663 943 646 L840 497 Q828 487 818 499 L808 512 V628 Q808 663 773 663 H703 Q668 663 668 628 V150 Q668 115 703 115 Z"/>
  <path d="M1510 355 Q1522 388 1490 388 H1445 Q1425 388 1412 372 A125 117 0 1 0 1410 510 Q1424 490 1446 490 H1492 Q1526 490 1514 525 A236 223 0 1 1 1510 355 Z"/>
</svg>`

// The canvas is this many times bigger than the logo's box (and centred on
// it) so the sway never clips. The box itself keeps the flat logo's exact
// size, so nothing around it moves.
const CANVAS_SCALE = 1.3

export default function KcLogo3D({ className = '' }) {
  const hostRef = useRef(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setFallback(true)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0, 0, 10)

    scene.add(new THREE.HemisphereLight(0xfff4e6, 0x3a1410, 2.2))
    const key = new THREE.DirectionalLight(0xffffff, 2.6)
    key.position.set(3, 5, 6)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xffc9a8, 1.4)
    rim.position.set(-5, 2, -4)
    scene.add(rim)

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x4d0c12,
      roughness: 0.32,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
    })

    const logo = new THREE.Group()
    const inner = new THREE.Group()
    new SVGLoader().parse(LOGO_SVG).paths.forEach((p) => {
      SVGLoader.createShapes(p).forEach((shape) => {
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: 110,
          bevelEnabled: true,
          bevelThickness: 14,
          bevelSize: 9,
          bevelSegments: 6,
          curveSegments: 48,
        })
        inner.add(new THREE.Mesh(geo, material))
      })
    })

    // Centre the mark and flip SVG's downward y-axis
    const centre = new THREE.Box3().setFromObject(inner).getCenter(new THREE.Vector3())
    inner.children.forEach((m) => m.geometry.translate(-centre.x, -centre.y, -centre.z))
    inner.scale.set(1, -1, 1)
    logo.add(inner)
    scene.add(logo)

    // Fit the 884-unit-wide mark so it fills 1 / CANVAS_SCALE of the canvas width
    const VIEW_W = 884 * CANVAS_SCALE
    const fit = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      const halfH = VIEW_W / camera.aspect / 2
      camera.position.z = halfH / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) + 110
      camera.far = camera.position.z * 3
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    }
    const ro = new ResizeObserver(fit)
    ro.observe(host)
    fit()

    const render = () => renderer.render(scene, camera)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let idle = []
    if (reduce) {
      render()
    } else {
      // Gentle sway and float
      idle = [
        gsap.to(inner.rotation, { y: 0.28, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
        gsap.to(inner.position, { y: 18, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
      ]
      gsap.ticker.add(render)
    }

    return () => {
      idle.forEach((t) => t.kill())
      gsap.ticker.remove(render)
      ro.disconnect()
      inner.children.forEach((m) => m.geometry.dispose())
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  if (fallback) {
    return <img src={logoImg} alt="KeroColor" className={className} />
  }

  return (
    <span className={`kc-logo3d ${className}`} role="img" aria-label="KeroColor">
      <span className="kc-logo3d-canvas" ref={hostRef} />
    </span>
  )
}
