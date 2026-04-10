import { Chat } from "@/data/mockData";
import { ChatAvatar } from "./Avatar";
import { ArrowLeft, MessageCircle, Search, BellOff, MoreHorizontal, Bot, Users, Radio, AtSign, Hash } from "lucide-react";

interface ProfileViewProps {
  chat: Chat;
  onBack: () => void;
}

function InfoRow({ icon: Icon, label, sublabel }: { icon: React.ElementType; label: string; sublabel?: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-3 hover:bg-secondary/50 transition">
      <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg hover:bg-secondary/50 transition text-muted-foreground hover:text-foreground">
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </button>
  );
}

export function ProfileView({ chat, onBack }: ProfileViewProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-card overflow-y-auto scrollbar-thin">
      {/* Back button header */}
      <div className="h-14 px-4 flex items-center border-b border-border flex-shrink-0 bg-card">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-secondary transition text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Profile hero */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <ChatAvatar initials={chat.initials} color={chat.color} size="lg" online={chat.online} />
        <div className="flex items-center gap-1.5 mt-4">
          {(chat.type === 'private') && <Bot className="w-4 h-4 text-primary" />}
          {chat.type === 'channel' && <Radio className="w-4 h-4 text-primary" />}
          {chat.type === 'group' && <Users className="w-4 h-4 text-primary" />}
          <h2 className="text-xl font-semibold text-foreground">{chat.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {chat.type === 'channel' ? `${chat.members?.toLocaleString()} subscribers` : chat.type === 'group' ? `${chat.members} members` : 'bot'}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 px-6 pb-4 border-b border-border">
        <ActionButton icon={MessageCircle} label="Open Chat" onClick={onBack} />
        <ActionButton icon={Search} label="Search" />
        <ActionButton icon={BellOff} label="Mute" />
        <ActionButton icon={MoreHorizontal} label="More" />
      </div>

      {/* Info section */}
      <div className="py-1">
        {chat.description && (
          <InfoRow
            icon={() => (
              <span className="text-base">
                {chat.type === 'private' ? '🤖' : chat.type === 'group' ? '👥' : '📢'}
              </span>
            )}
            label={chat.description}
            sublabel="Description"
          />
        )}
        {chat.username && (
          <InfoRow
            icon={AtSign}
            label={chat.username}
            sublabel="Username"
          />
        )}
        <InfoRow
          icon={Hash}
          label={chat.id}
          sublabel={chat.type === 'private' ? 'Bot ID' : 'Chat ID'}
        />
      </div>
    </div>
  );
}
