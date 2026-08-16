"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Scroll-snap carousel.
 *
 * Built on native overflow scrolling rather than a transform-driven track, so
 * touch swipe, momentum, keyboard scrolling and the scrollbar all come from the
 * browser and behave correctly on every device. The buttons and dots drive
 * `scrollTo`; they are a convenience over the scroll container, not the
 * mechanism.
 *
 * Controls are hidden for a single slide, so a section that only sometimes
 * overflows does not sprout dead arrows.
 */
export function Carousel({
  children,
  label,
  /** Milliseconds between automatic advances. 0 disables it. */
  autoPlay = 0,
}: {
  children: ReactNode[];
  label: string;
  autoPlay?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const count = children.length;
  const many = count > 1;

  const scrollTo = useCallback(
    (next: number) => {
      const track = trackRef.current;
      if (!track) return;
      const target = ((next % count) + count) % count; // wrap both directions
      track.scrollTo({
        left: track.clientWidth * target,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [count, reduceMotion],
  );

  // Derive the active slide from scroll position rather than tracking it
  // separately, so dragging by hand stays in sync with the dots.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!track) return;
        const width = track.clientWidth || 1;
        setIndex(Math.round(track.scrollLeft / width));
      });
    }

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Only advance while the carousel is actually on screen. Without this it
  // would cycle the whole time the page is open, so by the time you scrolled
  // down you would arrive mid-sequence at an arbitrary slide.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Auto-advance, suspended while the user is interacting and disabled
  // entirely when the OS asks for reduced motion.
  useEffect(() => {
    if (!autoPlay || !many || paused || reduceMotion || !visible) return;
    const timer = setInterval(() => scrollTo(index + 1), autoPlay);
    return () => clearInterval(timer);
  }, [autoPlay, many, paused, reduceMotion, visible, index, scrollTo]);

  return (
    <div
      className="carousel"
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="carousel-track" ref={trackRef}>
        {children.map((child, i) => (
          <div
            className="carousel-slide"
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            // Off-screen slides are scrolled away, not hidden, so they stay
            // reachable by keyboard; aria-hidden would lie about that.
          >
            {child}
          </div>
        ))}
      </div>

      {many && (
        <div className="carousel-controls">
          <button type="button" onClick={() => scrollTo(index - 1)} aria-label="Previous">
            ‹
          </button>
          <div className="carousel-dots">
            {children.map((_, i) => (
              <button
                type="button"
                key={i}
                className={i === index ? "is-on" : ""}
                aria-label={`Go to ${i + 1} of ${count}`}
                aria-current={i === index}
                onClick={() => scrollTo(i)}
              />
            ))}
          </div>
          <button type="button" onClick={() => scrollTo(index + 1)} aria-label="Next">
            ›
          </button>
        </div>
      )}
    </div>
  );
}
