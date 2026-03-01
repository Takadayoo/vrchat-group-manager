import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import type { GroupVisibility, VRChatGroup } from "@/types";

interface GroupListItemProps {
  group: VRChatGroup;
  isRepresentMode: boolean;
  isRepresenting: boolean;
  isUpdating: boolean;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onRepresent: () => void;
}

const getVisibilityLabel = (visibility: GroupVisibility): string => {
  const labels: Record<GroupVisibility, string> = {
    visible: "公開",
    friends: "フレンドのみ",
    hidden: "非公開",
  };
  return labels[visibility];
};

const getVisibilityColor = (visibility: GroupVisibility): string => {
  const colors: Record<GroupVisibility, string> = {
    visible: "bg-green-100 text-green-800",
    friends: "bg-blue-100 text-blue-800",
    hidden: "bg-muted text-foreground",
  };
  return colors[visibility];
};

export const GroupListItem = ({
  group,
  isRepresentMode,
  isRepresenting,
  isUpdating,
  isSelected,
  onSelect,
  onRepresent,
}: GroupListItemProps) => {
  return (
    <div
      className={`grid ${
        isRepresentMode ? "grid-cols-[1fr_150px_80px]" : "grid-cols-[50px_1fr_150px_80px]"
      } gap-4 p-4 transition-colors ${
        isRepresenting ? "opacity-50 pointer-events-none" : "hover:bg-muted/70 cursor-pointer"
      }`}
      onClick={
        isRepresenting ? undefined : () => (isRepresentMode ? onRepresent() : onSelect(!isSelected))
      }
    >
      {!isRepresentMode && (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(checked as boolean)}
            disabled={isUpdating}
          />
        </div>
      )}
      <div className="flex items-center gap-3">
        {group.iconUrl && (
          <img src={group.iconUrl} alt="" className="size-10 rounded-full bg-muted flex-shrink-0" />
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
        <Badge className={getVisibilityColor(group.memberVisibility)} variant="secondary">
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
  );
};
