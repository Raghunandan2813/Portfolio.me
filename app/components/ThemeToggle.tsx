"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./Icons";

/** Never resubscribes; the value only differs between server and client. */
const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // The server cannot know the visitor's theme, so the icon is only correct
  // after hydration. useSyncExternalStore gives `false` during SSR and `true`
  // on the client without a setState-in-effect, which is both the React-blessed
  // form and what keeps the hydration output identical.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return <button className="theme-toggle" aria-label="Toggle colour theme" type="button" />;
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ display: "grid", placeItems: "center" }}
        >
          {isDark ? <MoonIcon /> : <SunIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
