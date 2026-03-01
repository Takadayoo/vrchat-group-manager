// アプリケーション設定
export interface AppSettings {
  notifications: NotificationSettings;
  ui: UiSettings;
  logs: LogSettings;
  update: UpdateSettings;
}

interface NotificationSettings {
  enabled: boolean;
  groupUpdates: boolean;
}
interface UiSettings {
  theme: "light" | "dark" | "system";
  language: "ja" | "en";
}
interface LogSettings {
  enabled: boolean;
  level: "info" | "debug" | "error";
}
interface UpdateSettings {
  checkOnStartup: boolean;
  includePrerelease: boolean;
}
