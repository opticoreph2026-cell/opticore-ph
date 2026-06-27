'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import { Color } from 'three';
import type { Mesh } from 'three';

function EnergyOrb() {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ pointer, viewport }) => {
    if (!meshRef.current) return;
    const x = (pointer.x * viewport.width) / 6;
    const y = (pointer.y * viewport.height) / 6;
    meshRef.current.position.x += (x - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (-y - meshRef.current.position.y) * 0.05;
    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <Float speed={0.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={1.8}>
        <torusKnotGeometry args={[1, 0.35, 180, 24]} />
        <MeshTransmissionMaterial
          background={new Color('#0A1628')}
          color="#2563EB"
          transmission={0.6}
          roughness={0.1}
          thickness={1.5}
          ior={1.5}
          distortionScale={0}
          temporalDistortion={0}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

export function ThreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
      <color attach="background" args={['transparent'] as unknown as [string]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} />
      <spotLight position={[-5, -5, -5]} angle={0.3} penumbra={1} intensity={1} />
      <EnergyOrb />
      <Environment preset="city" />
    </Canvas>
  );
}
