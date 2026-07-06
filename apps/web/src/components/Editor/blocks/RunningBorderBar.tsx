// =====================================
// ⬢ Running Border Bar
// =====================================
// Sweeping progress indicator that rides along a block's top border while
// it is running. Meant to be dropped as the first child of the block's
// outer bordered wrapper (which must be `position: relative` and sized to
// the card, e.g. `border-[1.5px] rounded-2xl`).
export function RunningBorderBar({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <>
      {/* Inject keyframes once — Tailwind can't do this */}
      <style>{`
        @keyframes block-running-sweep {
          0%   { left: -40%; }
          100% { left: 100%; }
        }
        .block-running-bar {
          background: linear-gradient(
            90deg,
            transparent 0%,
            #a308f0 50%,
            transparent 100%
          );
          animation: block-running-sweep 1.2s ease-in-out infinite;
        }
      `}</style>
      <div
        className="pointer-events-none absolute -inset-[1.5px] z-20 overflow-hidden rounded-2xl"
        aria-hidden="true"
      >
        <div className="block-running-bar absolute left-0 top-0 h-[1.5px] w-2/5 rounded-full" />
      </div>
    </>
  );
}
