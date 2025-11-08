import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath"; // A helper for smooth animations

/**
 * This is your 3D Streetlight Component.
 * It takes 'brightness' (0-255) and 'motion' (bool) as props.
 */
export default function StreetlightModel({ position, brightness = 0, motion = false }) {
  const lightRef = useRef(); // A ref to the light-bulb part of the model

  // This hook runs on every single frame (like 60fps)
  useFrame((state, delta) => {
    if (!lightRef.current) return;

    // 1. Calculate the desired light properties
    const normalizedBrightness = brightness / 255; // 0.0 to 1.0
    const intensity = normalizedBrightness > 0.1 ? normalizedBrightness * 2 : 0;
    
    // 2. Determine color (dim gray or bright yellow)
    const targetColor = intensity > 0.1 ? "#facc15" : "#374151";

    // 3. Animate the light's intensity, color, and motion pulse
    easing.damp(lightRef.current.material, "intensity", intensity, 0.2, delta);
    easing.dampC(lightRef.current.material.color, targetColor, 0.2, delta);

    if (motion && intensity > 0) {
      // Create a pulsing effect for motion
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5; // 0 to 1
      lightRef.current.material.intensity = intensity + pulse * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* The Pole */}
      <mesh rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshStandardMaterial color="#57534e" />
      </mesh>
      {/* The Arm */}
      <mesh position={[0.4, 0.65, 0]} rotation={[0, 0, 1.3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.75, 8]} />
        <meshStandardMaterial color="#57534e" />
      </mesh>
      
      {/* The Light Bulb - This is the part that glows */}
      <mesh ref={lightRef} position={[0.7, 0.45, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        {/* This emissive material will GLOW. We start it dim. */}
        <meshBasicMaterial color="#374151" intensity={0} />
      </mesh>
      
      {/* This is the actual 'light' that casts on the ground */}
      <pointLight 
        position={[0.7, 0.4, 0]} 
        intensity={brightness / 255 * 3} // Match light to brightness
        color="#facc15" 
        distance={5}
        decay={2}
      />
    </group>
  );
}