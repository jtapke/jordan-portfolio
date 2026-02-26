import { useMemo } from 'preact/hooks';
import type { PLSummary, Month } from '../../lib/fpaTypes';
import { buildWaterfallSegments } from '../../lib/fpaCalculations';
import { formatCurrency } from './formatters';

interface Props {
  pl: PLSummary;
  throughMonth: Month;
}

const COLORS = {
  start: '#E07A2F',
  total: '#E07A2F',
  positive: '#2E7D32',
  negative: '#C62828',
};

export default function VarianceWaterfall({ pl, throughMonth }: Props) {
  const segments = useMemo(
    () => buildWaterfallSegments(pl, throughMonth),
    [pl, throughMonth]
  );

  // Chart dimensions
  const chartW = 700;
  const chartH = 320;
  const padTop = 40;
  const padBottom = 60;
  const padLeft = 40;
  const padRight = 20;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;

  // Find value range
  const allValues: number[] = [];
  for (const seg of segments) {
    allValues.push(seg.startValue, seg.endValue, seg.value);
  }
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(0, ...allValues);
  const range = maxVal - minVal || 1;

  const barCount = segments.length;
  const barGroupW = plotW / barCount;
  const barW = Math.min(barGroupW * 0.6, 60);

  function yScale(v: number): number {
    return padTop + plotH - ((v - minVal) / range) * plotH;
  }

  const zeroY = yScale(0);

  return (
    <div>
      <h3 class="heading-md text-text-primary mb-2">
        Operating Income Bridge
      </h3>
      <p class="text-sm text-text-secondary mb-6">
        Budget to Actual variance decomposition — YTD through {throughMonth}
      </p>

      <div class="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          class="w-full max-w-[700px]"
          role="img"
          aria-label="Waterfall chart showing variance bridge from budget to actual operating income"
        >
          {/* Zero line */}
          <line
            x1={padLeft}
            y1={zeroY}
            x2={chartW - padRight}
            y2={zeroY}
            stroke="#E5DED4"
            stroke-width="1"
          />

          {segments.map((seg, i) => {
            const cx = padLeft + i * barGroupW + barGroupW / 2;
            const bx = cx - barW / 2;

            const isEndpoint = seg.type === 'start' || seg.type === 'total';

            const barTop = isEndpoint
              ? yScale(Math.max(seg.value, 0))
              : yScale(Math.max(seg.startValue, seg.endValue));
            const barBottom = isEndpoint
              ? yScale(Math.min(seg.value, 0))
              : yScale(Math.min(seg.startValue, seg.endValue));
            const barHeight = Math.max(barBottom - barTop, 2);

            const color = COLORS[seg.type];

            // Dotted connector to next bar
            const showConnector =
              i < segments.length - 1 && !isEndpoint;

            return (
              <g key={i}>
                {/* Bar */}
                <rect
                  x={bx}
                  y={barTop}
                  width={barW}
                  height={barHeight}
                  fill={color}
                  rx={2}
                  opacity={0.9}
                />

                {/* Value label above/below bar */}
                <text
                  x={cx}
                  y={
                    isEndpoint
                      ? barTop - 8
                      : seg.value >= 0
                        ? barTop - 8
                        : barBottom + 16
                  }
                  text-anchor="middle"
                  fill={color}
                  font-size="11"
                  font-family="'Space Mono', monospace"
                  font-weight="600"
                >
                  {isEndpoint
                    ? formatCurrency(seg.value)
                    : `${seg.value >= 0 ? '+' : ''}${formatCurrency(seg.value)}`}
                </text>

                {/* Label below */}
                <text
                  x={cx}
                  y={chartH - padBottom + 18}
                  text-anchor="middle"
                  fill="#6B6560"
                  font-size="10"
                  font-family="'Space Mono', monospace"
                >
                  {seg.label}
                </text>

                {/* Dotted connector */}
                {showConnector && (
                  <line
                    x1={bx + barW}
                    y1={yScale(seg.endValue)}
                    x2={padLeft + (i + 1) * barGroupW + barGroupW / 2 - barW / 2}
                    y2={yScale(seg.endValue)}
                    stroke="#6B6560"
                    stroke-width="1"
                    stroke-dasharray="3 3"
                    opacity={0.5}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
