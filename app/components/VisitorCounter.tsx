"use client";

import { useEffect, useState } from "react";

export function VisitorCounter() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/visits", { method: "POST", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { totalViews: number | null }) => setViews(data.totalViews))
      .catch(() => setViews(null));

    return () => controller.abort();
  }, []);

  return (
    <div className="visitor-stat" aria-live="polite">
      <strong>{views === null ? "Live" : views.toLocaleString("en-IN")}</strong>
      <span>{views === 1 ? "Recorded portfolio visit" : "Recorded portfolio visits"}</span>
    </div>
  );
}
