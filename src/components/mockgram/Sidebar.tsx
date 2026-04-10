import { Search } from "lucide-react";
import { useState } from "react";
import { Chat } from "@/data/mockData";
import { ChatListItem } from "./ChatListItem";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  unreadCounts: Record<string, number>;
}

export function Sidebar({ chats, activeChatId, onSelectChat, unreadCounts }: SidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = chats.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-[320px] flex-shrink-0 bg-sidebar-bg border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold text-foreground">Mockgram</h1>
            <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Offline Bot API Simulator</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-1.5 py-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No chats found</p>
          </div>
        ) : (
          filtered.map(chat => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onClick={() => onSelectChat(chat.id)}
              unreadCount={unreadCounts[chat.id] || 0}
            />
          ))
        )}
      </div>
    </aside>
  );
}
