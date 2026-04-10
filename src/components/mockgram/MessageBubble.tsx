import { cn } from "@/lib/utils";
import { Message, users } from "@/data/mockData";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showSender?: boolean;
  onCommandClick?: (command: string) => void;
}

function renderTextWithCommands(
  text: string,
  onCommandClick?: (cmd: string) => void,
) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).flatMap((segment, segmentIndex) => {
    if (/^https?:\/\//.test(segment)) {
      return (
        <a
          key={`url-${segmentIndex}`}
          href={segment}
          target="_blank"
          rel="noreferrer"
          className="text-primary font-medium hover:underline"
        >
          {segment}
        </a>
      );
    }

    const commandRegex = /(^|[\s(])\/[a-zA-Z_][a-zA-Z0-9_]*(?:@\w+)?/g;
    const parts: Array<React.ReactNode> = [];
    let lastIndex = 0;

    for (const match of segment.matchAll(commandRegex)) {
      const fullMatch = match[0];
      const prefix = match[1] ?? "";
      const command = fullMatch.slice(prefix.length);
      const matchIndex = match.index ?? 0;

      if (matchIndex > lastIndex) {
        parts.push(segment.slice(lastIndex, matchIndex));
      }

      if (prefix) {
        parts.push(prefix);
      }

      parts.push(
        <span
          key={`cmd-${segmentIndex}-${matchIndex}`}
          className="cursor-pointer font-medium text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onCommandClick?.(command);
          }}
        >
          {command}
        </span>,
      );

      lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < segment.length) {
      parts.push(segment.slice(lastIndex));
    }

    return parts.length > 0 ? parts : segment;
  });
}

export function MessageBubble({
  message,
  isOwnMessage,
  showSender,
  onCommandClick,
}: MessageBubbleProps) {
  if (message.type === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs px-3 py-1 rounded-full bg-bubble-system text-bubble-system-foreground">
          {message.text}
        </span>
      </div>
    );
  }

  const sender = users[message.senderId];

  return (
    <div
      className={cn(
        "mb-1.5 flex",
        isOwnMessage ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 relative",
          isOwnMessage
            ? "bg-bubble-outgoing text-bubble-outgoing-foreground rounded-br-md"
            : "bg-bubble-incoming text-bubble-incoming-foreground rounded-bl-md shadow-sm",
        )}
      >
        {showSender && !isOwnMessage && sender && (
          <p
            className="text-xs font-semibold mb-0.5"
            style={{ color: sender.color }}
          >
            {sender.name}
            {sender.isBot && (
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                bot
              </span>
            )}
          </p>
        )}
        {message.replyTo && (
          <div className="border-l-2 border-primary pl-2 mb-1.5 py-0.5">
            <p className="text-xs font-medium text-primary">
              {message.replyTo.sender}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {message.replyTo.text}
            </p>
          </div>
        )}
        <p className="text-[13.5px] leading-[1.4] whitespace-pre-wrap break-words">
          {renderTextWithCommands(message.text, onCommandClick)}
        </p>
        <div
          className={cn(
            "flex items-center justify-end gap-1 mt-0.5",
            isOwnMessage ? "-mb-0.5" : "",
          )}
        >
          <span className="text-[11px] text-timestamp">
            {message.timestamp}
          </span>
          {isOwnMessage &&
            (message.read ? (
              <CheckCheck className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Check className="w-3.5 h-3.5 text-timestamp" />
            ))}
        </div>
      </div>
    </div>
  );
}
