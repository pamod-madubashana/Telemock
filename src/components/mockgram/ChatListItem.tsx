import { cn } from "@/lib/utils";
import { Chat } from "@/data/mockData";
import { ChatAvatar } from "./Avatar";

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  unreadCount: number;
}

export function ChatListItem({ chat, isActive, onClick, unreadCount }: ChatListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
        isActive ? "bg-sidebar-active" : "hover:bg-sidebar-hover"
      )}
    >
      <ChatAvatar initials={chat.initials} color={chat.color} online={chat.online} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={cn("font-medium text-sm truncate", isActive && "text-primary")}>
            {chat.title}
          </span>
          <span className="text-[11px] text-timestamp flex-shrink-0 ml-2">
            {chat.lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {chat.lastMessage}
          </span>
          {unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 rounded-full bg-badge-bg text-badge-foreground text-[11px] font-medium flex items-center justify-center px-1.5">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
