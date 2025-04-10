import GroupSidebar from "../components/GroupSidebar";
import GroupChatContainer from "../components/GroupChatContainer";

const GroupPage = () => {
  return (
    <div className="mt-16 flex justify-center items-start h-[calc(100vh-4rem)]">
      <div className="flex border rounded-xl shadow-lg overflow-hidden w-full max-w-5xl h-full">
        <GroupSidebar />
        <GroupChatContainer />
      </div>
    </div>
  );
};

export default GroupPage;
