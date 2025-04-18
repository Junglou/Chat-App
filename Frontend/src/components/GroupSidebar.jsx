import { useEffect, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { MessageSquare, Trash2, X } from "lucide-react";

const GroupSidebar = () => {
  const { getMyGroups, groups, selectedGroup, setSelectedGroup, removeGroup } =
    useGroupStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState("");

  useEffect(() => {
    getMyGroups();
  }, [getMyGroups]);

  const handleDeleteGroup = async () => {
    if (!selectedDeleteId) return alert("Please select the group to delete.");
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this group?"
    );
    if (confirmDelete) {
      await removeGroup(selectedDeleteId);
      setSelectedDeleteId("");
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="h-full w-16 lg:w-64 border-r border-base-300 flex flex-col">
        {/* Header */}
        <div className="border-b border-base-300 w-full p-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-6" />
            <span className="font-medium hidden lg:block">Groups</span>
          </div>
        </div>

        {/* Group List */}
        <div className="overflow-y-auto w-full py-3 flex-1">
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

        {/* Delete Group Button */}
        <div className="p-3 border-t border-base-200">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2 rounded flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 size={18} />
            <span className="hidden lg:inline">Delete Group</span>
          </button>
        </div>
      </aside>

      {/* Delete Group Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Delete Group</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <select
              value={selectedDeleteId}
              onChange={(e) => setSelectedDeleteId(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4 text-sm"
            >
              <option value="">-- Select the group to delete --</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupSidebar;
