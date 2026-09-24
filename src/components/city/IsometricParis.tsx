interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
  roof: string;
  wall: string;
}

const buildings: Building[] = [
  { x: 240, y: 300, w: 34, h: 40, roof: "#e58a8a", wall: "#fbeee4" },
  { x: 272, y: 288, w: 28, h: 48, roof: "#8fb8d9", wall: "#fef6ec" },
  { x: 214, y: 292, w: 26, h: 42, roof: "#e7c07a", wall: "#f7ece0" },
  { x: 296, y: 310, w: 24, h: 34, roof: "#9dcf9b", wall: "#fbeee4" },
];

function IsoBuilding({ x, y, w, h, roof, wall }: Building) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={wall} stroke="#00000010" />
      <rect x={x + 5} y={y + h - 14} width={7} height={10} rx={1.5} fill="#c9a869" />
      <rect x={x + w - 12} y={y + h - 20} width={6} height={8} rx={1.5} fill="#a9c9e6" />
      <rect x={x + w / 2 - 3} y={y + h - 22} width={6} height={8} rx={1.5} fill="#a9c9e6" />
      <polygon
        points={`${x - 4},${y} ${x + w + 4},${y} ${x + w / 2},${y - 16}`}
        fill={roof}
      />
    </g>
  );
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-2} y={0} width={4} height={10} fill="#a5754a" />
      <circle cx={0} cy={-8} r={11} fill="#7fbf82" />
      <circle cx={-7} cy={-3} r={7} fill="#8fcb8f" />
      <circle cx={7} cy={-3} r={7} fill="#8fcb8f" />
    </g>
  );
}

function EiffelTower({ x, y }: { x: number; y: number }) {
  const metal = "#8a8272";
  const metalLight = "#b3ab98";
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#towerShadow)">
      {/* legs forming the iconic base arch */}
      <path
        d="M -46 0 C -40 -34 -20 -46 -6 -70 L -3 -70 C -12 -40 -16 -20 -14 0 Z"
        fill={metal}
      />
      <path
        d="M 46 0 C 40 -34 20 -46 6 -70 L 3 -70 C 12 -40 16 -20 14 0 Z"
        fill={metal}
      />
      <path d="M -14 0 L -3 -70 L 3 -70 L 14 0 Z" fill={metalLight} />
      {/* first platform */}
      <rect x={-24} y={-74} width={48} height={7} rx={2} fill={metal} />
      {/* mid section */}
      <path d="M -18 -74 C -12 -104 -8 -118 -4 -132 L 4 -132 C 8 -118 12 -104 18 -74 Z" fill={metal} />
      <path d="M -4 -132 L -1.5 -74 L 1.5 -74 L 4 -132 Z" fill={metalLight} />
      {/* second platform */}
      <rect x={-13} y={-136} width={26} height={5} rx={2} fill={metal} />
      {/* spire */}
      <path d="M -8 -136 C -4 -158 -2 -172 0 -190 C 2 -172 4 -158 8 -136 Z" fill={metal} />
      <line x1={0} y1={-190} x2={0} y2={-202} stroke={metal} strokeWidth={2} />
    </g>
  );
}

export default function IsometricParis() {
  return (
    <svg
      viewBox="0 0 375 460"
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
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1e3a5f" floodOpacity="0.18" />
        </filter>
        <filter id="towerShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      <rect width="375" height="460" fill="url(#sky)" />

      {/* clouds */}
      <g opacity={0.9}>
        <ellipse cx={70} cy={70} rx={30} ry={12} fill="#ffffff" />
        <ellipse cx={95} cy={64} rx={22} ry={14} fill="#ffffff" />
        <ellipse cx={300} cy={54} rx={26} ry={11} fill="#ffffff" />
        <ellipse cx={322} cy={48} rx={18} ry={12} fill="#ffffff" />
      </g>

      {/* water */}
      <rect x={0} y={330} width={375} height={130} fill="url(#water)" />
      <g opacity={0.35} stroke="#ffffff" strokeWidth={2} strokeLinecap="round">
        <path d="M20 350 q15 -6 30 0 t30 0" fill="none" />
        <path d="M280 370 q15 -6 30 0 t30 0" fill="none" />
        <path d="M120 410 q15 -6 30 0 t30 0" fill="none" />
      </g>

      {/* floating island */}
      <g filter="url(#softShadow)">
        <path
          d="M 40 250 C 30 300 70 340 140 342 C 190 344 220 356 270 348 C 330 340 350 300 336 262 C 322 224 270 214 220 206 C 160 197 60 205 40 250 Z"
          fill="#c9b27f"
        />
        <path
          d="M 44 236 C 34 280 72 316 140 318 C 188 320 218 330 266 322 C 322 314 340 278 328 244 C 316 210 268 200 220 194 C 164 186 62 194 44 236 Z"
          fill="#8bc48a"
        />
      </g>

      {/* river through the island */}
      <path
        d="M 60 230 C 110 210 150 250 200 236 C 250 222 280 246 320 234"
        stroke="#69b6dd"
        strokeWidth={16}
        strokeLinecap="round"
        fill="none"
        opacity={0.9}
      />
      <path
        d="M 60 230 C 110 210 150 250 200 236 C 250 222 280 246 320 234"
        stroke="#ffffff"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
        strokeDasharray="1 10"
      />

      {/* park trees */}
      <Tree x={95} y={300} />
      <Tree x={112} y={312} s={0.85} />
      <Tree x={80} y={314} s={0.75} />
      <Tree x={310} y={260} s={0.8} />
      <Tree x={296} y={274} s={0.7} />

      {/* buildings cluster */}
      {buildings.map((b) => (
        <IsoBuilding key={`${b.x}-${b.y}`} {...b} />
      ))}

      {/* landmark */}
      <EiffelTower x={185} y={305} />

      {/* little boat */}
      <g transform="translate(150 395)">
        <path d="M -16 0 C -16 8 16 8 16 0 L 12 -4 L -12 -4 Z" fill="#e6e6e6" />
        <line x1={0} y1={-4} x2={0} y2={-16} stroke="#8a8272" strokeWidth={2} />
        <path d="M 0 -16 L 10 -6 L 0 -6 Z" fill="#f2a15a" />
      </g>
    </svg>
  );
}
