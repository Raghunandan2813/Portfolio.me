"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

/**
 * A flock that crosses the screen when the visitor switches from dark to light
 * — dawn breaking, birds taking off.
 *
 * The motion is composed from three nested transforms rather than one complex
 * path: an outer element travels left-to-right, a middle element rotates to
 * carry the bird around a circle, and the bird itself counter-rotates so it
 * always stays upright. The result is a looping, orbiting flight that plain
 * keyframes cannot express as readably.
 */

type Bird = {
  /** Vertical start, as a viewport percentage. */
  top: number;
  delay: number;
  duration: number;
  scale: number;
  /** Radius of the orbit loop, in pixels. */
  orbit: number;
  spin: number;
};

const flock: Bird[] = [
  { top: 12, delay: 0, duration: 7.5, scale: 1, orbit: 46, spin: 2.6 },
  { top: 18, delay: 0.35, duration: 8.2, scale: 0.78, orbit: 60, spin: 3.1 },
  { top: 8, delay: 0.7, duration: 7, scale: 0.62, orbit: 38, spin: 2.2 },
  { top: 24, delay: 1.05, duration: 8.8, scale: 0.85, orbit: 54, spin: 3.4 },
  { top: 15, delay: 1.5, duration: 7.8, scale: 0.55, orbit: 42, spin: 2.8 },
];

const FLIGHT_MS = 11000;

export function BirdFlight() {
  const { resolvedTheme } = useTheme();
  const [flying, setFlying] = useState(false);
  const previous = useRef<string | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const before = previous.current;
    previous.current = resolvedTheme;

    // Only on the dark -> light transition, and never on first paint (when
    // `before` is undefined because the theme has only just resolved).
    if (before !== "dark" || resolvedTheme !== "light") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setFlying(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlying(false), FLIGHT_MS);
  }, [resolvedTheme]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!flying) return null;

  return (
    <div className="bird-flight" aria-hidden="true">
      {flock.map((bird, index) => (
        <div
          key={index}
          className="bird-track"
          style={{
            top: `${bird.top}%`,
            animationDelay: `${bird.delay}s`,
            animationDuration: `${bird.duration}s`,
          }}
        >
          <div
            className="bird-orbit"
            style={{
              animationDuration: `${bird.spin}s`,
              ["--orbit" as string]: `${bird.orbit}px`,
            }}
          >
            <div className="bird" style={{ transform: `scale(${bird.scale})` }}>
              <svg viewBox="0 0 40 20" focusable="false">
                <path
                  className="wing wing-left"
                  d="M20 11 C15 3, 9 2, 2 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
                <path
                  className="wing wing-right"
                  d="M20 11 C25 3, 31 2, 38 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
