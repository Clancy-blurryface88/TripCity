/** Eiffel Tower, drawn front-facing on the isometric ground. Local coords: base centre = (0,0), up is -y. */
const HALF =
  'M -72 0 C -58 -34 -45 -64 -36 -92 L -40 -92 L -40 -103 L -25 -103 C -22 -130 -20 -155 -18 -178 L -22 -178 L -22 -187 L -12 -187 C -9 -226 -7 -256 -5 -282 L -8 -282 L -8 -293 L -3 -293 L -1.6 -334';

const SILHOUETTE = `${HALF} L 1.6 -334 L 3 -293 L 8 -293 L 8 -282 L 5 -282 C 7 -256 9 -226 12 -187 L 22 -187 L 22 -178 L 18 -178 C 20 -155 22 -130 25 -103 L 40 -103 L 40 -92 L 36 -92 C 45 -64 58 -34 72 0 Z`;
const ARCH = 'M -48 0 C -42 -38 -22 -62 0 -64 C 22 -62 42 -38 48 0 Z';
const WINDOW2 = 'M -15 -104 C -12 -128 -8 -148 0 -158 C 8 -148 12 -128 15 -104 Z';

export function EiffelTower({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} aria-label="מגדל אייפל" role="img">
      <defs>
        <linearGradient id="eiffel-body" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#b08560" />
          <stop offset="0.48" stopColor="#9a7050" />
          <stop offset="0.52" stopColor="#7e5a3f" />
          <stop offset="1" stopColor="#6a4a33" />
        </linearGradient>
        <pattern id="eiffel-lattice" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M0 0 L7 7 M7 0 L0 7" stroke="#4d3526" strokeWidth="0.9" opacity="0.55" />
        </pattern>
        <radialGradient id="eiffel-glow">
          <stop offset="0" stopColor="#fff6c9" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff6c9" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="6" cy="4" rx="92" ry="26" fill="#2d3b2a" opacity="0.18" />
      <path d={`${SILHOUETTE} ${ARCH} ${WINDOW2}`} fill="url(#eiffel-body)" fillRule="evenodd" />
      <path d={`${SILHOUETTE} ${ARCH} ${WINDOW2}`} fill="url(#eiffel-lattice)" fillRule="evenodd" />
      <path d={`${SILHOUETTE} ${ARCH} ${WINDOW2}`} fill="none" stroke="#553b29" strokeWidth="1.4" fillRule="evenodd" strokeLinejoin="round" />
      {/* platforms */}
      <rect x="-44" y="-106" width="88" height="8" rx="1.5" fill="#6a4a33" />
      <rect x="-44" y="-110" width="88" height="3" fill="#c9a27a" />
      <rect x="-25" y="-190" width="50" height="7" rx="1.5" fill="#6a4a33" />
      <rect x="-25" y="-193" width="50" height="2.5" fill="#c9a27a" />
      <rect x="-9.5" y="-296" width="19" height="9" rx="2" fill="#6a4a33" />
      <rect x="-6" y="-302" width="12" height="7" rx="2" fill="#8a6446" />
      <line x1="0" y1="-302" x2="0" y2="-340" stroke="#553b29" strokeWidth="2" />
      <circle cx="0" cy="-338" r="14" fill="url(#eiffel-glow)" className="tc-beacon" />
      <circle cx="0" cy="-340" r="2.4" fill="#ffe27a" />
    </g>
  );
}
