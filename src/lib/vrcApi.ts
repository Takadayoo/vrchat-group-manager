import type { GroupVisibility, UserInfo, VRChatGroup } from "@/types";
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
};
