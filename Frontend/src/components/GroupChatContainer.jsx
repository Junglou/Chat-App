import React, { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useGroupMessageStore } from "../store/useGroupMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import { socket } from "../store/useGroupMessageStore"; // Ensure socket is exported from store

const formatMessageTime = (dateStr) => {
  if (!dateStr) return "--:--";
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const GroupChatContainer = () => {
  const { selectedGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const { messages, fetchMessages, sendMessage } = useGroupMessageStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const groupMessages = messages?.[selectedGroup?._id] || [];

  useEffect(() => {
    if (selectedGroup?._id) {
      socket.emit("joinGroup", selectedGroup._id);
    }
    return () => {
      // Cleanup socket when component is unmounted
      if (selectedGroup?._id) {
        socket.emit("leaveGroup", selectedGroup._id);
      }
    };
  }, [selectedGroup?._id]);

  // Fetch messages
  useEffect(() => {
    if (!selectedGroup?._id) return;

    fetchMessages(selectedGroup._id);
  }, [selectedGroup?._id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !selectedGroup?._id || loading) {
      console.log("Unable to send message, conditions not met: ", {
        trimmed,
        loading,
      });
      return; // Added check for loading
    }

    setLoading(true);
    console.log("Sending message...");
    try {
      await sendMessage(selectedGroup._id, trimmed); // Send message
      console.log("Message sent.");
      setInput(""); // Clear input after sending
    } catch (err) {
      console.error("Error sending message", err);
    } finally {
      console.log("Message sending process completed.");
      setLoading(false); // Turn off loading after process completion
    }
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
      {/* Group Title */}
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
          groupMessages.map((msg, index) => {
            const senderId = msg?.sender?._id;
            const isOwn =
              senderId && authUser?._id && senderId === authUser._id;
            const messageKey = `${msg?._id}-${msg?.createdAt}-${index}`; // Using _id and createdAt with index for unique key
            const senderName = isOwn
              ? "You"
              : msg?.sender?.fullName || msg?.sender?.email || "Anonymous";

            return (
              <div
                key={messageKey} // Use unique key
                className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        isOwn
                          ? authUser.profilePic || "/avatar.png"
                          : msg?.sender?.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
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
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default GroupChatContainer;
