import { AppSidebar, type SidebarView } from "@/app/components/AppSidebar";
import { Toaster } from "@/app/components/ui/sonner";
import { GroupsPage } from "@/app/pages/GroupsPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { SettingsPage } from "@/app/pages/SettingsPage";
import { useAutoUpdate } from "@/hooks/useAutoUpdate";
import { useTheme } from "@/hooks/useTheme";
import { vrcApi } from "@/lib/vrcApi";
import type { UserInfo } from "@/types";
import { useEffect, useState } from "react";

const App = () => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [currentView, setCurrentView] = useState<SidebarView>("groups");
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const { checkForUpdate, isChecking } = useAutoUpdate(!!currentUser && !isLoading);

  // 起動時に保存されたトークンを確認
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // 保存されたトークンを確認
      const token = await vrcApi.loadToken();
      if (token) {
        // トークンが存在する場合、ユーザー情報を取得
        const user = await vrcApi.loginWithToken(token);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Failed to check session:", error);
      // トークンが無効な場合は削除
      await vrcApi.deleteToken();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (user: UserInfo) => {
    setCurrentUser(user);
    setCurrentView("groups");
  };

  const handleLogout = async () => {
    try {
      // トークンを削除
      await vrcApi.deleteToken();
      setCurrentUser(null);
      setCurrentView("groups");
    } catch (error) {
      console.error("Logout error:", error);
    }
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
