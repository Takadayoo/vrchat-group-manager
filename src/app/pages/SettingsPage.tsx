import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Separator } from "@/app/components/ui/separator";
import { Switch } from "@/app/components/ui/switch";
import type { AppSettings, UserInfo } from "@/types";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { Activity, Bell, Code, FileText, Info, LogOut, Palette, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";

interface SettingsPageProps {
  currentUser: UserInfo;
  onLogout: () => void;
}

const APP_VERSION = "0.2.3";
const DEVELOPER_NAME = "takadayoo_1203";

export const SettingsPage = ({ currentUser, onLogout }: SettingsPageProps) => {
  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      enabled: true,
      groupUpdates: true,
    },
    ui: {
      theme: "system",
      language: "ja",
    },
    logs: {
      enabled: true,
      level: "info",
    },
  });
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // TODO: Tauriのinvokeコマンドで設定を取得
      // const response = await invoke<TauriResponse<AppSettings>>('get_settings');
      // if (response.success && response.data) {
      //   setSettings(response.data);
      // }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      // TODO: Tauriのinvokeコマンドで設定を保存
      // const response = await invoke<TauriResponse<void>>('update_settings', { settings: newSettings });
      // if (response.success) {
      setSettings(newSettings);
      toast.success("設定を保存しました");
      // } else {
      //   toast.error('設定の保存に失敗しました');
      // }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("設定の保存中にエラーが発生しました");
    }
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      const update = await check();

      if (update) {
        toast.success(`新しいバージョン ${update.version} が利用可能です`, {
          description: update.body || "アップデート内容をご確認ください",
          duration: 15000,
          action: {
            label: "今すぐ更新",
            onClick: async () => {
              try {
                toast.info("アップデートをダウンロード中...");

                await update.downloadAndInstall();

                toast.success("アップデート完了！アプリを再起動します");

                setTimeout(async () => {
                  await relaunch();
                }, 1000);
              } catch (error) {
                console.error("Update installation error:", error);
                toast.error("アップデートのインストールに失敗しました");
              }
            },
          },
          cancel: {
            label: "後で",
            onClick: () => {
              toast.dismiss();
            },
          },
        });
      } else {
        toast.info("最新バージョンを使用しています");
      }
    } catch (error) {
      console.error("Update check error:", error);
      toast.error("アップデート確認中にエラーが発生しました");
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      toast.success("ログアウトしました");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("ログアウト中にエラーが発生しました");
    }
  };

  return (
    <div className="flex-1 h-full overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">設定</h2>
          <p className="text-sm text-muted-foreground">アプリケーションの設定を管理します</p>
        </div>

        {/* ログイン設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="size-5" />
              ログイン
            </CardTitle>
            <CardDescription>
              現在のユーザー: {currentUser.displayName} (@
              {currentUser.username})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              ログアウト
            </Button>
          </CardContent>
        </Card>

        {/* UI表示設定 */}
        <Card className="relative opacity-60 pointer-events-none">
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              近日実装予定
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-5" />
              UI表示設定
            </CardTitle>
            <CardDescription>アプリケーションの外観をカスタマイズします</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>テーマ</Label>
                <p className="text-sm text-muted-foreground">
                  アプリケーションのカラーテーマを選択
                </p>
              </div>
              <Select
                value={settings.ui.theme}
                onValueChange={(value) => {
                  const newSettings = {
                    ...settings,
                    ui: {
                      ...settings.ui,
                      theme: value as "light" | "dark" | "system",
                    },
                  };
                  saveSettings(newSettings);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">ライト</SelectItem>
                  <SelectItem value="dark">ダーク</SelectItem>
                  <SelectItem value="system">システム</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>言語</Label>
                <p className="text-sm text-muted-foreground">表示言語を選択</p>
              </div>
              <Select
                value={settings.ui.language}
                onValueChange={(value) => {
                  const newSettings = {
                    ...settings,
                    ui: { ...settings.ui, language: value as "ja" | "en" },
                  };
                  saveSettings(newSettings);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 通知設定 */}
        <Card className="relative opacity-60 pointer-events-none">
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              近日実装予定
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5" />
              通知設定
            </CardTitle>
            <CardDescription>通知の表示方法を設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>通知を有効化</Label>
                <p className="text-sm text-muted-foreground">デスクトップ通知を表示</p>
              </div>
              <Switch
                checked={settings.notifications.enabled}
                onCheckedChange={(checked) => {
                  const newSettings = {
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      enabled: checked,
                    },
                  };
                  saveSettings(newSettings);
                }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>グループ更新通知</Label>
                <p className="text-sm text-muted-foreground">グループの変更時に通知</p>
              </div>
              <Switch
                checked={settings.notifications.groupUpdates}
                onCheckedChange={(checked) => {
                  const newSettings = {
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      groupUpdates: checked,
                    },
                  };
                  saveSettings(newSettings);
                }}
                disabled={!settings.notifications.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* ログ/保存設定 */}
        <Card className="relative opacity-60 pointer-events-none">
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              近日実装予定
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              ログ/保存設定
            </CardTitle>
            <CardDescription>ログの記録レベルを設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>ログを有効化</Label>
                <p className="text-sm text-muted-foreground">アプリケーションログを記録</p>
              </div>
              <Switch
                checked={settings.logs.enabled}
                onCheckedChange={(checked) => {
                  const newSettings = {
                    ...settings,
                    logs: { ...settings.logs, enabled: checked },
                  };
                  saveSettings(newSettings);
                }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>ログレベル</Label>
                <p className="text-sm text-muted-foreground">記録する詳細レベル</p>
              </div>
              <Select
                value={settings.logs.level}
                onValueChange={(value) => {
                  const newSettings = {
                    ...settings,
                    logs: {
                      ...settings.logs,
                      level: value as "info" | "debug" | "error",
                    },
                  };
                  saveSettings(newSettings);
                }}
                disabled={!settings.logs.enabled}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">エラーのみ</SelectItem>
                  <SelectItem value="info">情報</SelectItem>
                  <SelectItem value="debug">デバッグ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* アプリの動作 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              アプリの動作
            </CardTitle>
            <CardDescription>アプリケーションの更新を管理します</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>アップデート確認</Label>
                <p className="text-sm text-muted-foreground">新しいバージョンを確認</p>
              </div>
              <Button variant="outline" onClick={handleCheckUpdate} disabled={isCheckingUpdate}>
                <RefreshCw className={`size-4 mr-2 ${isCheckingUpdate ? "animate-spin" : ""}`} />
                {isCheckingUpdate ? "確認中..." : "確認"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* その他 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="size-5" />
              その他
            </CardTitle>
            <CardDescription>アプリケーション情報</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Code className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">バージョン:</span>
              <span className="font-mono">{APP_VERSION}</span>
            </div>

            <Separator />

            <div className="flex items-center gap-2 text-sm">
              <Info className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">開発者:</span>
              <span>{DEVELOPER_NAME}</span>
            </div>

            <Separator />

            <div className="pt-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://opensource.org/licenses/MIT"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ライセンス情報
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
