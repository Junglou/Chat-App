  import MessageGroup from "../models/messageGroup.model.js";
  import Group from "../models/group.model.js";

  // Lấy tất cả tin nhắn trong nhóm
  export const getGroupMessages = async (req, res) => {
    try {
      const groupId = req.params.id;
      const userId = req.user._id;

      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ error: "Group not found" });

      if (!group.members.includes(userId)) {
        return res
          .status(403)
          .json({ error: "You are not a member of this group" });
      }

      const messages = await MessageGroup.find({ group: groupId })
        .populate("sender", "name email avatar")
        .sort({ createdAt: 1 });

      res.status(200).json({ messages });
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Gửi tin nhắn mới trong nhóm
  export const sendGroupMessage = async (req, res) => {
    try {
      const groupId = req.params.id;
      const userId = req.user._id;
      const { text, image } = req.body;

      if (!text && !image) {
        return res.status(400).json({ error: "Message content is required" });
      }

      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ error: "Group not found" });

      if (!group.members.includes(userId)) {
        return res
          .status(403)
          .json({ error: "You are not a member of this group" });
      }

      const message = await MessageGroup.create({
        group: groupId,
        sender: userId,
        text,
        image,
      });

      await message.populate("sender", "name email avatar");

      res.status(201).json({ message });
    } catch (err) {
      console.error("❌ Error sending message:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
