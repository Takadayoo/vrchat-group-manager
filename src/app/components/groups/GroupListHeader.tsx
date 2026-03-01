import { Checkbox } from "@/app/components/ui/checkbox";

interface GroupListHeaderProps {
  isRepresentMode: boolean;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  disabled: boolean;
}

export const GroupListHeader = ({
  isRepresentMode,
  allSelected,
  onSelectAll,
  disabled,
}: GroupListHeaderProps) => {
  return (
    <div
      className={`grid ${
        isRepresentMode ? "grid-cols-[1fr_150px_80px]" : "grid-cols-[50px_1fr_150px_80px]"
      } gap-4 p-4 bg-background border-b border-border font-medium text-sm`}
    >
      {!isRepresentMode && (
        <div className="flex items-center">
          <Checkbox checked={allSelected} onCheckedChange={onSelectAll} disabled={disabled} />
        </div>
      )}
      <div>グループ名</div>
      <div>公開状態</div>
      <div>掲示状態</div>
    </div>
  );
};
