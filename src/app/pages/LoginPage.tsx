import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import type { UserInfo } from "@/types";
import { vrcApi } from "@/lib/vrcApi";
import { open } from "@tauri-apps/plugin-shell";
import { ExternalLink, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LoginPageProps {
  onLoginSuccess: (user: UserInfo) => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!token.trim()) {
      toast.error("APIトークンを入力してください");
      return;
    }

    setIsLoading(true);
    try {
      // VRChat APIを使用してログイン
      const user = await vrcApi.loginWithToken(token);
      
      // トークンを保存
      await vrcApi.saveToken(token);
      
      toast.success("ログインに成功しました");
      onLoginSuccess(user);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "ログイン中にエラーが発生しました";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const openUrl = async (url: string) => {
    try {
      await open(url);
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">VRChat グループマネージャー</CardTitle>
          <CardDescription>APIトークンを使用してログインしてください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">APIトークン</Label>
            <Input
              id="token"
              type="password"
              placeholder="authcookie_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              disabled={isLoading}
            />
          </div>

          <Button className="w-full" onClick={handleLogin} disabled={isLoading || !token.trim()}>
            <LogIn className="mr-2 size-4" />
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>

          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm text-muted-foreground">トークンの取得方法:</p>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => openUrl("https://vrchat.com/home")}
            >
              <ExternalLink className="mr-2 size-4" />
              VRChatにログイン
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => openUrl("https://vrchat.com/api/1/auth")}
            >
              <ExternalLink className="mr-2 size-4" />
              トークンの取得
            </Button>
          </div>

          <div className="text-xs text-muted-foreground pt-2">
            ※ APIトークンは安全に管理され、ローカルに保存されます
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
