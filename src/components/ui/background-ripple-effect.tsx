"use client";

export function BackgroundRippleEffect() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 11 }, (_, index) => (
        <span
          className="rippleRing"
          key={index}
          style={{
            width: `${180 + index * 120}px`,
            height: `${180 + index * 120}px`,
            animationDelay: `${index * 0.12}s`
          }}
        />
      ))}
    </div>
  );
}
