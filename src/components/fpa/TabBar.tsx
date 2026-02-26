import type { DashboardTab } from '../../lib/fpaTypes';

interface Props {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'pl-summary', label: 'P&L Summary' },
  { id: 'variance', label: 'Variance Analysis' },
  { id: 'forecast', label: 'Forecast Model' },
  { id: 'departments', label: 'Departments' },
];

export default function TabBar({ activeTab, onTabChange }: Props) {
  return (
    <div class="border-b border-border overflow-x-auto">
      <nav class="flex gap-0 min-w-max" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            class={`mono-label text-xs px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
