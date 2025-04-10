// src/store/useGroupMessageStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useGroupMessageStore = create((set, get) => ({
  messages: {}, // { [groupId]: [msg1, msg2, ...] }

  fetchMessages: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set((state) => ({
        messages: {
          ...state.messages,
          [groupId]: res.data.messages,
        },
      }));
    } catch (err) {
      console.error("❌ Failed to fetch group messages:", err);
    }
  },

  sendMessage: async (groupId, content) => {
    try {
      const user = JSON.parse(localStorage.getItem("chat-user"));

      const res = await axiosInstance.post(`/groups/${groupId}/messages`, {
        text: content,
        sender: user?._id,
      });

      const newMsg = res.data.message;

      set((state) => ({
        messages: {
          ...state.messages,
          [groupId]: [...(state.messages[groupId] || []), newMsg],
        },
      }));
    } catch (err) {
      console.error("❌ Failed to send group message:", err);
    }
  },

  addMessage: (groupId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [groupId]: [...(state.messages[groupId] || []), message],
      },
    })),
}));
