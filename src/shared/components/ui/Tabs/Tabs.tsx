import type { TabsProps, TabItem } from "./tab.types";

export default function Tabs({ tabs, activeTab, onChange }: Readonly<TabsProps>) {
    return (
        <div className="inline-flex p-1 space-x-1 bg-tab-bg rounded-xl">
            {tabs.map((tab: TabItem) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${isActive
                            ? "bg-tab-active text-tab-text-active shadow-sm"
                            : "text-tab-text-inactive hover:text-foreground hover:bg-white/50"}`}
                    >
                        {Icon && <Icon className={`w-4 h-4 ${isActive ? "text-tab-text-active" : "text-tab-text-inactive"}`} />}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
