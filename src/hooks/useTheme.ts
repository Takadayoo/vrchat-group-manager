import { vrcApi } from "@/lib/vrcApi";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", isDark);
}

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // 初期化: Rust側から設定を読み込んで適用
  useEffect(() => {
    const init = async () => {
      try {
        const settings = await vrcApi.getSettings();
        setThemeState(settings.ui.theme);
      } catch {
        applyTheme("system");
      } finally {
        setIsLoaded(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // systemモード時のみOS設定変更を監視
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // テーマ変更 → DOM反映 → Rust側に保存
  const handleSetTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      const current = await vrcApi.getSettings();
      await vrcApi.saveSettings({
        ...current,
        ui: { ...current.ui, theme: newTheme },
      });
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  };

  return { theme, setTheme: handleSetTheme, isLoaded } as const;
};
