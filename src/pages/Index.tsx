import { useState, useCallback } from "react";
import {
  chats as initialChats,
  messages as initialMessages,
  Message,
  BotFatherState,
  CreatedBot,
  handleBotFatherMessage,
} from "@/data/mockData";
import { Sidebar } from "@/components/mockgram/Sidebar";
import { ChatView } from "@/components/mockgram/ChatView";
import { ProfileView } from "@/components/mockgram/ProfileView";

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
      name: "MockBot",
      username: "mock_test_bot",
      token: "8399914870:AAH3mANGZFUfqAU8kf1HvOHCNNvr-j6RagY",
      createdAt: new Date().toISOString(),
    },
  ]);

  const activeChat = initialChats.find((c) => c.id === activeChatId) || null;
  const currentMessages = activeChatId ? allMessages[activeChatId] || [] : [];
  const panelKey = showProfile
    ? `profile-${activeChat?.id ?? "none"}`
    : `chat-${activeChatId ?? "none"}`;

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
        // Regular bot echo
        setTimeout(() => {
          const botReply: Message = {
            id: `msg-${Date.now()}-bot`,
            chatId: activeChatId,
            senderId: "bot-1",
            text: text.startsWith("/")
              ? `Command "${text}" received. Processing in offline mode...`
              : `Echo: ${text}\n\n(Simulated bot response)`,
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
        }, 800);
      }
    },
    [activeChatId, bfState, createdBots, bfPendingName],
  );

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setShowProfile(false);
    setUnreadCounts((prev) => ({ ...prev, [id]: 0 }));
  };

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
          />
        )}
      </div>
    </div>
  );
};

export default Index;
