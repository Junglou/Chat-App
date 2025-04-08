import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore.js";

import ChatHeader from "./ChatHeader.jsx";
import MessagesInput from "./MessagesInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";

// Hàm format thời gian cho tin nhắn
const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes()}`;
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subcribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore(); // Lấy authUser từ useAuthStore()
  const messageEndRef = useRef(null);

  // Lấy danh sách tin nhắn khi có user được chọn
  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id);
    }

    subcribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, subcribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Nếu đang tải tin nhắn, hiển thị loading skeleton
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessagesInput />
      </div>
    );
  }

  // Nếu không có user được chọn, hiển thị thông báo
  if (!selectedUser) {
    return <div>No user selected</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => {
            // Xác nhận giá trị key duy nhất
            const messageKey =
              message._id || `${message.timestamp}-${message.senderId}`;
            return (
              <div
                key={messageKey} // Đảm bảo key duy nhất
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
                ref={messageEndRef}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            );
          })
        ) : (
          <div>No messages available</div>
        )}
      </div>

      <MessagesInput />
    </div>
  );
};

export default ChatContainer;
