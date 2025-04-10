import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/lib/axios";
import { useGroupStore } from "@/stores/useGroupStore";

const CreateGroupModal = ({ isOpen, onClose, allUsers = [] }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const { getMyGroups, setSelectedGroup } = useGroupStore();

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      const response = await axiosInstance.post("/groups", {
        name: groupName,
        description,
        members: selectedMembers,
      });

      console.log("✅ Tạo group thành công:", response.data);

      // Đồng bộ với store
      await getMyGroups();
      setSelectedGroup(response.data);

      // Reset form
      setGroupName("");
      setDescription("");
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error(
        "❌ Lỗi khi tạo group:",
        error?.response?.data || error.message
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="h-40 overflow-y-auto border rounded p-2 space-y-1">
            {allUsers.map((user) => (
              <div key={user._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`user-${user._id}`}
                  checked={selectedMembers.includes(user._id)}
                  onChange={() => toggleMember(user._id)}
                />
                <label htmlFor={`user-${user._id}`}>{user.name}</label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
