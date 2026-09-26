/** Fallback landmark for cities outside the MVP set: a small modern skyline. */
export function GenericLandmark({ x = 0, y = 0 }: { x?: number; y?: number }) {
  const towers = [
    { dx: -46, w: 30, h: 150, c: '#9fb4d3' },
    { dx: -12, w: 36, h: 230, c: '#7f9cc6' },
    { dx: 30, w: 28, h: 180, c: '#a9bddb' },
  ];
  return (
    <g transform={`translate(${x} ${y})`} role="img" aria-label="קו רקיע">
      <ellipse cx="0" cy="4" rx="80" ry="22" fill="#2d3b2a" opacity="0.15" />
      {towers.map((t) => (
        <g key={t.dx}>
          <rect x={t.dx} y={-t.h} width={t.w} height={t.h} rx="3" fill={t.c} />
          <rect x={t.dx + t.w / 2} y={-t.h} width={t.w / 2} height={t.h} rx="2" fill="#000" opacity="0.08" />
          {Array.from({ length: Math.floor(t.h / 14) }).map((_, k) => (
            <rect key={k} x={t.dx + 4} y={-t.h + 8 + k * 14} width={t.w - 8} height="4" rx="1" fill="#fff" opacity="0.45" />
          ))}
        </g>
      ))}
    </g>
  );
}
