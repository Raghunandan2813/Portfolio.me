"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 720px)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/**
 * True on phone-width viewports.
 *
 * Used to strip horizontal travel out of the scroll animations. A full-width
 * card animating in from `x: 38px` sits 38px past the right edge for the
 * duration of the animation, which is what forces the page to scroll
 * sideways on a phone.
 *
 * Server snapshot is `false` so SSR renders the desktop variant and hydration
 * stays consistent; the first client render corrects it.
 */
export function useIsNarrow() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
