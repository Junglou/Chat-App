import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      console.log("API response:", res);

      const data = res.data;
      if (Array.isArray(data.filteredUsers)) {
        set({ users: data.filteredUsers });
      } else {
        console.warn("Expected array but got:", data);
        set({ users: [] }); // fallback
      }
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message || "Error loading user list.";
      toast.error(message);
      set({ users: [] }); // fallback để đảm bảo users luôn là array
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      // Gửi tin nhắn đến server
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      // Sau khi gửi tin nhắn thành công, gọi lại API để lấy tin nhắn mới nhất
      await get().getMessages(selectedUser._id);
    } catch (error) {
      console.error("Error while sending message:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "An error occurred while sending the message.";
      toast.error(errorMessage);
    }
  },

  subcribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
