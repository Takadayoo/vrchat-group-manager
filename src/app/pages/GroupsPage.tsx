import { GroupListHeader } from "@/app/components/groups/GroupListHeader";
import { GroupListItem } from "@/app/components/groups/GroupListItem";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Progress } from "@/app/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useGroupDisplay } from "@/hooks/useGroupDisplay";
import { useGroupOperations } from "@/hooks/useGroupOperations";
import type { GroupSortOption, GroupVisibility, UserInfo } from "@/types";
import { ArrowDownNarrowWide, ArrowUpNarrowWide, RefreshCw, Search } from "lucide-react";
import { useEffect } from "react";
interface GroupsPageProps {
  currentUser: UserInfo;
}

export const GroupsPage = ({ currentUser }: GroupsPageProps) => {
  const {
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
  } = useGroupOperations(currentUser.id);
  const { searchQuery, setSearchQuery, sort, setSort, filteredGroups } = useGroupDisplay(groups);

  // 初回ロード
  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-muted">
      {/* ヘッダー */}
      <div className="bg-card border-b border-border p-4 flex-shrink-0">
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
            <div className="relative">
              <Input
                placeholder="グループ名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8"
                disabled={isUpdating}
              />

              {searchQuery && !isUpdating && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <Select
            value={sort.sortBy}
            onValueChange={(value) =>
              setSort((prev) => ({ ...prev, sortBy: value as GroupSortOption["sortBy"] }))
            }
            disabled={isUpdating}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">名前順</SelectItem>
              <SelectItem value="memberCount">メンバー数順</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSort((prev) => ({
                ...prev,
                sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
              }))
            }
            disabled={isUpdating}
          >
            {sort.sortOrder === "asc" ? (
              <ArrowUpNarrowWide className="size-4" />
            ) : (
              <ArrowDownNarrowWide className="size-4" />
            )}
          </Button>
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
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {/* ヘッダー */}
            <GroupListHeader
              isRepresentMode={isRepresentMode}
              allSelected={selectedGroups.size === groups.length && groups.length > 0}
              onSelectAll={handleSelectAll}
              disabled={isUpdating}
            />

            {/* グループリスト */}
            <div className="divide-y divide-border">
              {filteredGroups.map((group) => (
                <GroupListItem
                  key={group.groupId}
                  group={group}
                  isRepresentMode={isRepresentMode}
                  isRepresenting={isRepresenting}
                  isUpdating={isUpdating}
                  isSelected={selectedGroups.has(group.groupId)}
                  onSelect={(checked) => handleSelectGroup(group.groupId, checked)}
                  onRepresent={() => handleRepresent(group.groupId)}
                />
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
