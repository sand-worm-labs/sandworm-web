import React from "react";

import { Chat } from "@/components/Chats/chat";
import { generateUUID } from "@/lib/utils";

export default function WorkspacePage() {
  const id = generateUUID();

  return (
    <div>
      <Chat key={id} id={id} initialMessages={[]} />;
    </div>
  );
}
