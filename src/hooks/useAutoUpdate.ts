import { vrcApi } from "@/lib/vrcApi";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useAutoUpdate = (enabled = false) => {
  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdate = async (silent = false) => {
    setIsChecking(true);
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
        if (!silent) {
          toast.info("最新バージョンを使用しています");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("アップデートの確認に失敗しました");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    const init = async () => {
      try {
        const settings = await vrcApi.getSettings();
        if (settings.update.checkOnStartup) {
          await checkForUpdate(true);
        }
      } catch {
        toast.error("設定の読み込みに失敗しました");
      }
    };
    init();
  }, [enabled]);

  return { checkForUpdate, isChecking } as const;
};
