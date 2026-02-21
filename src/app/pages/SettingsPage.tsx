import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
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
import { vrcApi } from "@/lib/vrcApi";
import type { UserInfo } from "@/types";
import { Activity, Bell, Code, FileText, Info, LogOut, Palette, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";

interface SettingsPageProps {
  currentUser: UserInfo;
  onLogout: () => void;
  theme: string;
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  checkForUpdate: () => Promise<void>;
  isChecking: boolean;
}

const APP_VERSION = "0.2.3";
const DEVELOPER_NAME = "takadayoo_1203";

export const SettingsPage = ({
  currentUser,
  onLogout,
  theme,
  onThemeChange,
  checkForUpdate,
  isChecking,
}: SettingsPageProps) => {
  const [updateSettings, setUpdateSettings] = useState({
    checkOnStartup: true,
    includePrerelease: false,
  });
  const [dialogType, setDialogType] = useState<"disableCheck" | "enablePrerelease" | null>(null);

  // stateではなく定数で十分
  const dummySettings = {
    notifications: { enabled: true, groupUpdates: true },
    ui: { language: "ja" },
    logs: { enabled: true, level: "info" },
  };

  const handleCheckUpdate = async () => {
    await checkForUpdate();
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

  // 「起動時確認」をOFFにする時だけダイアログを出す
  const handleCheckOnStartupChange = (checked: boolean) => {
    if (!checked) {
      setDialogType("disableCheck");
    } else {
      saveUpdateSettings({ ...updateSettings, checkOnStartup: true });
    }
  };

  // 「プレリリース」をONにする時だけダイアログを出す
  const handleIncludePrereleaseChange = (checked: boolean) => {
    if (checked) {
      setDialogType("enablePrerelease");
    } else {
      saveUpdateSettings({ ...updateSettings, includePrerelease: false });
    }
  };

  const saveUpdateSettings = async (next: typeof updateSettings) => {
    const current = await vrcApi.getSettings();
    try {
      await vrcApi.saveSettings({ ...current, update: next });
      setUpdateSettings(next);
    } catch (error) {
      console.error(error);
      toast.error("設定の保存に失敗しました");
    }
  };

  useEffect(() => {
    const load = async () => {
      const settings = await vrcApi.getSettings();
      setUpdateSettings(settings.update);
    };
    load();
  }, []);

  return (
    <div className="flex-1 h-full overflow-auto bg-muted">
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
        <Card className="relative">
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
                value={theme}
                onValueChange={(value) => onThemeChange(value as "light" | "dark" | "system")}
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
                value={dummySettings.ui.language}
                disabled
                // onValueChange={}
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
                checked={dummySettings.notifications.enabled}
                // onCheckedChange={}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>グループ更新通知</Label>
                <p className="text-sm text-muted-foreground">グループの変更時に通知</p>
              </div>
              <Switch
                checked={dummySettings.notifications.groupUpdates}
                // onCheckedChange={}
                disabled={!dummySettings.notifications.enabled}
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
                checked={dummySettings.logs.enabled}
                // onCheckedChange={}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>ログレベル</Label>
                <p className="text-sm text-muted-foreground">記録する詳細レベル</p>
              </div>
              <Select
                value={dummySettings.logs.level}
                // onValueChange={}
                disabled={!dummySettings.logs.enabled}
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
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>アップデート確認</Label>
                <p className="text-sm text-muted-foreground">新しいバージョンを確認</p>
              </div>
              <Button variant="outline" onClick={handleCheckUpdate} disabled={isChecking}>
                <RefreshCw className={`size-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
                {isChecking ? "確認中..." : "確認"}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>起動時にアップデートを確認する</Label>
                <p className="text-sm text-muted-foreground">
                  アプリ起動時に自動で新バージョンを確認します
                </p>
              </div>
              <Switch
                checked={updateSettings.checkOnStartup}
                onCheckedChange={handleCheckOnStartupChange}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>プレリリース版を受け取る</Label>
                <p className="text-sm text-muted-foreground">
                  開発中の新機能をいち早く試せます（不安定な場合があります）
                </p>
              </div>
              <Switch
                checked={updateSettings.includePrerelease}
                onCheckedChange={handleIncludePrereleaseChange}
              />
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
              {updateSettings.includePrerelease && (
                <Badge variant="secondary" className="text-xs text-yellow-700 bg-yellow-100">
                  ※プレリリース利用中
                </Badge>
              )}
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
      <AlertDialog open={dialogType !== null} onOpenChange={(open) => !open && setDialogType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogType === "disableCheck"
                ? "アップデート通知を無効にしますか？"
                : "プレリリース版を受け取りますか？"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogType === "disableCheck"
                ? "アップデート通知を無効にすると、新機能や不具合修正、セキュリティ更新のお知らせを受け取れなくなります。重要な修正を見逃す可能性がありますが、よろしいですか？"
                : "プレリリース版には、新機能をいち早く試せるメリットがありますが、予期しない不具合が含まれる場合があります。有効にしますか？"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {dialogType === "disableCheck" ? "有効のままにする（推奨）" : "キャンセル"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dialogType === "disableCheck") {
                  saveUpdateSettings({ ...updateSettings, checkOnStartup: false });
                } else {
                  saveUpdateSettings({ ...updateSettings, includePrerelease: true });
                }
                setDialogType(null);
              }}
            >
              {dialogType === "disableCheck" ? "無効にする" : "有効にする"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
