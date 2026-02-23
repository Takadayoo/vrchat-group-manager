import type { AppSettings, GroupVisibility, UserInfo, VRChatGroup } from "@/types";
import { invoke } from "@tauri-apps/api/core";

/**
 * VRChat API関連の操作
 */
export const vrcApi = {
  /**
   * 保存されたトークンを読み込む
   */
  async loadToken(): Promise<string | null> {
    try {
      const token = await invoke<string | null>("load_token");
      return token;
    } catch (error) {
      console.error("Failed to load token:", error);
      return null;
    }
  },

  /**
   * トークンを保存する
   */
  async saveToken(token: string): Promise<void> {
    await invoke("save_token", { token });
  },

  /**
   * 保存されたトークンを削除する
   */
  async deleteToken(): Promise<void> {
    await invoke("delete_token");
  },

  /**
   * トークンでログインし、ユーザー情報を取得
   */
  async loginWithToken(token: string): Promise<UserInfo> {
    const response = await invoke<{ user: UserInfo }>("login_with_token", { token });
    return response.user;
  },

  /**
   * ユーザーのグループ一覧を取得
   */
  async getMyGroups(token: string, userId: string): Promise<VRChatGroup[]> {
    const response = await invoke<VRChatGroup[]>("get_my_groups", { token, userId });
    return response;
  },

  /**
   * グループの可視状態を更新
   */
  async updateGroupVisibility(groupId: string, visibility: GroupVisibility): Promise<void> {
    await invoke("update_group_status", {
      groupId,
      visibility,
    });
  },

  /**
   * 掲示中のグループを取得する
   */
  async getRepresentedGroup(): Promise<VRChatGroup[]> {
    const response = await invoke<VRChatGroup[]>("get_represented_group", {});
    return response;
  },

  /**
   * 指定したグループを掲示する(掲示中の場合を掲示停止する)
   */
  async updateGroupRepresentation(groupId: string, isRepresenting: boolean): Promise<void> {
    await invoke("update_group_representation", {
      groupId,
      isRepresenting,
    });
  },

  /**
   * アプリ設定を取得
   */
  async getSettings(): Promise<AppSettings> {
    return await invoke<AppSettings>("get_settings");
  },

  /**
   * アプリ設定を保存
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    await invoke("save_settings_cmd", { settings });
  },

  /**
   * アップデートを確認する
   */
  async checkForUpdates(): Promise<{ version: string; body?: string } | null> {
    return await invoke<{ version: string; body?: string } | null>("check_for_updates");
  },

  /**
   * アップデートをダウンロードしてインストール
   */
  async installUpdate(): Promise<void> {
    await invoke("install_update");
  },
};
