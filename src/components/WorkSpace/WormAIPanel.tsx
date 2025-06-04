"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from "lucide-react";
import { useState } from "react";
import { LandingTextarea } from "./WormAI/LandingTextArea";

interface Message {
  role: "user" | "ai";
  content: string;
}

export const WormAiPanel = () => {
  const [messages] = useState<Message[]>([]);

  return (
    <Card className="h-full flex flex-col dark rounded-none pb-3 w-full">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className=" font-medium">Data Explorer</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className=" overflow-hidden w-full h-full flex flex-col justify-center items-center">
        <div className="text-2xl font-medium text-white text-center mb-7">
          Ask about Sandworm
        </div>
        <ScrollArea className=" pr-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-muted self-end text-right"
                    : "bg-transparent self-start"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        </ScrollArea>
        <LandingTextarea />
      </CardContent>
    </Card>
  );
};
