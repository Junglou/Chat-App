import { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useGroupMessageStore } from "../store/useGroupMessageStore";

const GroupChatContainer = () => {
  const { selectedGroup } = useGroupStore();
  const { messages, fetchMessages, sendMessage } = useGroupMessageStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("chat-user"));

  // Fetch messages when the group changes
  useEffect(() => {
    if (selectedGroup?._id) {
      fetchMessages(selectedGroup._id);
    }
  }, [selectedGroup, fetchMessages]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedGroup]);

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

  const groupMessages = messages?.[selectedGroup._id] || [];

  return (
    <div className="flex-1 p-4 flex flex-col">
      {/* Group Header */}
      <div className="border-b pb-2 mb-2">
        <h2 className="text-xl font-semibold">{selectedGroup.name}</h2>
        <p className="text-sm text-zinc-500">
          Members: {selectedGroup.members?.length || 0}
        </p>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto border rounded p-4 bg-base-200 space-y-2 flex flex-col">
        {groupMessages.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No messages yet...</p>
        ) : (
          groupMessages.map((msg) => {
            const isOwn = msg?.sender?._id === currentUser?._id;
            const senderName = msg?.sender?.name || "Anonymous"; // Fallback for missing sender name

            return (
              <div
                key={msg._id}
                className={`p-2 rounded shadow text-sm max-w-xs ${
                  isOwn
                    ? "bg-blue-200 self-end text-right"
                    : "bg-white self-start"
                }`}
              >
                {!isOwn && (
                  <div className="font-medium text-sm text-zinc-600 mb-1">
                    {senderName}
                  </div>
                )}
                <div>{msg?.text || "[No message]"}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input and Send Message */}
      <form onSubmit={handleSendMessage} className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="input input-bordered flex-1"
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
