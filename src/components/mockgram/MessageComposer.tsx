import {
  Bold,
  CalendarDays,
  Code2,
  Italic,
  Link2,
  Menu,
  Mic,
  Paperclip,
  Quote,
  Send,
  Smile,
  Strikethrough,
  Underline,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BotCommand {
  command: string;
  description: string;
}

interface MessageComposerProps {
  onSend: (text: string) => void;
  commands?: BotCommand[];
}

type FormattingAction =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "quote"
  | "mono"
  | "spoiler"
  | "date"
  | "link";

const formattingOptions: Array<{
  action: FormattingAction;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}> = [
  { action: "bold", label: "Bold", Icon: Bold },
  { action: "italic", label: "Italic", Icon: Italic },
  { action: "underline", label: "Underline", Icon: Underline },
  { action: "strikethrough", label: "Strikethrough", Icon: Strikethrough },
  { action: "quote", label: "Quote", Icon: Quote },
  { action: "mono", label: "Mono", Icon: Code2 },
  { action: "spoiler", label: "Spoiler", Icon: EyeOffGlyph },
  { action: "date", label: "Date", Icon: CalendarDays },
  { action: "link", label: "Create Link", Icon: Link2 },
];

function EyeOffGlyph({ className }: { className?: string }) {
  return <span className={className}>#</span>;
}

function FormattingGlyph({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="flex h-full w-full flex-col items-center justify-center gap-[3px]">
        <span className="h-[1.5px] w-4 rounded-full bg-current" />
        <span className="h-[1.5px] w-3 rounded-full bg-current" />
        <span className="h-[1.5px] w-4 rounded-full bg-current" />
      </span>
    </span>
  );
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function MessageComposer({ onSend, commands }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<BotCommand[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!commands?.length) {
      setShowCommands(false);
      return;
    }
    if (text === "/") {
      setFilteredCommands(commands);
      setShowCommands(true);
    } else if (text.startsWith("/") && text.length > 1 && !text.includes(" ")) {
      const q = text.slice(1).toLowerCase();
      const matched = commands.filter((c) =>
        c.command.toLowerCase().includes(q),
      );
      setFilteredCommands(matched);
      setShowCommands(matched.length > 0);
    } else {
      setShowCommands(false);
    }
  }, [text, commands]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    setShowCommands(false);
  };

  const handleSelectCommand = (cmd: string) => {
    onSend("/" + cmd);
    setText("");
    setShowCommands(false);
  };

  const syncSelection = () => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    selectionRef.current = {
      start: input.selectionStart ?? 0,
      end: input.selectionEnd ?? 0,
    };
  };

  const applyFormatting = (action: FormattingAction) => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    const start = selectionRef.current.start;
    const end = selectionRef.current.end;
    const selectedText = text.slice(start, end);

    let inserted = "";
    let cursorStart = 0;
    let cursorEnd = 0;

    switch (action) {
      case "bold":
        inserted = `<b>${selectedText || "bold text"}</b>`;
        break;
      case "italic":
        inserted = `<i>${selectedText || "italic text"}</i>`;
        break;
      case "underline":
        inserted = `<u>${selectedText || "underlined text"}</u>`;
        break;
      case "strikethrough":
        inserted = `<s>${selectedText || "strikethrough text"}</s>`;
        break;
      case "quote":
        inserted = `<blockquote>${selectedText || "quoted text"}</blockquote>`;
        break;
      case "mono":
        inserted = `<code>${selectedText || "monospace"}</code>`;
        break;
      case "spoiler":
        inserted = `<tg-spoiler>${selectedText || "spoiler"}</tg-spoiler>`;
        break;
      case "date": {
        const displayText = selectedText || new Date().toLocaleDateString();
        inserted = `<time datetime="${new Date().toISOString()}">${displayText}</time>`;
        break;
      }
      case "link": {
        const url = window.prompt("Enter the link URL", "https://");

        if (!url) {
          return;
        }

        const label = selectedText || url;
        inserted = `<a href="${escapeAttribute(url)}">${label}</a>`;
        break;
      }
    }

    const nextText = `${text.slice(0, start)}${inserted}${text.slice(end)}`;
    const replacementStart = text.slice(0, start).length;
    const replacementEnd = replacementStart + inserted.length;

    if (selectedText) {
      cursorStart = replacementEnd;
      cursorEnd = replacementEnd;
    } else {
      cursorStart = replacementStart + inserted.indexOf(">") + 1;
      cursorEnd = replacementStart + inserted.lastIndexOf("<");
    }

    setText(nextText);

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(cursorStart, cursorEnd);
      selectionRef.current = { start: cursorStart, end: cursorEnd };
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") setShowCommands(false);
  };

  const hasText = text.trim().length > 0;
  const hasCommands = commands && commands.length > 0;

  return (
    <div className="relative">
      {/* Command menu */}
      {showCommands && filteredCommands.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 bg-card border-t border-border shadow-lg max-h-64 overflow-y-auto scrollbar-thin z-50">
          {filteredCommands.map((cmd) => (
            <button
              key={cmd.command}
              onClick={() => handleSelectCommand(cmd.command)}
              className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-secondary/60 transition text-left"
            >
              <span className="text-primary text-sm font-medium flex-shrink-0">
                /{cmd.command}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {cmd.description}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="px-3 py-2 bg-composer-bg border-t border-border flex items-center gap-1.5">
        {/* Menu button */}
        {hasCommands && (
          <button
            onClick={() => {
              setShowCommands((prev) => !prev);
              if (!showCommands) setFilteredCommands(commands!);
            }}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            Menu
          </button>
        )}

        {/* Attach */}
        <button
          className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition"
          title="Attach"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition"
              title="Formatting"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
            >
              <FormattingGlyph className="block h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {formattingOptions.map(({ action, label, Icon }) => (
              <DropdownMenuItem
                key={action}
                className="gap-3"
                onSelect={() => applyFormatting(action)}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onClick={syncSelection}
          onKeyDown={handleKeyDown}
          onKeyUp={syncSelection}
          onSelect={syncSelection}
          placeholder="Message"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
        />

        {/* Right icons */}
        <button
          className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition"
          title="Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>
        {hasText ? (
          <button
            onClick={handleSend}
            className="flex-shrink-0 p-1.5 text-primary hover:opacity-80 transition"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition"
            title="Voice"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
