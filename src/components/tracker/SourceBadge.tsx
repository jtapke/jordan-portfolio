interface Props {
  label: string;
  color: string;
}

export default function SourceBadge({ label, color }: Props) {
  return (
    <span class="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
      <span
        class="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
