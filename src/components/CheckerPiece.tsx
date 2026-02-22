import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Piece } from '../types'

interface CheckerPieceProps {
  piece: Piece
  isSelected: boolean
  isCurrentTurn: boolean
  onClick: () => void
}

export default function CheckerPiece({
  piece,
  isSelected,
  isCurrentTurn,
  onClick
}: CheckerPieceProps) {
  const meshRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  const x = (piece.position.col - 3.5) * 0.6
  const z = (piece.position.row - 3.5) * 0.6

  const targetY = isSelected ? 0.45 : hovered && isCurrentTurn ? 0.25 : 0.18
  const targetScale = isSelected ? 1.1 : hovered && isCurrentTurn ? 1.05 : 1

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        delta * 12
      )

      const currentScale = meshRef.current.scale.x
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 12)
      meshRef.current.scale.setScalar(newScale)

      if (isSelected) {
        meshRef.current.rotation.y += delta * 1.5
      }
    }
  })

  const pieceColor = piece.color === 'red' ? '#B85C38' : '#2D2D2D'
  const accentColor = piece.color === 'red' ? '#D4724A' : '#404040'

  return (
    <group
      ref={meshRef}
      position={[x, 0.18, z]}
      onClick={(e) => {
        e.stopPropagation()
        if (isCurrentTurn) onClick()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main piece body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.12, 32]} />
        <meshStandardMaterial
          color={pieceColor}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Top surface with groove */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 32]} />
        <meshStandardMaterial
          color={accentColor}
          roughness={0.5}
          metalness={0.15}
        />
      </mesh>

      {/* Inner circle detail */}
      <mesh position={[0, 0.071, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.01, 32]} />
        <meshStandardMaterial
          color={pieceColor}
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>

      {/* King crown */}
      {piece.isKing && (
        <group position={[0, 0.12, 0]}>
          {/* Crown base */}
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.08, 6]} />
            <meshStandardMaterial
              color="#C9A227"
              roughness={0.25}
              metalness={0.8}
            />
          </mesh>
          {/* Crown points */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i / 6) * Math.PI * 2
            const px = Math.cos(angle) * 0.1
            const pz = Math.sin(angle) * 0.1
            return (
              <mesh key={i} position={[px, 0.06, pz]} castShadow>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial
                  color="#C9A227"
                  roughness={0.25}
                  metalness={0.8}
                />
              </mesh>
            )
          })}
        </group>
      )}

      {/* Selection glow ring */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.35, 32]} />
          <meshBasicMaterial
            color="#C9A227"
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Hover indicator for current turn */}
      {hovered && isCurrentTurn && !isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.26, 0.3, 32]} />
          <meshBasicMaterial
            color="#C9A227"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  )
}
