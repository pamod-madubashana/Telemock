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
  const parts = text.split(/(\/[a-zA-Z_][a-zA-Z0-9_]*(?:@\w+)?)/g);
  return parts.map((part, i) => {
    if (/^\/[a-zA-Z_][a-zA-Z0-9_]*(?:@\w+)?$/.test(part)) {
      return (
        <span
          key={i}
          className="text-primary font-medium cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onCommandClick?.(part);
          }}
        >
          {part}
        </span>
      );
    }
    return part;
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
      <div className="animate-message-in flex justify-center my-2">
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
        "animate-message-in mb-1.5 flex",
        isOwnMessage ? "animate-message-in-right" : "animate-message-in-left",
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
