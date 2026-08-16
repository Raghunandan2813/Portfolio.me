"use client";

import { useEffect, useRef } from "react";

/**
 * A cat that stalks the cursor.
 *
 * Deliberately *not* a follower that snaps to the pointer. It behaves like an
 * animal: it accelerates and decelerates, keeps a personal-space radius rather
 * than sitting on top of the cursor, only bothers to move once the cursor has
 * drifted far enough away, pauses mid-chase the way a real cat stops to
 * reassess, and sits down when it has been still for a while.
 *
 * Position updates are written straight to the DOM inside a rAF loop. Holding
 * the coordinates in React state would re-render the tree sixty times a second
 * for no benefit.
 */

/** How close the cat wants to end up next to the cursor. */
const KEEP_DISTANCE = 58;
/** It ignores the cursor until it is at least this far away. */
const CHASE_THRESHOLD = 104;
/** Beyond this it breaks into a run. */
const RUN_THRESHOLD = 330;
const MAX_WALK = 2.5;
const MAX_RUN = 6.2;
const ACCEL = 0.5;
const FRICTION = 0.82;
/** Idle for this long and it sits down. */
const SIT_AFTER_MS = 2400;

export function CursorCat() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!root || !body) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Touch devices have no hovering cursor, so the cat chases taps and drags
    // instead. `pointermove` only fires mid-drag on touch, which is why
    // `pointerdown` is also needed for a plain tap to register.
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    // Start beside the banner action icons, as though it had been sitting
    // there all along. Falls back to the top-right if the banner is absent.
    let x = window.innerWidth - 150;
    let y = 130;
    const anchor = document.querySelector(".profile-actions");
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      x = rect.left - 54;
      y = rect.top + rect.height / 2;
    }

    let velocityX = 0;
    let velocityY = 0;
    let facing = -1;
    let pointerX = x;
    let pointerY = y;
    let pointerSeen = false;
    let restUntil = 0;
    let stillSince = performance.now();
    let currentState = "";
    let frame = 0;

    function setState(next: string) {
      if (next === currentState) return;
      currentState = next;
      body!.className = `cat-body ${next}`;
    }

    function onPointerMove(event: PointerEvent) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerSeen = true;
    }

    // On touch, hold the target after the finger lifts so the cat finishes its
    // walk to where you tapped rather than freezing mid-stride.
    function onPointerDown(event: PointerEvent) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerSeen = true;
    }

    // Cursor gone: settle rather than chase the last known position forever.
    // Not applied on touch, where "leaving" is just lifting a finger.
    function onPointerLeave() {
      if (!isTouch) pointerSeen = false;
    }

    function step() {
      const now = performance.now();
      const deltaX = pointerX - x;
      const deltaY = pointerY - y;
      const distance = Math.hypot(deltaX, deltaY) || 1;

      const resting = now < restUntil;
      const shouldChase = pointerSeen && !resting && distance > CHASE_THRESHOLD;

      if (shouldChase) {
        // Aim for a point short of the cursor so it never overlaps it.
        const targetX = pointerX - (deltaX / distance) * KEEP_DISTANCE;
        const targetY = pointerY - (deltaY / distance) * KEEP_DISTANCE;
        const toTargetX = targetX - x;
        const toTargetY = targetY - y;
        const toTarget = Math.hypot(toTargetX, toTargetY) || 1;

        const running = distance > RUN_THRESHOLD;
        const maxSpeed = running ? MAX_RUN : MAX_WALK;

        velocityX += (toTargetX / toTarget) * ACCEL;
        velocityY += (toTargetY / toTarget) * ACCEL;

        const speed = Math.hypot(velocityX, velocityY);
        if (speed > maxSpeed) {
          velocityX = (velocityX / speed) * maxSpeed;
          velocityY = (velocityY / speed) * maxSpeed;
        }

        setState(running ? "is-running" : "is-walking");
        stillSince = now;

        // Occasionally stop and look around, like a real cat does.
        if (Math.random() < 0.0035) {
          restUntil = now + 380 + Math.random() * 900;
        }
      } else {
        velocityX *= FRICTION;
        velocityY *= FRICTION;
        if (Math.hypot(velocityX, velocityY) < 0.06) {
          velocityX = 0;
          velocityY = 0;
          setState(now - stillSince > SIT_AFTER_MS ? "is-sitting" : "is-idle");
        } else {
          setState("is-walking");
          stillSince = now;
        }
      }

      x += velocityX;
      y += velocityY;

      // Keep it on screen.
      x = Math.min(Math.max(x, 26), window.innerWidth - 26);
      y = Math.min(Math.max(y, 26), window.innerHeight - 26);

      // Only flip past a small threshold, so it does not jitter when nudging.
      if (velocityX > 0.35) facing = 1;
      else if (velocityX < -0.35) facing = -1;

      root!.style.transform = `translate3d(${x - 28}px, ${y - 22}px, 0)`;
      body!.style.transform = `scaleX(${facing})`;

      frame = requestAnimationFrame(step);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="cursor-cat" ref={rootRef} aria-hidden="true">
      <div className="cat-body is-idle" ref={bodyRef}>
        <svg viewBox="0 0 56 44" focusable="false">
          {/* tail */}
          <path
            className="cat-tail"
            d="M12 27 C4 26, 2 18, 7 13"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* back legs */}
          <g className="cat-leg cat-leg-bl">
            <rect x="16" y="28" width="3.6" height="11" rx="1.8" />
          </g>
          <g className="cat-leg cat-leg-br">
            <rect x="21" y="28" width="3.6" height="11" rx="1.8" />
          </g>

          {/* body */}
          <ellipse className="cat-torso" cx="26" cy="25" rx="14" ry="8.5" />

          {/* front legs */}
          <g className="cat-leg cat-leg-fl">
            <rect x="31" y="28" width="3.6" height="11" rx="1.8" />
          </g>
          <g className="cat-leg cat-leg-fr">
            <rect x="36" y="28" width="3.6" height="11" rx="1.8" />
          </g>

          {/* head */}
          <g className="cat-head">
            <circle cx="42" cy="17" r="8.4" />
            <path d="M35.5 11.5 L35 5 L40.5 8.6 Z" />
            <path d="M48.5 11.5 L49 5 L43.5 8.6 Z" />
            <circle className="cat-eye" cx="39.4" cy="17" r="1.25" />
            <circle className="cat-eye" cx="45.2" cy="17" r="1.25" />
            <path
              className="cat-whiskers"
              d="M46 20 L52 19 M46 21.4 L52 22.2"
              stroke="currentColor"
              strokeWidth="0.7"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
