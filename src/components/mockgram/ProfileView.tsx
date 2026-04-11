import { Chat } from "@/data/mockData";
import { ChatAvatar } from "./Avatar";
import { ChatTitle } from "./ChatTitle";
import {
  AtSign,
  BellOff,
  ChevronLeft,
  Info,
  MessageCircle,
  MoreHorizontal,
  QrCode,
  Search,
} from "lucide-react";

interface ProfileViewProps {
  chat: Chat;
  onBack: () => void;
}

function InfoRow({
  icon: Icon,
  label,
  sublabel,
  trailing,
  className,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "flex items-center gap-4 px-6 py-3 hover:bg-secondary/50 transition"
      }
    >
      <div className="flex w-8 shrink-0 items-center justify-center">
        <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        )}
      </div>
      {trailing}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        className ??
        "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg hover:bg-secondary/50 transition text-muted-foreground hover:text-foreground"
      }
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </button>
  );
}

function IdGlyph() {
  return (
    <span className="flex h-5 w-8 items-center justify-center rounded-md border-2 border-white/30 text-[10px] font-semibold tracking-[0.2em] text-white/75">
      ID
    </span>
  );
}

function getProfileSubtitle(chat: Chat) {
  if (chat.profileSubtitle) {
    return chat.profileSubtitle;
  }

  if (chat.type === "channel") {
    return `${chat.members?.toLocaleString()} subscribers`;
  }

  if (chat.type === "group") {
    return `${chat.members} members`;
  }

  return "bot";
}

function ThemedProfileView({ chat, onBack }: ProfileViewProps) {
  const isBotFather = chat.id === "chat-botfather";
  const panelClassName =
    "flex items-center gap-4 rounded-md bg-[#3d3734] px-4 py-2.5 text-left";

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[#2c2825] scrollbar-thin">
      <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_42%),linear-gradient(180deg,_#4a4643_0%,_#3b3633_38%,_#2c2825_64%)]">
        <div className="mx-auto w-full max-w-6xl px-5 pb-5 pt-3 sm:px-8">
          <div className="flex h-10 items-center">
            <button
              onClick={onBack}
              className="rounded-full p-2 text-foreground/90 transition hover:bg-white/5"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col items-center px-4 pb-4 pt-0 text-center">
            <ChatAvatar
              initials={chat.initials}
              color={chat.color}
              avatar={chat.avatar}
              size={isBotFather ? "xl" : "lg"}
              className={isBotFather ? "scale-[0.78]" : "scale-[0.9]"}
            />
            <ChatTitle
              title={chat.title}
              verified={chat.verified}
              className={
                isBotFather
                  ? "mt-1.5 items-center text-[1.7rem] font-semibold leading-none text-white"
                  : "mt-2 items-center text-[1.5rem] font-semibold leading-none text-white"
              }
              badgeClassName={
                isBotFather ? "mt-0.5 h-4 w-4" : "mt-0.5 h-3.5 w-3.5"
              }
            />
            <p className="mt-1 text-[15px] text-white/68">
              {getProfileSubtitle(chat)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pb-2 sm:grid-cols-4 sm:gap-2.5">
            <ActionButton
              icon={MessageCircle}
              label="Open Chat"
              onClick={onBack}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-md bg-[#433d3a] text-white transition hover:bg-[#4b4440]"
            />
            <ActionButton
              icon={Search}
              label="Search"
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-md bg-[#433d3a] text-white transition hover:bg-[#4b4440]"
            />
            <ActionButton
              icon={BellOff}
              label="Mute"
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-md bg-[#433d3a] text-white transition hover:bg-[#4b4440]"
            />
            <ActionButton
              icon={MoreHorizontal}
              label="More"
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-md bg-[#433d3a] text-white transition hover:bg-[#4b4440]"
            />
          </div>

          <div className="space-y-1.5 pt-0.5">
            {chat.description && (
              <InfoRow
                icon={Info}
                label={chat.description}
                sublabel="Description"
                className={panelClassName}
              />
            )}
            {chat.username && (
              <InfoRow
                icon={AtSign}
                label={chat.username}
                sublabel="Username"
                trailing={<QrCode className="h-4 w-4 text-primary" />}
                className={panelClassName}
              />
            )}
            <InfoRow
              icon={IdGlyph}
              label={chat.profileId ?? chat.id}
              className={panelClassName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileView({ chat, onBack }: ProfileViewProps) {
  return <ThemedProfileView chat={chat} onBack={onBack} />;
}
