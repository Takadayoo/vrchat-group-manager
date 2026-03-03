import { limitedParallel, mapUpdateError } from "@/lib/utils";
import { vrcApi } from "@/lib/vrcApi";
import type { GroupVisibility, UpdateProgress, UpdateResult, VRChatGroup } from "@/types";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const MAX_CONCURRENCY = 3;

export const useGroupOperations = (userId: string) => {
  const [groups, setGroups] = useState<VRChatGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [targetVisibility, setTargetVisibility] = useState<GroupVisibility>("visible");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isRepresentMode, setIsRepresentMode] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [isRepresenting, setIsRepresenting] = useState(false);

  // グループデータを取得
  const loadGroups = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // トークンを取得
      const token = await vrcApi.loadToken();
      if (!token) {
        throw new Error("Token not found");
      }

      // VRChat APIからグループ一覧を取得
      const fetchedGroups = await vrcApi.getMyGroups(token, userId);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Failed to load groups:", error);
      toast.error("グループの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoading]);

  // 一括更新
  const handleUpdate = async () => {
    if (selectedGroups.size === 0) {
      toast.error("グループを選択してください");
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    setProgress({ done: 0, total: selectedGroups.size });

    // 差分判定
    const groupMap = new Map(groups.map((g) => [g.groupId, g]));
    const targetGroupIds: string[] = [];
    const skippedGroupIds: string[] = [];

    for (const groupId of selectedGroups) {
      const group = groupMap.get(groupId);
      if (!group) continue;

      if (group.memberVisibility === targetVisibility) {
        skippedGroupIds.push(groupId);
      } else {
        targetGroupIds.push(groupId);
      }
    }

    // スキップ分を即時成功扱い
    if (skippedGroupIds.length > 0) {
      setProgress((p) => (p ? { ...p, done: p.done + skippedGroupIds.length } : p));
    }

    // 差分のみ更新
    try {
      const tasks = targetGroupIds.map((groupId) => async (): Promise<UpdateResult> => {
        try {
          await vrcApi.updateGroupVisibility(userId, groupId, targetVisibility);
          return { groupId, success: true };
        } catch (e) {
          return {
            groupId,
            success: false,
            reason: mapUpdateError(e),
          };
        } finally {
          setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
        }
      });

      const results = await limitedParallel(tasks, MAX_CONCURRENCY);

      const hasRateLimit = results.some((r) => !r.success && r.reason === "RATE_LIMIT");

      if (hasRateLimit) {
        setUpdateError("一部の更新が制限されました。しばらく待ってから再試行してください");
      } else {
        toast.success(`${selectedGroups.size}件のグループを更新しました`);
      }
    } catch (e) {
      const errorReason = mapUpdateError(e);
      setUpdateError(`更新中にエラーが発生しました: ${errorReason}`);
    } finally {
      // 更新後に再取得
      try {
        await loadGroups();
      } finally {
        setSelectedGroups(new Set());
        setIsUpdating(false);
        setProgress(null);
      }
    }
  };

  const handleRepresent = async (groupId: string) => {
    const previousGroups = groups;
    const target = groups.find((g) => g.groupId === groupId);
    if (!target) return;

    // 次の状態を決定
    const willBeTrue = !target.isRepresenting;

    // 楽観的更新
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        isRepresenting: willBeTrue && g.groupId === groupId,
      })),
    );

    setIsRepresenting(true);

    try {
      await vrcApi.updateGroupRepresentation(groupId, willBeTrue);
      toast.success("このグループの掲示設定を更新しました。");
    } catch (e) {
      console.error(e);
      toast.error("更新に失敗しました。状態を戻します。");

      // 失敗時ロールバック
      setGroups(previousGroups);
    } finally {
      setIsRepresenting(false);
    }
  };

  const handleRepresentMode = () => {
    setIsRepresentMode(!isRepresentMode);
    setSelectedGroups(new Set());
  };

  // 全選択/解除
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGroups(new Set(groups.map((g) => g.groupId)));
    } else {
      setSelectedGroups(new Set());
    }
  };

  // 個別選択
  const handleSelectGroup = (groupId: string, checked: boolean) => {
    const newSelected = new Set(selectedGroups);
    if (checked) {
      newSelected.add(groupId);
    } else {
      newSelected.delete(groupId);
    }
    setSelectedGroups(newSelected);
  };

  return {
    groups,
    selectedGroups,
    targetVisibility,
    setTargetVisibility,
    isLoading,
    isUpdating,
    updateError,
    progress,
    isRepresentMode,
    isRepresenting,
    loadGroups,
    handleUpdate,
    handleRepresent,
    handleRepresentMode,
    handleSelectAll,
    handleSelectGroup,
  };
};
