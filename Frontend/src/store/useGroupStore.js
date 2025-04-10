// src/store/useGroupStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

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

  removeGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((group) => group._id !== groupId),
    })),

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
