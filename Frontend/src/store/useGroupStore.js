// src/store/useGroupStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,

  getMyGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups/me");
      set({ groups: res.data });
    } catch (err) {
      console.error("❌ Failed to fetch groups:", err);
    }
  },

  addGroup: (newGroup) =>
    set((state) => ({
      groups: [...state.groups, newGroup],
    })),

  removeGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      set((state) => ({
        groups: state.groups.filter((group) => group._id !== groupId),
      }));
      toast.success("✅ Group has been successfully deleted!");
    } catch (err) {
      console.error("❌ Error deleting group:", err);

      if (err.response && err.response.status === 403) {
        toast.error("❌ You do not have permission to delete this group.");
      } else {
        toast.error(
          "❌ An error occurred while deleting the group. Please try again later."
        );
      }
    }
  },

  updateGroup: (updatedGroup) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group._id === updatedGroup._id ? updatedGroup : group
      ),
    })),

  setSelectedGroup: (group) => set({ selectedGroup: group }),

  clearGroups: () => set({ groups: [], selectedGroup: null }),

  getGroupById: (id) => {
    const { groups } = get();
    return groups.find((group) => group._id === id) || null;
  },

  isOwner: (groupId, userId) => {
    const { groups } = get();
    const group = groups.find((g) => g._id === groupId);
    return group?.owner === userId;
  },
}));
