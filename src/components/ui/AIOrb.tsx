import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3 } from 'three';

const AnimatedSphere = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Custom shader for gradient effect without glow
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      colorA: { value: new THREE.Color('#f0abfc') },
      colorB: { value: new THREE.Color('#c026d3') },
      colorC: { value: new THREE.Color('#6366f1') }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float time;

      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.x += sin(pos.y * 4.0 + time) * 0.05;
        pos.y += cos(pos.x * 4.0 + time) * 0.05;
        vPosition = pos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform vec3 colorC;
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        float noise = sin(vPosition.x * 10.0 + time) * 0.5 + 0.5;
        vec3 color = mix(colorA, colorB, vUv.y);
        color = mix(color, colorC, noise);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: true,
  });

  useFrame(({ clock, mouse }) => {
    if (!sphereRef.current || !materialRef.current) return;

    // Update shader time uniform
    materialRef.current.uniforms.time.value = clock.getElapsedTime() * 0.5; // Slower animation

    // Smooth rotation
    sphereRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    sphereRef.current.rotation.y += 0.0005;

    // Mouse interaction with smoother movement
    const target = new Vector3(
      (mouse.x * window.innerWidth) / 150,
      (mouse.y * window.innerHeight) / 150,
      0
    );
    sphereRef.current.position.lerp(target, 0.03);
  });

  return (
    <Sphere ref={sphereRef} args={[0.8, 64, 64]}>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </Sphere>
  );
};

const ParticleRing = () => {
  const particleCount = 100; // Reduced particle count
  const points = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 1.5 + Math.random() * 0.1;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      (Math.random() - 0.5) * 0.2
    );
  });

  const particleRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!particleRef.current) return;
    particleRef.current.rotation.z = clock.getElapsedTime() * 0.05;
    particleRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
  });

  return (
    <points ref={particleRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#f0abfc"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

const AIOrb: React.FC = () => {
  useEffect(() => {
    // Force hardware acceleration
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', {
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
      stencil: false
    });
    if (gl) gl.getExtension('WEBGL_lose_context');
  }, []);

  return (
    <div className="relative w-[300px] h-[300px] mx-auto">
      <Canvas
        className="relative z-10"
        dpr={Math.min(2, window.devicePixelRatio)}
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.7} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        <AnimatedSphere />
        <ParticleRing />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};

export default AIOrb;
