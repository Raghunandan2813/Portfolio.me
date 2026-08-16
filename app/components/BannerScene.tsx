/**
 * The banner landscape.
 *
 * Both scenes are always in the DOM and cross-faded by `[data-theme]` in CSS,
 * rather than swapped in JavaScript. That keeps the transition on the
 * compositor, works before hydration, and means no flash while React boots.
 *
 * Star positions come from a seeded PRNG evaluated at module scope, so the
 * server and the client generate byte-identical markup. `Math.random()` here
 * would produce a hydration mismatch on every load.
 */

function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  bright: boolean;
};

const stars: Star[] = (() => {
  const random = mulberry32(20260816);
  const out: Star[] = [];
  for (let i = 0; i < 96; i += 1) {
    out.push({
      left: Number((random() * 100).toFixed(3)),
      // Keep stars in the upper two-thirds so they sit above the ridgeline.
      top: Number((random() * 68).toFixed(3)),
      size: Number((random() * 2.1 + 1.1).toFixed(2)),
      delay: Number((random() * 4).toFixed(2)),
      duration: Number((random() * 2.6 + 1.8).toFixed(2)),
      bright: random() > 0.7,
    });
  }
  return out;
})();

/** Two shooting stars on long, offset loops so they feel occasional. */
const shootingStars = [
  { top: 14, left: 12, delay: 3, duration: 9 },
  { top: 26, left: 58, delay: 11, duration: 13 },
];

export function BannerScene() {
  return (
    <div className="banner-scene" aria-hidden="true">
      {/* ---------------------------------------------------------------- */}
      {/* NIGHT                                                             */}
      {/* ---------------------------------------------------------------- */}
      <div className="scene scene-night">
        <div className="stars">
          {stars.map((star, index) => (
            <i
              key={index}
              className={star.bright ? "star star-bright" : "star"}
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>

        {shootingStars.map((shot, index) => (
          <i
            key={index}
            className="shooting-star"
            style={{
              top: `${shot.top}%`,
              left: `${shot.left}%`,
              animationDelay: `${shot.delay}s`,
              animationDuration: `${shot.duration}s`,
            }}
          />
        ))}

        <div className="moon">
          <span className="moon-glow" />
          <span className="moon-body" />
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* DAY                                                               */}
      {/* ---------------------------------------------------------------- */}
      <div className="scene scene-day">
        <div className="sun">
          <span className="sun-rays" />
          <span className="sun-glow" />
          <span className="sun-body" />
        </div>
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* SHARED RIDGELINE — recoloured per theme, so one set of paths      */}
      {/* serves both scenes.                                               */}
      {/* ---------------------------------------------------------------- */}
      <svg
        className="ridges"
        viewBox="0 0 1200 240"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          className="ridge ridge-far"
          d="M0 176 L118 118 L196 152 L288 92 L394 150 L470 116 L566 166 L654 124 L742 158 L836 106 L928 154 L1024 120 L1108 160 L1200 130 L1200 240 L0 240 Z"
        />
        <path
          className="ridge ridge-near"
          d="M0 212 L96 168 L178 200 L268 150 L356 194 L446 160 L540 206 L628 170 L724 202 L812 164 L906 200 L1000 168 L1092 204 L1200 176 L1200 240 L0 240 Z"
        />
      </svg>
    </div>
  );
}
