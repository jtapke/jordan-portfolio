interface Props {
  value: number;
  maxAbsValue: number;
}

export default function VarianceBar({ value, maxAbsValue }: Props) {
  if (maxAbsValue === 0) return null;

  const pct = Math.min(Math.abs(value) / maxAbsValue, 1) * 50;
  const favorable = value >= 0;
  const barColor = favorable ? '#2E7D32' : '#C62828';

  return (
    <svg width="80" height="14" viewBox="0 0 80 14" class="inline-block align-middle">
      {/* Center line */}
      <line x1="40" y1="0" x2="40" y2="14" stroke="#E5DED4" stroke-width="1" />
      {/* Bar */}
      {favorable ? (
        <rect x={40} y={3} width={(pct / 100) * 80} height={8} rx={1} fill={barColor} opacity={0.8} />
      ) : (
        <rect x={40 - (pct / 100) * 80} y={3} width={(pct / 100) * 80} height={8} rx={1} fill={barColor} opacity={0.8} />
      )}
    </svg>
  );
}
