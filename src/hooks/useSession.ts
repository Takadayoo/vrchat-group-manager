import { vrcApi } from "@/lib/vrcApi";
import type { UserInfo } from "@/types";
import { useEffect, useState } from "react";

export const useSession = () => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 起動時に保存されたトークンを確認
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = await vrcApi.loadToken();
      if (token) {
        const user = await vrcApi.loginWithToken(token);
        setCurrentUser(user);
      }
    } catch {
      await vrcApi.deleteToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (user: UserInfo) => setCurrentUser(user);

  const logout = async () => {
    try {
      await vrcApi.deleteToken();
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { currentUser, isLoading, login, logout } as const;
};
