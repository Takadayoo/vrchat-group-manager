import type { GroupSortOption, VRChatGroup } from "@/types";
import { useState } from "react";

export const useGroupDisplay = (groups: VRChatGroup[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<GroupSortOption>({
    sortBy: "name",
    sortOrder: "asc",
  });

  const filteredGroups = groups
    .filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;

      switch (sort.sortBy) {
        case "name":
          if (a.name < b.name) comparison = -1;
          else if (a.name > b.name) comparison = 1;
          else comparison = 0;
          break;

        case "memberCount":
          comparison = (a.memberCount ?? 0) - (b.memberCount ?? 0);
          break;
      }

      return sort.sortOrder === "asc" ? comparison : -comparison;
    });

  // 返却値
  return { searchQuery, setSearchQuery, sort, setSort, filteredGroups } as const;
};
