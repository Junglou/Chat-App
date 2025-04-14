import React, { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useGroupMessageStore } from "../store/useGroupMessageStore";
import { useAuthStore } from "../store/useAuthStore";

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const GroupChatContainer = () => {
  const { selectedGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const { messages, fetchMessages, sendMessage } = useGroupMessageStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const groupMessages = messages?.[selectedGroup?._id] || [];

  // Fetch messages when a new group is selected
  useEffect(() => {
    if (selectedGroup?._id) {
      fetchMessages(selectedGroup._id);
    }
  }, [selectedGroup, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !selectedGroup?._id) return;

    await sendMessage(selectedGroup._id, trimmed);
    setInput("");
  };

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-400">
        Select a group to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto p-4">
      {/* Group Header */}
      <div className="border-b pb-2 mb-4">
        <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
        <p className="text-sm text-zinc-500">
          Members: {selectedGroup.members?.length || 0}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {groupMessages.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No messages yet...</p>
        ) : (
          groupMessages.map((msg) => {
            const isOwn = msg?.sender?._id === authUser?._id;
            const messageKey = msg._id || `${msg.text}-${msg.createdAt}`;
            const senderName = isOwn ? "You" : msg?.sender?.name || "Anonymous";

            return (
              <div
                key={messageKey}
                className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={msg?.sender?.avatar || "/avatar.png"}
                      alt={senderName}
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <span className="text-sm font-medium">{senderName}</span>
                  <time className="text-xs opacity-50 ml-2">
                    {formatMessageTime(msg?.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble">
                  {msg?.image && (
                    <img
                      src={msg.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded mb-2"
                    />
                  )}
                  {msg?.text && <p>{msg.text}</p>}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
};

export default GroupChatContainer;
