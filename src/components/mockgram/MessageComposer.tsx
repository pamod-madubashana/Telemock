import { Menu, Mic, Paperclip, Send, Smile } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

export interface BotCommand {
  command: string;
  description: string;
}

const FOCUS_COMPOSER_EVENT = "telemock-focus-composer";

interface MessageComposerProps {
  onSend: (text: string) => void;
  commands?: BotCommand[];
}

export function MessageComposer({ onSend, commands }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<BotCommand[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const keepInputFocus = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      focusInput();
    },
    [focusInput],
  );

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    const handleWindowFocus = () => {
      focusInput();
    };
    const handleComposerFocus = () => {
      focusInput();
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener(FOCUS_COMPOSER_EVENT, handleComposerFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener(FOCUS_COMPOSER_EVENT, handleComposerFocus);
    };
  }, [focusInput]);

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
    focusInput();
  };

  const handleSelectCommand = (cmd: string) => {
    onSend("/" + cmd);
    setText("");
    setShowCommands(false);
    focusInput();
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
    <div className="relative" onMouseDown={focusInput}>
      {/* Command menu */}
      {showCommands && filteredCommands.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 bg-card border-t border-border shadow-lg max-h-64 overflow-y-auto scrollbar-thin z-50">
          {filteredCommands.map((cmd) => (
            <button
              key={cmd.command}
              onMouseDown={keepInputFocus}
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
            onMouseDown={keepInputFocus}
            onClick={() => {
              setShowCommands((prev) => !prev);
              if (!showCommands) setFilteredCommands(commands!);
              focusInput();
            }}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            Menu
          </button>
        )}

        {/* Attach */}
        <button
          onMouseDown={keepInputFocus}
          className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition"
          title="Attach"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
        />

        {/* Right icons */}
        <button
          onMouseDown={keepInputFocus}
          className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition"
          title="Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>
        {hasText ? (
          <button
            onMouseDown={keepInputFocus}
            onClick={handleSend}
            className="flex-shrink-0 p-1.5 text-primary hover:opacity-80 transition"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            onMouseDown={keepInputFocus}
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
