import type { ScenarioPreset } from '../../lib/fpaTypes';

interface Props {
  presets: ScenarioPreset[];
  activeScenario: string | null;
  onSelect: (preset: ScenarioPreset) => void;
}

export default function ScenarioToggle({ presets, activeScenario, onSelect }: Props) {
  return (
    <div class="flex gap-2 flex-wrap">
      {presets.map((preset) => {
        const isActive = activeScenario === preset.name;
        return (
          <button
            key={preset.name}
            onClick={() => onSelect(preset)}
            class={`mono-label text-xs px-3 py-1.5 rounded-sm border transition-colors ${
              isActive
                ? 'border-current text-white'
                : 'border-border text-text-secondary hover:text-text-primary'
            }`}
            style={isActive ? { backgroundColor: preset.color, borderColor: preset.color } : {}}
          >
            {preset.name}
          </button>
        );
      })}
      {activeScenario === null && (
        <span class="mono-label text-xs px-3 py-1.5 rounded-sm border border-accent text-accent bg-accent-light/30">
          Custom
        </span>
      )}
    </div>
  );
}
