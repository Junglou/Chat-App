import { useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { MessageSquare } from "lucide-react";

const GroupSidebar = () => {
  const { getMyGroups, groups, selectedGroup, setSelectedGroup } =
    useGroupStore();

  // Load the list of groups when the component mounts
  useEffect(() => {
    getMyGroups();
  }, [getMyGroups]);

  return (
    <aside className="h-full w-16 lg:w-64 border-r border-base-300 flex flex-col">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-6" />
          <span className="font-medium hidden lg:block">Groups</span>
        </div>
      </div>

      {/* Group List */}
      <div className="overflow-y-auto w-full py-3">
        {groups.length > 0 ? (
          groups.map((group) => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                selectedGroup?._id === group._id ? "bg-base-300" : ""
              }`}
            >
              <div className="font-semibold hidden lg:block truncate">
                {group.name}
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">No Groups</div>
        )}
      </div>
    </aside>
  );
};

export default GroupSidebar;
