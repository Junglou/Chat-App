import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupMessageStore = create((set, get) => ({
  messages: {}, // { [groupId]: [msg1, msg2, ...] }
  isGroupLoading: {}, // { [groupId]: true/false }
  groupErrors: {}, // { [groupId]: "error message" }

  // Set trạng thái loading theo group
  setGroupLoading: (groupId, isLoading) => {
    set((state) => ({
      isGroupLoading: {
        ...state.isGroupLoading,
        [groupId]: isLoading,
      },
    }));
  },

  // Set lỗi nếu có
  setGroupError: (groupId, error) => {
    set((state) => ({
      groupErrors: {
        ...state.groupErrors,
        [groupId]: error,
      },
    }));
  },

  // Fetch tin nhắn nhóm
  fetchMessages: async (groupId) => {
    const { messages } = get();

    if (messages[groupId]) return; // Đã có thì không gọi lại

    get().setGroupLoading(groupId, true);
    get().setGroupError(groupId, null);

    try {
      const res = await axiosInstance.get(
        `/group-messages/${groupId}/messages`
      );
      const fetchedMessages = Array.isArray(res.data.messages)
        ? res.data.messages
        : [];

      set((state) => ({
        messages: {
          ...state.messages,
          [groupId]: fetchedMessages,
        },
      }));
    } catch (err) {
      console.error("❌ Failed to fetch group messages:", err);
      get().setGroupError(groupId, "Lỗi khi tải tin nhắn nhóm.");
    } finally {
      get().setGroupLoading(groupId, false);
    }
  },

  // Gửi tin nhắn nhóm
  sendMessage: async (groupId, content) => {
    try {
      const res = await axiosInstance.post(
        `/group-messages/${groupId}/messages`,
        { text: content }
      );

      const newMsg = res.data.message;

      // Cập nhật vào store
      set((state) => ({
        messages: {
          ...state.messages,
          [groupId]: [...(state.messages[groupId] || []), newMsg],
        },
      }));

      console.log("📨 Gửi group message thành công:", newMsg);
    } catch (err) {
      console.error("❌ Failed to send group message:", err);
      get().setGroupError(groupId, "Không thể gửi tin nhắn.");
    }
  },

  // Thêm tin nhắn vào store theo groupId
  addMessage: (groupId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [groupId]: [...(state.messages[groupId] || []), message],
      },
    }));
  },
}));
