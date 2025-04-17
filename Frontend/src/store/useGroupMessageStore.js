import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { io } from "socket.io-client";

// Connect to Socket.IO server (ensure the server URL is correct)
export const socket = io("http://localhost:8080", {
  query: { userId: useAuthStore.getState().userId }, // Pass userId for connection
});

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
    const trimmedContent = content.trim();
    if (!trimmedContent) return; // Nếu nội dung trống, không gửi

    // Đặt trạng thái loading cho group
    get().setGroupLoading(groupId, true);

    try {
      // Gửi tin nhắn tới server
      const res = await axiosInstance.post(
        `/group-messages/${groupId}/messages`,
        { text: trimmedContent }
      );

      const newMsg = res.data.message;

      // Cập nhật vào store ngay lập tức
      set((state) => ({
        messages: {
          ...state.messages,
          [groupId]: [...(state.messages[groupId] || []), newMsg],
        },
      }));

      // Emit tin nhắn tới server để broadcast tới các người dùng khác
      socket.emit("sendGroupMessage", { groupId, message: newMsg });

      console.log("📨 Gửi group message thành công:", newMsg);
    } catch (err) {
      console.error("❌ Failed to send group message:", err);
      get().setGroupError(groupId, "Không thể gửi tin nhắn.");
    } finally {
      // Sau khi gửi xong, tắt trạng thái loading
      get().setGroupLoading(groupId, false);
    }
  },

  // Thêm tin nhắn vào store theo groupId
  addMessage: (groupId, message) => {
    set((state) => {
      const existingMessages = state.messages[groupId] || [];
      // Kiểm tra nếu tin nhắn đã tồn tại trong nhóm
      if (!existingMessages.some((msg) => msg._id === message._id)) {
        return {
          messages: {
            ...state.messages,
            [groupId]: [...existingMessages, message],
          },
        };
      }
      return state;
    });
  },

  // Nhận tin nhắn từ server qua Socket.IO
  listenForNewMessages: () => {
    socket.on("receiveGroupMessage", (data) => {
      const { groupId, message } = data;
      console.log("📩 Nhận được tin nhắn mới:", message);

      // Add the new message to the store for the correct group
      get().addMessage(groupId, message);
    });
  },

  // Kết nối và bắt đầu lắng nghe tin nhắn mới khi store được tạo
  initializeSocket: () => {
    get().listenForNewMessages();
  },
}));

// Initializing Socket connection when store is created
useGroupMessageStore.getState().initializeSocket();
