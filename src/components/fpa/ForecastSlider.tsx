interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

export default function ForecastSlider({ label, value, min, max, step, unit, onChange }: Props) {
  return (
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="mono-label text-xs text-text-secondary">{label}</label>
        <span class="mono-label text-xs text-accent font-semibold bg-accent-light/50 px-2 py-0.5 rounded-sm">
          {unit === '$' ? `$${value}K` : `${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
        class="fpa-range w-full"
      />
      <div class="flex justify-between text-[10px] text-text-secondary font-mono">
        <span>{unit === '$' ? `$${min}K` : `${min}${unit}`}</span>
        <span>{unit === '$' ? `$${max}K` : `${max}${unit}`}</span>
      </div>
    </div>
  );
}
