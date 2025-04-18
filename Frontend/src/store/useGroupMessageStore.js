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

  // Set loading state by group
  setGroupLoading: (groupId, isLoading) => {
    set((state) => ({
      isGroupLoading: {
        ...state.isGroupLoading,
        [groupId]: isLoading,
      },
    }));
  },

  // Set error if any
  setGroupError: (groupId, error) => {
    set((state) => ({
      groupErrors: {
        ...state.groupErrors,
        [groupId]: error,
      },
    }));
  },

  // Fetch group messages
  fetchMessages: async (groupId) => {
    const { messages } = get();

    if (messages[groupId]) return; // Already fetched, no need to call again

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
      get().setGroupError(groupId, "Error loading group messages.");
    } finally {
      get().setGroupLoading(groupId, false);
    }
  },

  // Send group message
  sendMessage: async (groupId, content) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return; // If content is empty, don't send

    // Set loading state for the group
    get().setGroupLoading(groupId, true);

    try {
      // Send message to the server
      const res = await axiosInstance.post(
        `/group-messages/${groupId}/messages`,
        { text: trimmedContent }
      );

      const newMsg = res.data.message;

      // Update store immediately
      set((state) => ({
        messages: {
          ...state.messages,
          [groupId]: [...(state.messages[groupId] || []), newMsg],
        },
      }));

      // Emit message to the server to broadcast to other users
      socket.emit("sendGroupMessage", { groupId, message: newMsg });

      console.log("📨 Successfully sent group message:", newMsg);
    } catch (err) {
      console.error("❌ Failed to send group message:", err);
      get().setGroupError(groupId, "Unable to send message.");
    } finally {
      // After sending, disable loading state
      get().setGroupLoading(groupId, false);
    }
  },

  // Add message to store by groupId
  addMessage: (groupId, message) => {
    set((state) => {
      const existingMessages = state.messages[groupId] || [];
      // Check if the message already exists in the group
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

  // Receive message from server via Socket.IO
  listenForNewMessages: () => {
    socket.on("receiveGroupMessage", (data) => {
      const { groupId, message } = data;
      console.log("📩 Received new message:", message);

      // Add the new message to the store for the correct group
      get().addMessage(groupId, message);
    });
  },

  // Connect and start listening for new messages when the store is created
  initializeSocket: () => {
    get().listenForNewMessages();
  },
}));

// Initializing Socket connection when store is created
useGroupMessageStore.getState().initializeSocket();
