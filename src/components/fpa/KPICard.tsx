interface Props {
  label: string;
  value: string;
  trend?: { value: string; favorable: boolean } | null;
}

export default function KPICard({ label, value, trend }: Props) {
  return (
    <div class="bg-bg-secondary border border-border rounded-sm p-4">
      <p class="mono-label text-xs text-text-secondary mb-1">{label}</p>
      <p class="text-xl font-semibold text-text-primary tracking-tight">{value}</p>
      {trend && (
        <p
          class={`text-xs font-medium mt-1 ${
            trend.favorable ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {trend.value}
        </p>
      )}
    </div>
  );
}
