import { Fragment, useMemo, useState, type ReactNode } from "react";
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
    const parts: Array<ReactNode> = [];
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

function CopyableCode({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline max-w-full bg-transparent p-0 text-left font-mono text-[12.5px] text-[#9db2d0] transition-colors duration-200 hover:bg-transparent hover:text-[#c7dbff] hover:drop-shadow-[0_0_6px_rgba(120,180,255,0.45)] whitespace-pre-wrap break-all"
      title={copied ? "Copied" : "Click to copy"}
    >
      {text}
    </button>
  );
}

function SpoilerText({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setRevealed((value) => !value)}
      className={cn(
        "inline rounded-[6px] px-1 py-0.5 transition",
        revealed
          ? "bg-white/5 text-inherit"
          : "select-none bg-white/20 text-transparent shadow-[inset_0_0_0_999px_rgba(255,255,255,0.08)]",
      )}
    >
      {children}
    </button>
  );
}

function renderRichNode(
  node: ChildNode,
  key: string,
  onCommandClick?: (cmd: string) => void,
): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return (
      <Fragment key={key}>
        {renderTextWithCommands(node.textContent ?? "", onCommandClick)}
      </Fragment>
    );
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes).map((child, index) =>
    renderRichNode(child, `${key}-${index}`, onCommandClick),
  );

  switch (tag) {
    case "b":
    case "strong":
      return <strong key={key}>{children}</strong>;
    case "i":
    case "em":
      return <em key={key}>{children}</em>;
    case "u":
      return (
        <span key={key} className="underline underline-offset-2">
          {children}
        </span>
      );
    case "s":
    case "del":
      return (
        <span key={key} className="line-through opacity-80">
          {children}
        </span>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="my-1 block border-l-2 border-primary/60 pl-3 text-foreground/90"
        >
          {children}
        </blockquote>
      );
    case "code":
      return <CopyableCode key={key} text={element.textContent ?? ""} />;
    case "tg-spoiler":
      return <SpoilerText key={key}>{children}</SpoilerText>;
    case "a": {
      const href = element.getAttribute("href") ?? element.textContent ?? "#";
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          {children.length > 0 ? children : href}
        </a>
      );
    }
    case "time":
      return (
        <time
          key={key}
          dateTime={element.getAttribute("datetime") ?? undefined}
          className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
        >
          {children}
        </time>
      );
    case "br":
      return <br key={key} />;
    default:
      return <Fragment key={key}>{children}</Fragment>;
  }
}

function FormattedMessageText({
  text,
  onCommandClick,
}: {
  text: string;
  onCommandClick?: (cmd: string) => void;
}) {
  const content = useMemo(() => {
    const doc = new DOMParser().parseFromString(
      `<body>${text}</body>`,
      "text/html",
    );

    return Array.from(doc.body.childNodes).map((node, index) =>
      renderRichNode(node, `node-${index}`, onCommandClick),
    );
  }, [text, onCommandClick]);

  return <>{content}</>;
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
        <div className="text-[13.5px] leading-[1.4] whitespace-pre-wrap break-words">
          <FormattedMessageText
            text={message.text}
            onCommandClick={onCommandClick}
          />
        </div>
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
