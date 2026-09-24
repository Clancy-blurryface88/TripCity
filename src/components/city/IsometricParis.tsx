interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
  roof: string;
  wall: string;
}

const buildings: Building[] = [
  { x: 222, y: 486, w: 34, h: 38, roof: "#ec9797", wall: "#fdf1e6" },
  { x: 258, y: 470, w: 30, h: 46, roof: "#8fb8d9", wall: "#fef8ee" },
  { x: 194, y: 480, w: 28, h: 40, roof: "#ecc887", wall: "#f9efe2" },
  { x: 244, y: 508, w: 26, h: 32, roof: "#a3d6a1", wall: "#fdf1e6" },
];

function IsoBuilding({ x, y, w, h, roof, wall }: Building) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={wall} stroke="#00000012" />
      <rect x={x + 5} y={y + h - 15} width={7} height={11} rx={1.5} fill="#c9a869" />
      <rect x={x + w - 12} y={y + h - 22} width={6} height={8} rx={1.5} fill="#a9c9e6" />
      <rect x={x + w / 2 - 3} y={y + h - 22} width={6} height={8} rx={1.5} fill="#a9c9e6" />
      <polygon points={`${x - 4},${y} ${x + w + 4},${y} ${x + w / 2},${y - 17}`} fill={roof} />
    </g>
  );
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-2} y={0} width={4} height={11} fill="#a5754a" />
      <circle cx={0} cy={-9} r={12} fill="#7fbf82" />
      <circle cx={-8} cy={-3} r={8} fill="#8fcb8f" />
      <circle cx={8} cy={-3} r={8} fill="#8fcb8f" />
    </g>
  );
}

function EiffelTower({ x, y }: { x: number; y: number }) {
  const metal = "#8a8272";
  const metalLight = "#aea587";
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#towerShadow)">
      {/* plaza the tower stands on */}
      <ellipse cx={0} cy={4} rx={44} ry={13} fill="#e7ddc3" opacity={0.7} />
      {/* legs forming the iconic base arch */}
      <path d="M -32 0 C -28 -24 -14 -32 -4 -50 L -2 -50 C -8 -28 -11 -14 -10 0 Z" fill={metal} />
      <path d="M 32 0 C 28 -24 14 -32 4 -50 L 2 -50 C 8 -28 11 -14 10 0 Z" fill={metal} />
      <path d="M -10 0 L -2 -50 L 2 -50 L 10 0 Z" fill={metalLight} />
      {/* first platform */}
      <rect x={-17} y={-53} width={34} height={5} rx={2} fill={metal} />
      {/* mid section */}
      <path d="M -13 -53 C -9 -74 -6 -84 -3 -94 L 3 -94 C 6 -84 9 -74 13 -53 Z" fill={metal} />
      <path d="M -3 -94 L -1 -53 L 1 -53 L 3 -94 Z" fill={metalLight} />
      {/* second platform */}
      <rect x={-9} y={-97} width={18} height={4} rx={1.5} fill={metal} />
      {/* spire */}
      <path d="M -6 -97 C -3 -112 -1.5 -122 0 -134 C 1.5 -122 3 -112 6 -97 Z" fill={metal} />
      <line x1={0} y1={-134} x2={0} y2={-143} stroke={metal} strokeWidth={1.6} />
    </g>
  );
}

export default function IsometricParis() {
  return (
    <svg
      viewBox="0 0 340 640"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="איור איזומטרי של פריז עם מגדל אייפל"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe3ff" />
          <stop offset="100%" stopColor="#eef8ff" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7cc2e6" />
          <stop offset="100%" stopColor="#4f9fca" />
        </linearGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1e3a5f" floodOpacity="0.18" />
        </filter>
        <filter id="towerShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.16" />
        </filter>
      </defs>

      <rect width="340" height="640" fill="url(#water)" />
      <rect width="340" height="230" fill="url(#sky)" />

      {/* clouds */}
      <g opacity={0.9}>
        <ellipse cx={62} cy={70} rx={28} ry={11} fill="#ffffff" />
        <ellipse cx={86} cy={64} rx={20} ry={13} fill="#ffffff" />
        <ellipse cx={268} cy={54} rx={24} ry={10} fill="#ffffff" />
        <ellipse cx={288} cy={48} rx={16} ry={11} fill="#ffffff" />
      </g>

      {/* water ripples visible around the island */}
      <g opacity={0.35} stroke="#ffffff" strokeWidth={2} strokeLinecap="round">
        <path d="M18 300 q14 -6 28 0 t28 0" fill="none" />
        <path d="M20 560 q14 -6 28 0 t28 0" fill="none" />
        <path d="M250 580 q14 -6 28 0 t28 0" fill="none" />
      </g>

      {/* floating island */}
      <g filter="url(#softShadow)">
        <path
          d="M 26 300 C 10 380 34 470 100 520 C 150 558 190 560 250 534 C 312 508 328 430 314 360 C 300 292 250 260 190 240 C 120 218 44 236 26 300 Z"
          fill="#c9b27f"
        />
        <path
          d="M 32 288 C 16 362 40 448 100 496 C 148 532 188 534 246 510 C 304 486 320 414 306 348 C 292 284 246 254 188 236 C 122 216 50 228 32 288 Z"
          fill="#8bc48a"
        />
      </g>

      {/* river through the island */}
      <path
        d="M 40 400 C 90 380 130 420 180 404 C 230 388 270 410 316 396"
        stroke="#69b6dd"
        strokeWidth={20}
        strokeLinecap="round"
        fill="none"
        opacity={0.92}
      />
      <path
        d="M 40 400 C 90 380 130 420 180 404 C 230 388 270 410 316 396"
        stroke="#ffffff"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
        strokeDasharray="1 11"
      />

      {/* landmark, standing further back on the island */}
      <EiffelTower x={168} y={430} />

      {/* park trees, foreground left */}
      <Tree x={92} y={500} />
      <Tree x={114} y={516} s={0.9} />
      <Tree x={70} y={518} s={0.8} />
      <Tree x={100} y={536} s={0.7} />

      {/* buildings cluster, foreground right */}
      {buildings.map((b) => (
        <IsoBuilding key={`${b.x}-${b.y}`} {...b} />
      ))}

      {/* little boat near the shore */}
      <g transform="translate(70 580)">
        <path d="M -16 0 C -16 8 16 8 16 0 L 12 -4 L -12 -4 Z" fill="#eef2f5" />
        <line x1={0} y1={-4} x2={0} y2={-17} stroke="#8a8272" strokeWidth={2} />
        <path d="M 0 -17 L 11 -7 L 0 -7 Z" fill="#f2a15a" />
      </g>
    </svg>
  );
}
