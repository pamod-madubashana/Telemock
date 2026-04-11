import { useCallback, useEffect, useState } from "react";
import {
  chats as initialChats,
  messages as initialMessages,
  Message,
  BotFatherState,
  CreatedBot,
  MOCK_BOT_NAME,
  MOCK_BOT_TOKEN,
  MOCK_BOT_USERNAME,
  handleBotFatherMessage,
} from "@/data/mockData";
import { Sidebar } from "@/components/mockgram/Sidebar";
import { ChatView } from "@/components/mockgram/ChatView";
import { ProfileView } from "@/components/mockgram/ProfileView";

const SIMULATOR_BASE_URL = "http://127.0.0.1:8443";

const frontendChatIdBySimulatorId: Record<number, string> = {
  1: "chat-1",
  [-1001]: "chat-2",
  [-1002]: "chat-3",
};

const simulatorChatIdByFrontendId: Record<string, number> = {
  "chat-1": 1,
  "chat-2": -1001,
  "chat-3": -1002,
};

interface InternalChatMessage {
  message_id: number;
  date: number;
  text: string;
  from?: {
    is_bot: boolean;
  };
  sender_chat?: {
    id: number;
  };
}

interface InternalChatSnapshot {
  id: number;
  type: "private" | "group" | "channel";
  messages: InternalChatMessage[];
}

interface InternalStateSnapshot {
  chats: InternalChatSnapshot[];
}

function formatSimulatorTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapSimulatorMessage(
  chatId: string,
  message: InternalChatMessage,
): Message {
  const isBotMessage = message.from?.is_bot ?? Boolean(message.sender_chat);

  return {
    id: `sim-${chatId}-${message.message_id}`,
    chatId,
    senderId: isBotMessage ? "bot-1" : "user-1",
    text: message.text,
    timestamp: formatSimulatorTime(message.date),
    type: message.text.startsWith("/") ? "command" : "text",
    read: true,
  };
}

const Index = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(
    "chat-botfather",
  );
  const [showProfile, setShowProfile] = useState(false);
  const [allMessages, setAllMessages] =
    useState<Record<string, Message[]>>(initialMessages);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialChats.map((c) => [c.id, c.unreadCount])),
  );

  // BotFather state
  const [bfState, setBfState] = useState<BotFatherState>("idle");
  const [bfPendingName, setBfPendingName] = useState<string | undefined>();
  const [createdBots, setCreatedBots] = useState<CreatedBot[]>([
    {
      name: MOCK_BOT_NAME,
      username: MOCK_BOT_USERNAME,
      token: MOCK_BOT_TOKEN,
      createdAt: new Date().toISOString(),
    },
  ]);

  const activeChat = initialChats.find((c) => c.id === activeChatId) || null;
  const currentMessages = activeChatId ? allMessages[activeChatId] || [] : [];
  const panelKey = showProfile
    ? `profile-${activeChat?.id ?? "none"}`
    : `chat-${activeChatId ?? "none"}`;

  const syncSimulatorState = useCallback(async () => {
    const response = await fetch(
      `${SIMULATOR_BASE_URL}/internal/state?token=${encodeURIComponent(MOCK_BOT_TOKEN)}`,
    );

    if (!response.ok) {
      throw new Error(`Simulator sync failed with HTTP ${response.status}`);
    }

    const payload = (await response.json()) as {
      result: InternalStateSnapshot;
    };

    setAllMessages((prev) => {
      const next = { ...prev };

      payload.result.chats.forEach((chat) => {
        const frontendChatId = frontendChatIdBySimulatorId[chat.id];

        if (!frontendChatId) {
          return;
        }

        next[frontendChatId] = chat.messages.map((message) =>
          mapSimulatorMessage(frontendChatId, message),
        );
      });

      return next;
    });
  }, []);

  const appendSystemMessage = useCallback((chatId: string, text: string) => {
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      chatId,
      senderId: "system",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "system",
    };

    setAllMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), systemMessage],
    }));
  }, []);

  const sendToSimulator = useCallback(
    async (chatId: string, text: string) => {
      const simulatorChatId = simulatorChatIdByFrontendId[chatId];

      if (simulatorChatId === undefined) {
        return;
      }

      const response = await fetch(`${SIMULATOR_BASE_URL}/internal/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: MOCK_BOT_TOKEN,
          chat_id: simulatorChatId,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Simulator send failed with HTTP ${response.status}`);
      }

      await syncSimulatorState();
    },
    [syncSimulatorState],
  );

  useEffect(() => {
    let cancelled = false;

    const runSync = async () => {
      try {
        await syncSimulatorState();
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to sync Telemock state", error);
        }
      }
    };

    void runSync();

    const intervalId = window.setInterval(() => {
      void runSync();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [syncSimulatorState]);

  const handleSend = useCallback(
    (text: string) => {
      if (!activeChatId) return;

      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        chatId: activeChatId,
        senderId: "user-1",
        text,
        timestamp: now,
        type: text.startsWith("/") ? "command" : "text",
        read: false,
      };

      setAllMessages((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), userMsg],
      }));

      // BotFather chat handling
      if (activeChatId === "chat-botfather") {
        setTimeout(() => {
          const result = handleBotFatherMessage(
            text,
            bfState,
            createdBots,
            bfPendingName,
          );
          setBfState(result.newState);
          setBfPendingName(result.pendingName);

          if (result.newBot) {
            setCreatedBots((prev) => [...prev, result.newBot!]);
          }
          if (result.deletedUsername) {
            setCreatedBots((prev) =>
              prev.filter((b) => b.username !== result.deletedUsername),
            );
          }
          if (result.renamedBot) {
            setCreatedBots((prev) =>
              prev.map((b) =>
                b.username === result.renamedBot!.username
                  ? { ...b, name: result.renamedBot!.newName }
                  : b,
              ),
            );
          }

          const botReply: Message = {
            id: `msg-${Date.now()}-bf`,
            chatId: activeChatId,
            senderId: "botfather",
            text: result.reply,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "text",
          };
          setAllMessages((prev) => ({
            ...prev,
            [activeChatId]: [...(prev[activeChatId] || []), botReply],
          }));
        }, 500);
      } else {
        void sendToSimulator(activeChatId, text).catch((error) => {
          console.error("Failed to send message to Telemock", error);
          appendSystemMessage(
            activeChatId,
            `Local Bot API error: ${error instanceof Error ? error.message : "unknown error"}`,
          );
        });
      }
    },
    [
      activeChatId,
      appendSystemMessage,
      bfPendingName,
      bfState,
      createdBots,
      sendToSimulator,
    ],
  );

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setShowProfile(false);
    setUnreadCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleMessageLinkClick = useCallback(
    (href: string) => {
      try {
        const url = new URL(href);
        const username =
          url.hostname === "t.me" ? url.pathname.replace(/^\//, "") : "";

        if (username === MOCK_BOT_USERNAME) {
          handleSelectChat("chat-1");
          return true;
        }
      } catch {
        return false;
      }

      return false;
    },
    [handleSelectChat],
  );

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        chats={initialChats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        unreadCounts={unreadCounts}
      />
      <div key={panelKey} className="animate-panel-enter flex min-w-0 flex-1">
        {showProfile && activeChat ? (
          <ProfileView chat={activeChat} onBack={() => setShowProfile(false)} />
        ) : (
          <ChatView
            chat={activeChat}
            messages={currentMessages}
            onSend={handleSend}
            onOpenProfile={() => setShowProfile(true)}
            onLinkClick={handleMessageLinkClick}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
