import { useState } from "react";
import { useGroupStore } from "@/stores/useGroupStore";
import { Send } from "lucide-react";
import toast from "react-hot-toast";

const MessageGroupInput = ({ groupId }) => {
  const [text, setText] = useState("");
  const { sendMessage } = useGroupStore();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await sendMessage(groupId, {
        text: text.trim(),
        image: null, // Nếu backend cần field image, để null
      });

      setText("");
    } catch (error) {
      console.error("Failed to send group message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="p-4 w-full">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          className="w-full input input-bordered rounded-lg input-sm sm:input-md"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim()}
          aria-label="Send message"
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageGroupInput;
