import React from "react";

// True continuous spin for a loading state — no hold/plateau.
// Rotates a full 360deg linearly and loops forever, so it never
// appears to pause. (The original [0,720,720] keyframe spec had
// a built-in 2s freeze in the back half of every cycle, which is
// what caused the "stopping" look.)

const styleSheet = `
@keyframes spin-continuous {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.spin-ring {
  animation: spin-continuous 1s linear infinite;
}
`;

interface RotatingGradientRingProps {
  size?: number;
}

export default function RotatingGradientRing({ size = 96 }: RotatingGradientRingProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white p-16">
      <style>{styleSheet}</style>
      <svg
        className="spin-ring"
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM2.08708 8C2.08708 11.2656 4.73438 13.9129 8 13.9129C11.2656 13.9129 13.9129 11.2656 13.9129 8C13.9129 4.73438 11.2656 2.08708 8 2.08708C4.73438 2.08708 2.08708 4.73438 2.08708 8Z"
          fill="url(#paint0_radial_5703_136935)"
        />
        <defs>
          <radialGradient
            id="paint0_radial_5703_136935"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(8.75 7.5) rotate(135) scale(9.54594 9.7989)"
          >
            <stop stopColor="#A308F0" />
            <stop offset="0.658654" stopColor="#7BFF42" />
            <stop offset="0.658754" stopColor="#B8B3FA" />
            <stop offset="0.745192" stopColor="#2DB2FF" />
            <stop offset="0.826923" stopColor="#FF0000" />
            <stop offset="0.908654" stopColor="#DED757" />
            <stop offset="1" stopColor="#A308F0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
