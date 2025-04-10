import Group from "../models/group.model.js";

// Tạo group mới
export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const ownerId = req.user._id;

    const newGroup = new Group({
      name,
      description,
      members: [...new Set([...(members || []), ownerId])], // Đảm bảo owner là thành viên
      owner: ownerId,
    });

    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo group", error: error.message });
  }
};

// Lấy tất cả các group (cho admin / test)
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("members", "fullName email profilePic")
      .populate("owner", "fullName email");

    res.status(200).json(groups);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách group", error: error.message });
  }
};

// Lấy chi tiết group theo ID
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "fullName email profilePic")
      .populate("owner", "fullName email");

    if (!group) {
      return res.status(404).json({ message: "Group không tồn tại" });
    }

    res.status(200).json(group);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy group", error: error.message });
  }
};

// Thêm thành viên vào group (chỉ owner)
export const addMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group không tồn tại" });

    if (group.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Chỉ chủ group mới được thêm thành viên" });
    }

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.status(200).json({ message: "Đã thêm thành viên", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi thêm thành viên", error: error.message });
  }
};

// Xoá group (chỉ owner)
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group không tồn tại" });

    if (group.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Chỉ chủ group mới được xoá group" });
    }

    await group.deleteOne();
    res.status(200).json({ message: "Đã xoá group" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xoá group", error: error.message });
  }
};

// Lấy các group mà user đang tham gia
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("members", "fullName email profilePic")
      .populate("owner", "fullName email");

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách group của người dùng",
      error: error.message,
    });
  }
};

// Xoá thành viên khỏi group (chỉ owner, không được xoá chính mình)
export const removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group không tồn tại" });

    if (group.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Chỉ chủ group mới được xoá thành viên" });
    }

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    if (userId === group.owner.toString()) {
      return res
        .status(400)
        .json({ message: "Không thể tự xoá owner khỏi group" });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );
    await group.save();

    res.status(200).json({ message: "Đã xoá thành viên khỏi group", group });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xoá thành viên", error: error.message });
  }
};
