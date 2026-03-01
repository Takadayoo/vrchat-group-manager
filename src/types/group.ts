// VRChat APIのデータ
export type GroupVisibility = "visible" | "friends" | "hidden";
export interface VRChatGroup {
  name: string;
  description?: string;
  iconUrl?: string;
  memberCount?: number;
  groupId: string;
  memberVisibility: GroupVisibility;
  isRepresenting: boolean;
}

// フロントのUI状態
export interface GroupSortOption {
  sortBy: "name" | "memberCount";
  sortOrder: "asc" | "desc";
}
export type UpdateErrorReason = "RATE_LIMIT" | "NETWORK_ERROR" | "UNKNOWN";
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
export interface UpdateProgress {
  done: number;
  total: number;
}
