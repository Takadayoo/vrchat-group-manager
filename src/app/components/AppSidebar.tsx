import { cn } from "@/app/components/ui/utils";
import { Settings, Users } from "lucide-react";

export type SidebarView = "groups" | "settings";

interface AppSidebarProps {
  currentView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

export const AppSidebar = ({ currentView, onViewChange }: AppSidebarProps) => {
  const menuItems = [
    { id: "groups" as SidebarView, label: "グループ管理", icon: Users },
    { id: "settings" as SidebarView, label: "設定", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="font-semibold text-lg">VRChat グループ</h1>
      </div>

      <nav className="flex-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent",
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
