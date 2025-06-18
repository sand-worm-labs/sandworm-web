"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid"; // Need uuid for entityId

import { ChatMessages } from "@/components/chat-messages";
import { TextareaWithActions } from "@/components/textarea-with-actions";
import { USER_NAME, CHAT_SOURCE } from "@/constants";
import SocketIOManager, {
  ControlMessageData,
  MessageBroadcastData,
} from "@/lib/socketio-manager";
import type { ChatMessage } from "@/types/chat-message"; // Use the new type
import { assert } from "@/utils/assert"; // Import assert helper
import { getAgentMemories } from "@/lib/api-client"; // Import API client
import { getOrGenerateSeed } from "@/lib/local-storage";
import { generateQueryRoomId } from "@/lib/uuid-utils"; // Import new function
import useLocalStorage from "@/hooks/use-local-storage"; // Import the hook

// Simple spinner component
const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-zinc-600 dark:text-zinc-400"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export const Chat = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || ""; // Default to empty string if null

  // --- Use useLocalStorage for userEntity ---
  // Get or generate a persistent user entity ID
  const [userEntity, _setUserEntity] = useLocalStorage<string>(
    "elizaHowUserEntity",
    uuidv4,
  );
  // Note: We don't typically need setUserEntity here, but the hook provides it.

  // --- State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);
  const [worldId, setWorldId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null); // Query-specific Room UUID
  const [seed, setSeed] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false); // New state

  // --- Refs ---
  const initStartedRef = useRef(false);

  // --- Socket Manager ---
  const socketIOManager = SocketIOManager.getInstance();

  // --- Get Seed --- (Runs once on mount)
  useEffect(() => {
    const storedSeed = getOrGenerateSeed();
    setSeed(storedSeed);
  }, []);

  // --- Calculate Query-Specific Room ID --- (Runs when seed or query changes)
  useEffect(() => {
    if (seed && query) {
      const queryRoomId = generateQueryRoomId(seed, query);
      setRoomId(queryRoomId); // Set the generated query-specific room ID
      console.log(`[Chat RoomID] Calculated Query Room ID: ${queryRoomId}`);
    } else {
      setRoomId(null);
    }
  }, [seed, query]);

  // --- Send Message Logic --- (Uses the query-specific roomId)
  const sendMessage = useCallback(
    (
      messageText: string,
      currentRoomId: string | null, // This IS the query-specific Room ID
      currentWorldId: string | null,
    ) => {
      assert(
        messageText !== undefined && messageText !== null,
        `[Chat sendMessage] Invalid messageText: ${messageText}`,
      );
      assert(
        currentRoomId && typeof currentRoomId === "string",
        `[Chat sendMessage] Invalid currentRoomId (Query Room ID): ${currentRoomId}`,
      );
      assert(
        currentWorldId && typeof currentWorldId === "string",
        `[Chat sendMessage] Invalid currentWorldId: ${currentWorldId}`,
      );

      if (
        !messageText.trim() ||
        !userEntity ||
        !currentRoomId ||
        !currentWorldId ||
        inputDisabled
      ) {
        console.warn(
          "[Chat sendMessage] Send cancelled due to invalid params or disabled input.",
        );
        return;
      }

      const userMessage: ChatMessage = {
        id: uuidv4(),
        name: USER_NAME,
        text: messageText,
        senderId: userEntity,
        roomId: currentRoomId,
        createdAt: Date.now(),
        source: `${CHAT_SOURCE}:${USER_NAME}`,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsAgentThinking(true); // Start thinking when user sends message

      socketIOManager.sendMessage(
        messageText,
        currentRoomId,
        userMessage.source,
      );
    },
    [inputDisabled, socketIOManager, userEntity],
  );

  // --- Initialization & Load Messages from API ---
  useEffect(() => {
    if (!roomId || !userEntity || initStartedRef.current) {
      if (!initStartedRef.current) {
        console.log("[Chat Init] Waiting for Room ID and User Entity.", {
          hasRoomId: !!roomId,
          hasUserEntity: !!userEntity,
        });
      }
      return;
    }
    initStartedRef.current = true;

    const agent =
      process.env.NEXT_PUBLIC_AGENT_ID ||
      "2ed1ddb3-67d2-09c9-9eed-c7791ee7bb54";
    const world =
      process.env.NEXT_PUBLIC_WORLD_ID ||
      "00000000-0000-0000-0000-000000000000";
    if (!agent || !world) {
      console.error("[Chat Init] Missing required environment variables.");
      setInputDisabled(true);
      setIsLoadingHistory(false); // Stop loading on error
      return;
    }

    setWorldId(world);
    setIsLoadingHistory(true);

    console.log(
      `[Chat Init] Initializing. Agent: ${agent}, Entity: ${userEntity}, Room (Query-Specific): ${roomId}`,
    );

    let historyLoaded = false;
    let loadedMessagesCount = 0;
    assert(
      agent && roomId,
      "[Chat Load API] Agent ID or Room ID missing before fetch",
    );
    getAgentMemories(agent, roomId)
      .then((loadedMessages) => {
        console.log(
          `[Chat Load API] Loaded ${loadedMessages.length} messages for Room ${roomId}.`,
        );
        setMessages(loadedMessages);
        historyLoaded = true;
        loadedMessagesCount = loadedMessages.length;
      })
      .catch((error) => {
        console.error(
          `[Chat Load API] Failed to load messages for Room ${roomId}:`,
          error,
        );
        historyLoaded = true;
        loadedMessagesCount = 0;
      })
      .finally(() => {
        setIsLoadingHistory(false);
        if (query && historyLoaded && loadedMessagesCount === 0) {
          console.log(
            "[Chat Init] No history loaded, sending initial query:",
            query,
          );
          assert(
            userEntity && roomId && world,
            "[Chat Init] Missing IDs for initial send",
          );
          if (userEntity && roomId && world) {
            sendMessage(query, roomId, world);
          }
        } else if (query) {
          console.log(
            `[Chat Init] Conditions not met for sending initial query. Query: ${!!query}, HistoryLoaded: ${historyLoaded}, LoadedCount: ${loadedMessagesCount}`,
          );
        }
      });

    socketIOManager.initialize(userEntity, [agent]);
    assert(
      roomId && typeof roomId === "string",
      "[Chat Init] Invalid room ID before joinRoom",
    );
    socketIOManager.joinRoom(roomId);

    const handleMessage = (data: MessageBroadcastData) => {
      assert(data?.roomId, "[Chat handleMessage] Missing roomId");
      if (!roomId || data.roomId !== roomId) {
        console.warn(
          `[Chat handleMessage] Ignoring message for different room. Expected: ${roomId}, Received: ${data.roomId}`,
        );
        return;
      }
      assert(
        userEntity,
        "[Chat handleMessage] User entity ID from hook is null",
      );
      const isCurrentUser = data.senderId === userEntity;
      assert(data, "[Chat handleMessage] Received null/undefined data.");
      if (!data) return;
      assert(
        typeof data.senderId === "string",
        `[Chat handleMessage] Invalid senderId: ${data.senderId}`,
      );
      assert(
        typeof data.senderName === "string" || typeof data.name === "string",
        `[Chat handleMessage] Missing senderName/name: ${JSON.stringify(data)}`,
      );
      assert(
        data.text !== undefined || data.thought !== undefined,
        `[Chat handleMessage] Missing both text and thought: ${JSON.stringify(data)}`,
      );

      const newMessage: ChatMessage = {
        id: data.id || uuidv4(),
        name: isCurrentUser ? USER_NAME : data.senderName || "Agent",
        text: data.text || (data.thought ? `*${data.thought}*` : ""),
        senderId: data.senderId,
        roomId: data.roomId,
        createdAt: data.createdAt || Date.now(),
        isLoading: false,
        source: data.source,
        thought: data.thought,
        actions: data.actions,
      };
      console.log(
        "[Chat handleMessage] Adding new message to state:",
        newMessage,
      );

      setMessages((prev) => {
        console.log("[Chat setMessages] Previous state:", prev);
        const isDuplicate = prev.some(
          (msg) =>
            (msg.id && msg.id === newMessage.id) ||
            (msg.senderId === newMessage.senderId &&
              msg.text === newMessage.text &&
              Math.abs((msg.createdAt || 0) - (newMessage.createdAt || 0)) <
                2000), // Increased tolerance slightly
        );

        if (isDuplicate) {
          console.log("[Chat setMessages] Skipping duplicate.");
          return prev;
        }
        const newState = [...prev, newMessage];
        console.log("[Chat setMessages] New state:", newState);
        if (newMessage.name !== USER_NAME) {
          setIsAgentThinking(false); // Stop thinking when agent message arrives
        }
        return newState;
      });
    };

    const handleControl = (data: ControlMessageData) => {
      assert(data?.roomId, "[Chat handleControl] Missing roomId");
      if (!roomId || data.roomId !== roomId) {
        console.warn(
          `[Chat handleControl] Ignoring message for different room. Expected: ${roomId}, Received: ${data.roomId}`,
        );
        return;
      }
      assert(data, "[Chat handleControl] Received null/undefined data.");
      if (!data) return;
      assert(
        data.action === "enable_input" || data.action === "disable_input",
        `[Chat handleControl] Invalid action: ${data.action}`,
      );
      setInputDisabled(data.action === "disable_input");
      // Also update thinking state based on input control if needed,
      // though typically message arrival is a better signal.
      // If input is enabled, agent is likely done.
      if (data.action === "enable_input") {
        setIsAgentThinking(false);
      }
    };

    const msgHandler =
      socketIOManager.evtMessageBroadcast.attach(handleMessage);
    const ctrlHandler = socketIOManager.evtControlMessage.attach(handleControl);

    return () => {
      initStartedRef.current = false;
      console.log(`[Chat Cleanup] Leaving room ${roomId}.`);
      if (roomId) {
        socketIOManager.leaveRoom(roomId);
      }
      msgHandler?.detach();
      ctrlHandler?.detach();
    };
  }, [roomId, query, sendMessage, userEntity]);

  // --- Event Handlers ---
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      console.log("[Chat handleSubmit] Triggered.");
      if (e) e.preventDefault();
      assert(roomId, "[Chat handleSubmit] roomId (conversationId) is null.");
      if (!roomId) {
        console.error(
          "[Chat handleSubmit] Cannot send, roomId (conversationId) is null.",
        );
        return;
      }
      sendMessage(input, roomId, worldId);
      setInput("");
    },
    [input, roomId, worldId, sendMessage],
  );

  const handleFollowUpClick = useCallback(
    (prompt: string) => {
      console.log("[Chat handleFollowUpClick] Triggered with prompt:", prompt);
      assert(
        roomId,
        "[Chat handleFollowUpClick] roomId (conversationId) is null.",
      );
      if (userEntity && roomId && worldId) {
        const userMessage: ChatMessage = {
          id: uuidv4(),
          name: USER_NAME,
          text: prompt,
          senderId: userEntity,
          roomId: roomId,
          createdAt: Date.now(),
          source: `${CHAT_SOURCE}:${USER_NAME}:followup`,
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsAgentThinking(true); // Start thinking on follow-up click
        sendMessage(prompt, roomId, worldId);
      } else {
        console.error("Cannot send follow-up: Missing IDs");
      }
    },
    [userEntity, roomId, worldId, sendMessage],
  );

  // --- Derived State / Memos ---
  const followUpPromptsMap = useMemo(() => {
    return {} as Record<number, string[]>;
  }, []);

  // --- Render ---
  console.log("[Chat Render] Rendering with messages:", messages);
  return (
    <main className="flex flex-col min-h-dvh">
      <div className="flex-1 relative md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] mx-auto w-full px-4 md:px-0">
        {isLoadingHistory && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <p>Loading conversation...</p>
          </div>
        )}
        <div className="pt-24 pb-40">
          <ChatMessages
            messages={messages}
            citationsMap={{}}
            followUpPromptsMap={followUpPromptsMap}
            onFollowUpClick={handleFollowUpClick}
          />
          {isAgentThinking && (
            <div className="flex items-center justify-start gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-4 ml-1">
              <LoadingSpinner />
              <span>Thinking...</span>
            </div>
          )}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 bg-background pb-4 pt-0.5">
        <div className="max-w-3xl mx-auto px-4 md:px-0">
          <TextareaWithActions
            input={input}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={inputDisabled}
          />
        </div>
      </div>
    </main>
  );
};
