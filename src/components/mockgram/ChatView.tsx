import { useEffect, useRef } from "react";
import { Chat, Message } from "@/data/mockData";
import { ChatAvatar } from "./Avatar";
import { ChatTitle } from "./ChatTitle";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer, BotCommand } from "./MessageComposer";
import { MessageSquare } from "lucide-react";

const botFatherCommands: BotCommand[] = [
  { command: "newbot", description: "create a new bot" },
  { command: "mybots", description: "edit your bots" },
  { command: "setname", description: "change a bot's name" },
  { command: "setdescription", description: "change bot description" },
  { command: "setabouttext", description: "change bot about info" },
  { command: "setuserpic", description: "change bot profile photo" },
  { command: "setcommands", description: "change the list of commands" },
  { command: "deletebot", description: "delete a bot" },
  { command: "token", description: "get authorization token" },
  { command: "revoke", description: "revoke bot access token" },
  { command: "setinline", description: "toggle inline mode" },
  { command: "setinlinegeo", description: "toggle inline location requests" },
  {
    command: "setinlinefeedback",
    description: "change inline feedback settings",
  },
  { command: "setjoingroups", description: "can your bot be added to groups?" },
  { command: "setprivacy", description: "toggle privacy mode in groups" },
  { command: "myapps", description: "edit your web apps" },
  { command: "newapp", description: "create a new web app" },
  { command: "listapps", description: "get a list of your web apps" },
  { command: "editapp", description: "edit a web app" },
  { command: "deleteapp", description: "delete an existing web app" },
  { command: "mygames", description: "edit your games" },
  { command: "newgame", description: "create a new game" },
  { command: "listgames", description: "get a list of your games" },
  { command: "editgame", description: "edit a game" },
  { command: "deletegame", description: "delete an existing game" },
];

function MockBotIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full flex-col justify-end">
      <div className="mx-auto mb-[18rem] w-full max-w-sm rounded-2xl border border-white/10 bg-[#1f2937]/92 p-4 text-sm text-foreground shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <p className="text-base font-semibold text-white">
          What can this bot do?
        </p>
        <div className="mt-2 space-y-1 text-sm leading-6 text-white/85">
          <p>- Test commands against the local Bot API.</p>
          <p>- Preview formatted messages and links.</p>
          <p>- Simulate bot flows before using real Telegram.</p>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/78">
          Start the bot to open the chat and begin sending commands.
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mx-auto flex h-12 w-full max-w-[96%] items-center justify-center rounded-2xl border border-primary/20 bg-[#1b1b1d] text-sm font-semibold uppercase tracking-[0.18em] text-primary transition hover:bg-[#202124] hover:text-primary-foreground"
      >
        Start
      </button>
    </div>
  );
}

interface ChatViewProps {
  chat: Chat | null;
  messages: Message[];
  onSend: (text: string) => void;
  onOpenProfile: () => void;
}

export function ChatView({
  chat,
  messages,
  onSend,
  onOpenProfile,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-chat-bg text-muted-foreground">
        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Select a chat to start testing</p>
        <p className="text-sm mt-1">Choose a conversation from the sidebar</p>
      </div>
    );
  }

  const isGroup = chat.type === "group";
  const isChannel = chat.type === "channel";
  const isMockBot = chat.id === "chat-1";
  const showMockBotIntro = isMockBot && messages.length === 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-chat-bg">
      {/* Header - clickable to open profile */}
      <button
        onClick={onOpenProfile}
        className="h-14 px-4 flex items-center gap-3 bg-card border-b border-border flex-shrink-0 w-full text-left hover:bg-secondary/30 transition cursor-pointer"
      >
        <ChatAvatar
          initials={chat.initials}
          color={chat.color}
          avatar={chat.avatar}
          size="sm"
          online={chat.online}
        />
        <div className="flex-1 min-w-0">
          <ChatTitle
            title={chat.title}
            verified={chat.verified}
            className="text-sm font-semibold text-foreground min-w-0"
            badgeClassName="h-3.5 w-3.5"
          />
          <p className="text-xs text-muted-foreground">
            {chat.subtitle ||
              (isChannel
                ? `${chat.members} subscribers`
                : isGroup
                  ? `${chat.members} members`
                  : "bot")}
          </p>
        </div>
      </button>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 scroll-smooth"
      >
        {showMockBotIntro ? (
          <MockBotIntro onStart={() => onSend("/start")} />
        ) : (
          <div className="w-full">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={msg.senderId === "user-1"}
                showSender={isGroup || isChannel}
                onCommandClick={(cmd) => onSend(cmd)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      {!isChannel && !showMockBotIntro && (
        <MessageComposer
          onSend={onSend}
          commands={
            chat.id === "chat-botfather" ? botFatherCommands : undefined
          }
        />
      )}
    </div>
  );
}
