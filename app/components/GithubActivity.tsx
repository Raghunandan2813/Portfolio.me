"use client";

import { useEffect, useState } from "react";

type ActivityDay = { date: string; count: number; level: number };
type ActivityResponse = {
  days: ActivityDay[];
  activeDays: number;
  totalContributions: number;
};

/** Empty year-long grid rendered until the real data arrives. */
function fallbackDays() {
  const result: ActivityDay[] = [];
  const today = new Date();
  for (let offset = 364; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    result.push({ date: date.toISOString().slice(0, 10), count: 0, level: 0 });
  }
  return result;
}

export function GithubActivity() {
  const [activity, setActivity] = useState<ActivityResponse>({
    days: fallbackDays(),
    activeDays: 0,
    totalContributions: 0,
  });

  useEffect(() => {
    fetch("/api/github-activity")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: ActivityResponse) => setActivity(data))
      .catch(() => undefined);
  }, []);

  return (
    <div className="contribution-card">
      <div className="contribution-top">
        <div>
          <span className="eyebrow">GitHub contribution</span>
          <h3>Contributions in the last year</h3>
        </div>
        <div className="contribution-stats">
          <span><strong>{activity.activeDays}</strong> active days</span>
          <span><strong>{activity.totalContributions}</strong> contributions</span>
        </div>
      </div>
      <div className="heatmap-scroll">
      <div
        className="heatmap"
        role="img"
        aria-label={`GitHub contributions over the last year: ${activity.totalContributions} contributions across ${activity.activeDays} active days`}
      >
        {activity.days.map((day) => (
          <i
            className={`level-${day.level}`}
            title={`${day.date}: ${day.count} contributions`}
            key={day.date}
          />
        ))}
      </div>
      </div>
      <div className="heatmap-legend">
        <span>A year ago</span>
        <span>
          Less <i /><i className="level-1" /><i className="level-2" />
          <i className="level-3" /><i className="level-4" /> More
        </span>
      </div>
    </div>
  );
}
