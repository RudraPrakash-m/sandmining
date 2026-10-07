import type { LucideIcon } from "lucide-react";

export interface TabItem {
    key: string;
    label: string;
    icon?: LucideIcon;
}

export interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (key: string) => void;
}
