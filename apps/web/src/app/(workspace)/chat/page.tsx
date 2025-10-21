import { Chat } from "@/components/Chats/chat";
import { ChatReportPreview } from "@/components/Chats/ChatReportPreview";
import { ResultPane } from "@/components/Chats/ResultPane";
import { generateUUID } from "@/lib/utils";
import { MiniChat } from "@/components/Chats/MiniChat";

export default async function Page() {
  const id = generateUUID();

  return (
    <div className="h-screen w-full flex ">
      <div className="w-[70%]">
        <ResultPane isLoading={false}>
          <ChatReportPreview />
        </ResultPane>
      </div>
      <div className="w-[30%] border-l border-[#E9ECEF] overflow-hidden px-3">
        <MiniChat />
      </div>
    </div>
  );
}
