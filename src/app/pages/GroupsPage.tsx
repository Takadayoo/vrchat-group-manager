import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Progress } from "@/app/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { limitedParallel, mapUpdateError } from "@/lib/utils";
import { vrcApi } from "@/lib/vrcApi";
import type {
  GroupFilter,
  GroupVisibility,
  UpdateProgress,
  UpdateResult,
  UserInfo,
  VRChatGroup,
} from "@/types";
import { RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface GroupsPageProps {
  currentUser: UserInfo;
}

const MAX_CONCURRENCY = 3;

export const GroupsPage = ({ currentUser }: GroupsPageProps) => {
  const [groups, setGroups] = useState<VRChatGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<GroupFilter>({
    searchQuery: "",
    sortBy: "name",
    sortOrder: "asc",
  });
  const [targetVisibility, setTargetVisibility] = useState<GroupVisibility>("visible");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [isRepresentMode, setIsRepresentMode] = useState(false);
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
      const fetchedGroups = await vrcApi.getMyGroups(token, currentUser.id);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Failed to load groups:", error);
      toast.error("グループの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id, isLoading]);

  // 初回ロード
  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          await vrcApi.updateGroupVisibility(groupId, targetVisibility);
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

  // 公開状態のテキストを取得
  const getVisibilityLabel = (visibility: GroupVisibility): string => {
    const labels: Record<GroupVisibility, string> = {
      visible: "公開",
      friends: "フレンドのみ",
      hidden: "非公開",
    };
    return labels[visibility];
  };

  // 公開状態のクラス属性を取得
  const getVisibilityColor = (visibility: GroupVisibility): string => {
    const colors: Record<GroupVisibility, string> = {
      visible: "bg-green-100 text-green-800",
      friends: "bg-blue-100 text-blue-800",
      hidden: "bg-gray-100 text-gray-800",
    };
    return colors[visibility];
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRepresent = async (groupId: string) => {
    const previousGroups = groups;
    const target = groups.find((g) => g.groupId === groupId);
    if (!target) return;

    // 次の状態を決定
    const willBeTrue = !target.isRepresenting;

    // ① 楽観的更新
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

      // ② 失敗時ロールバック
      setGroups(previousGroups);
    } finally {
      setIsRepresenting(false);
    }
  };

  const handleRepresentMode = () => {
    setIsRepresentMode(!isRepresentMode);
    setSelectedGroups(new Set());
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">グループ管理</h2>
            <p className="text-sm text-muted-foreground">ログイン中: {currentUser.displayName}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadGroups()}
            disabled={isLoading || isUpdating}
          >
            <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            更新
          </Button>
        </div>

        {/* フィルター */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="グループ名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              disabled={isUpdating}
            />
          </div>
          <Select
            value={filter.sortBy}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, sortBy: value as GroupFilter["sortBy"] }))
            }
            disabled={isUpdating}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">名前順</SelectItem>
              <SelectItem value="createdAt">作成日順</SelectItem>
              <SelectItem value="memberCount">メンバー数順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 一括更新 */}
        <div className="flex gap-3 items-center">
          <Select
            value={targetVisibility}
            onValueChange={(value) => setTargetVisibility(value as GroupVisibility)}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visible">公開</SelectItem>
              <SelectItem value="friends">フレンドのみ</SelectItem>
              <SelectItem value="hidden">非公開</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleUpdate}
            disabled={selectedGroups.size === 0 || isUpdating || isRepresentMode}
          >
            {isUpdating ? "更新中..." : `一括更新 (${selectedGroups.size})`}
          </Button>
          <Button
            onClick={handleRepresentMode}
            disabled={isRepresenting || selectedGroups.size !== 0}
          >
            {isRepresentMode ? "掲示モード解除" : "掲示モード"}
          </Button>
        </div>

        {/* 進捗表示 */}
        {isUpdating && progress && (
          <div className="mt-4 space-y-2">
            <Progress value={(progress.done / progress.total) * 100} />
            <p className="text-sm text-muted-foreground">
              {progress.done} / {progress.total} 完了
            </p>
          </div>
        )}

        {/* エラー表示 */}
        {updateError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {updateError}
          </div>
        )}
      </div>

      {/* グループリスト */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* ヘッダー */}
            <div
              className={`grid ${
                isRepresentMode ? "grid-cols-[1fr_150px_80px]" : "grid-cols-[50px_1fr_150px_80px]"
              } gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-sm`}
            >
              {!isRepresentMode && (
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedGroups.size === groups.length && groups.length > 0}
                    onCheckedChange={handleSelectAll}
                    disabled={isUpdating}
                  />
                </div>
              )}
              <div>グループ名</div>
              <div>公開状態</div>
              <div>掲示状態</div>
            </div>

            {/* グループリスト */}
            <div className="divide-y divide-gray-200">
              {filteredGroups.map((group) => (
                <div
                  key={group.groupId}
                  className={`grid ${
                    isRepresentMode
                      ? "grid-cols-[1fr_150px_80px]"
                      : "grid-cols-[50px_1fr_150px_80px]"
                  } gap-4 p-4 transition-colors ${
                    isRepresenting
                      ? "opacity-50 pointer-events-none"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                  onClick={
                    isRepresenting
                      ? undefined
                      : () =>
                          isRepresentMode
                            ? handleRepresent(group.groupId)
                            : handleSelectGroup(group.groupId, !selectedGroups.has(group.groupId))
                  }
                >
                  {!isRepresentMode && (
                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedGroups.has(group.groupId)}
                        onCheckedChange={(checked) =>
                          handleSelectGroup(group.groupId, checked as boolean)
                        }
                        disabled={isUpdating}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    {group.iconUrl && (
                      <img
                        src={group.iconUrl}
                        alt=""
                        className="size-10 rounded-full bg-gray-100 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{group.name}</div>
                      {group.memberCount && (
                        <div className="text-sm text-muted-foreground">
                          {group.memberCount.toLocaleString()} メンバー
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge
                      className={getVisibilityColor(group.memberVisibility)}
                      variant="secondary"
                    >
                      {getVisibilityLabel(group.memberVisibility)}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    {group.isRepresenting && (
                      <Badge className="bg-green-100 text-green-800" variant="secondary">
                        掲示中
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ローディング */}
            {isLoading && (
              <div className="p-8 text-center text-muted-foreground">読み込み中...</div>
            )}

            {groups.length === 0 && !isLoading && (
              <div className="p-8 text-center text-muted-foreground">グループが見つかりません</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
