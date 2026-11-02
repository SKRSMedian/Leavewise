import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Node component representing an employee
function EmployeeNode({
  position,
  color,
  scale = 1,
  pulsing = false,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  pulsing?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    t.current += delta;
    if (pulsing) {
      const s = scale * (1 + Math.sin(t.current * 2) * 0.08);
      meshRef.current.scale.setScalar(s);
    }
    meshRef.current.rotation.y += delta * 0.3;
    meshRef.current.rotation.x = Math.sin(t.current * 0.5) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[0.22, 0.22, 0.22]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.7}
        envMapIntensity={1}
      />
    </mesh>
  );
}

// Connection lines between nodes
function ConnectionLines({ nodes }: { nodes: [number, number, number][] }) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.45) continue; // sparse connections
        points.push(new THREE.Vector3(...nodes[i]));
        points.push(new THREE.Vector3(...nodes[j]));
      }
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [nodes]);

  useFrame((_, delta) => {
    if (lineRef.current) {
      (lineRef.current.material as THREE.LineBasicMaterial).opacity =
        0.15 + Math.sin(Date.now() * 0.001) * 0.05;
    }
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#748CAB" transparent opacity={0.18} />
    </lineSegments>
  );
}

// Floating leave request cube
function FloatingRequest({
  position,
  color,
  speed,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    t.current += delta * speed;
    meshRef.current.position.y = position[1] + Math.sin(t.current) * 0.4;
    meshRef.current.rotation.x += delta * 0.8;
    meshRef.current.rotation.z += delta * 0.5;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.12]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// Central decision engine structure
function DecisionEngine() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core */}
      <mesh>
        <icosahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial color="#3E5C76" roughness={0.1} metalness={0.9} wireframe={false} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <icosahedronGeometry args={[0.37, 1]} />
        <meshStandardMaterial color="#748CAB" transparent opacity={0.3} wireframe />
      </mesh>
      {/* Orbital ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.015, 8, 64]} />
        <meshStandardMaterial color="#748CAB" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.75, 0.01, 8, 64]} />
        <meshStandardMaterial color="#F0EBD8" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// Mouse parallax camera controller
function CameraController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useFrame(() => {
    target.current.x += (mouse.current.x * 0.8 - target.current.x) * 0.05;
    target.current.y += (-mouse.current.y * 0.5 - target.current.y) * 0.05;
    camera.position.x = target.current.x;
    camera.position.y = target.current.y + 0.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Main scene
function Scene() {
  const mainGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (mainGroupRef.current) {
      mainGroupRef.current.rotation.y += delta * 0.04;
    }
  });

  // Node positions in a structured architectural layout
  const nodePositions: [number, number, number][] = [
    // Ring 1 — inner employees
    [1.2, 0.2, 0], [-1.2, 0.2, 0], [0, 0.2, 1.2], [0, 0.2, -1.2],
    // Ring 2 — outer
    [1.8, -0.3, 0.8], [-1.8, -0.3, 0.8], [1.8, -0.3, -0.8], [-1.8, -0.3, -0.8],
    [0.8, 0.6, 1.8], [-0.8, 0.6, 1.8], [0.8, 0.6, -1.8], [-0.8, 0.6, -1.8],
    // Floor level
    [2.2, -0.8, 0], [-2.2, -0.8, 0], [0, -0.8, 2.2], [0, -0.8, -2.2],
  ];

  const floatingRequests: { pos: [number, number, number]; color: string; speed: number }[] = [
    { pos: [0.6, 1.2, 0.6], color: '#F0EBD8', speed: 0.8 },
    { pos: [-0.8, 1.4, -0.4], color: '#748CAB', speed: 1.1 },
    { pos: [1.0, 0.9, -1.0], color: '#F0EBD8', speed: 0.65 },
    { pos: [-1.2, 1.1, 0.8], color: '#748CAB', speed: 0.9 },
    { pos: [0.2, 1.5, -1.2], color: '#F0EBD8', speed: 0.75 },
  ];

  return (
    <group ref={mainGroupRef}>
      {/* Central decision engine */}
      <DecisionEngine />

      {/* Employee nodes */}
      {nodePositions.map((pos, i) => (
        <EmployeeNode
          key={i}
          position={pos}
          color={i < 4 ? '#3E5C76' : '#1D2D44'}
          scale={i < 4 ? 1 : 0.8}
          pulsing={i < 2}
        />
      ))}

      {/* Connections */}
      <ConnectionLines nodes={nodePositions} />

      {/* Floating requests */}
      {floatingRequests.map((r, i) => (
        <FloatingRequest key={i} position={r.pos} color={r.color} speed={r.speed} />
      ))}
    </group>
  );
}

export function HeroCanvas() {
  return (
    <div className="hero-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#F0EBD8" />
        <directionalLight position={[-5, -2, -5]} intensity={0.3} color="#3E5C76" />
        <pointLight position={[0, 0, 0]} intensity={2} color="#748CAB" distance={4} />

        <CameraController />
        <Scene />
      </Canvas>
    </div>
  );
}
