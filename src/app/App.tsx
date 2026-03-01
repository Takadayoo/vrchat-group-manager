import { AppSidebar, type SidebarView } from "@/app/components/AppSidebar";
import { Toaster } from "@/app/components/ui/sonner";
import { GroupsPage } from "@/app/pages/GroupsPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { SettingsPage } from "@/app/pages/SettingsPage";
import { useAutoUpdate } from "@/hooks/useAutoUpdate";
import { useSession } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";
import type { UserInfo } from "@/types";
import { useState } from "react";

const App = () => {
  const { currentUser, isLoading, login, logout } = useSession();
  const [currentView, setCurrentView] = useState<SidebarView>("groups");
  const { theme, setTheme } = useTheme();
  const { checkForUpdate, isChecking } = useAutoUpdate(!!currentUser && !isLoading);

  const handleLoginSuccess = (user: UserInfo) => {
    login(user);
    setCurrentView("groups");
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView("groups");
  };

  // ローディング中
  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="size-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未ログイン時はログイン画面
  if (!currentUser) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <Toaster />
      </>
    );
  }

  // ログイン済み: サイドバー + メイン画面
  return (
    <div className="size-full flex overflow-hidden">
      <AppSidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 overflow-auto">
        {currentView === "groups" && <GroupsPage currentUser={currentUser} />}
        {currentView === "settings" && (
          <SettingsPage
            currentUser={currentUser}
            onLogout={handleLogout}
            theme={theme}
            onThemeChange={setTheme}
            checkForUpdate={checkForUpdate}
            isChecking={isChecking}
          />
        )}
      </main>

      <Toaster />
    </div>
  );
};

export default App;
