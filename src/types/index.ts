/**
 * VRChat グループの公開状態
 */
export type GroupVisibility = "visible" | "friends" | "hidden";

/**
 * VRChat グループ情報
 */
export interface VRChatGroup {
  groupId: string;
  name: string;
  iconUrl?: string;
  description?: string;
  memberVisibility: GroupVisibility;
  memberCount?: number;
  createdAt?: string;
  isRepresenting: boolean;
}

/**
 * ページング情報（無限スクロール用）
 */
export interface PaginationInfo {
  hasMore: boolean;
  offset: number;
  limit: number;
}

/**
 * グループフィルター設定
 */
export interface GroupFilter {
  searchQuery: string;
  sortBy: "name" | "createdAt" | "memberCount";
  sortOrder: "asc" | "desc";
}

/**
 * ユーザー情報
 */
export interface UserInfo {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

/**
 * アプリケーション設定
 */
export interface AppSettings {
  notifications: {
    enabled: boolean;
    groupUpdates: boolean;
  };
  ui: {
    theme: "light" | "dark" | "system";
    language: "ja" | "en";
  };
  logs: {
    enabled: boolean;
    level: "info" | "debug" | "error";
  };
}

/**
 * Tauri コマンドのレスポンス型
 */
export interface TauriResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 更新結果のエラー理由
 */
export type UpdateErrorReason = "RATE_LIMIT" | "NETWORK_ERROR" | "UNKNOWN";

/**
 * 更新結果
 */
export type UpdateResult =
  | {
      groupId: string;
      success: true;
    }
  | {
      groupId: string;
      success: false;
      reason: UpdateErrorReason;
    };

/**
 * 更新進捗状態
 */
export interface UpdateProgress {
  done: number;
  total: number;
}
