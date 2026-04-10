import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const DEFAULT_TOKEN = "123:ABC";
const API_ROOT = "http://127.0.0.1:8081";

type TelegramUser = {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
};

type TelegramChat = {
  id: number;
  type: string;
  title?: string;
  first_name?: string;
  username?: string;
};

type TelegramMessage = {
  message_id: number;
  date: number;
  chat: TelegramChat;
  from?: TelegramUser;
  sender_chat?: TelegramChat;
  text: string;
};

type ChatView = {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  read_only: boolean;
  messages: TelegramMessage[];
};

type Snapshot = {
  base_url: string;
  token: string;
  bot: TelegramUser;
  chats: ChatView[];
};

type ApiResponse<T> = {
  ok: boolean;
  result: T;
};

function App() {
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeToken = token.trim() || DEFAULT_TOKEN;

  const loadSnapshot = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_ROOT}/internal/state?token=${encodeURIComponent(activeToken)}`,
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const payload = (await response.json()) as ApiResponse<Snapshot>;
      setSnapshot(payload.result);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to reach local server");
    } finally {
      setLoading(false);
    }
  }, [activeToken]);

  useEffect(() => {
    setLoading(true);
    void loadSnapshot();

    const timer = window.setInterval(() => {
      void loadSnapshot();
    }, 1500);

    return () => window.clearInterval(timer);
  }, [loadSnapshot]);

  useEffect(() => {
    if (!snapshot?.chats.length) {
      setSelectedChatId(null);
      return;
    }

    const selectedStillExists = snapshot.chats.some((chat) => chat.id === selectedChatId);
    if (selectedStillExists) {
      return;
    }

    const fallbackChat = snapshot.chats.find((chat) => !chat.read_only) ?? snapshot.chats[0];
    setSelectedChatId(fallbackChat.id);
  }, [selectedChatId, snapshot]);

  const selectedChat = useMemo(
    () => snapshot?.chats.find((chat) => chat.id === selectedChatId) ?? null,
    [selectedChatId, snapshot],
  );

  const connectionState = error ? "Server unavailable" : "Server online";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedChat || selectedChat.read_only || !draft.trim()) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch(`${API_ROOT}/internal/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: activeToken,
          chat_id: selectedChat.id,
          text: draft.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setDraft("");
      await loadSnapshot();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Offline Telegram Bot API simulator</p>
          <h1>Telemock</h1>
          <p className="hero-copy">
            A local Telegram-style client paired with a mock Bot API at <code>{API_ROOT}/bot&lt;TOKEN&gt;</code>.
          </p>
        </div>

        <div className="status-card">
          <span className={`status-dot ${error ? "offline" : "online"}`} />
          <div>
            <strong>{connectionState}</strong>
            <p>{error ?? "Use this base URL with python-telegram-bot and poll locally."}</p>
          </div>
        </div>
      </section>

      <section className="workspace">
        <aside className="sidebar">
          <div className="panel-heading">
            <div>
              <p className="section-label">Simulator</p>
              <h2>Chats</h2>
            </div>
            <span className="pill">{snapshot?.bot.username ?? "mock_bot"}</span>
          </div>

          <label className="token-field">
            <span>Bot token</span>
            <input
              value={token}
              onChange={(event) => setToken(event.currentTarget.value)}
              placeholder={DEFAULT_TOKEN}
            />
          </label>

          <div className="bot-hint">
            <span>PTB base URL</span>
            <code>{snapshot?.base_url ?? API_ROOT}/bot</code>
          </div>

          <div className="chat-list">
            {snapshot?.chats.map((chat) => {
              const lastMessage = chat.messages[chat.messages.length - 1];
              const preview = lastMessage?.text ?? chat.subtitle;
              const isActive = chat.id === selectedChatId;

              return (
                <button
                  key={chat.id}
                  className={`chat-card ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedChatId(chat.id)}
                  type="button"
                >
                  <div className="avatar">{chat.title.slice(0, 2).toUpperCase()}</div>
                  <div className="chat-copy">
                    <div className="chat-copy-row">
                      <strong>{chat.title}</strong>
                      <span>{lastMessage ? formatTime(lastMessage.date) : chat.type}</span>
                    </div>
                    <p>{preview}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="conversation-panel">
          <header className="conversation-header">
            <div>
              <p className="section-label">Active chat</p>
              <h2>{selectedChat?.title ?? "Choose a chat"}</h2>
              <p>{selectedChat?.subtitle ?? "Messages from the bot and local user appear here."}</p>
            </div>

            <div className="quick-spec">
              <span>Bot API</span>
              <code>{`${API_ROOT}/bot${activeToken}/getUpdates`}</code>
            </div>
          </header>

          <div className="message-stream">
            {!selectedChat && <div className="empty-state">No chats available yet.</div>}

            {selectedChat?.messages.length === 0 && (
              <div className="empty-state">
                Start in the UI or let your bot call <code>sendMessage</code> to populate the chat.
              </div>
            )}

            {selectedChat?.messages.map((message) => {
              const botAuthored = message.from?.is_bot ?? Boolean(message.sender_chat);

              return (
                <article
                  className={`message-bubble ${botAuthored ? "outbound" : "inbound"}`}
                  key={message.message_id}
                >
                  <div className="message-meta">
                    <span>{message.sender_chat?.title ?? message.from?.first_name ?? "Unknown"}</span>
                    <span>{formatTime(message.date)}</span>
                  </div>
                  <p>{message.text}</p>
                </article>
              );
            })}
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
              placeholder={
                selectedChat?.read_only
                  ? "Channel preview is read-only from the UI"
                  : "Type a local user message to create an update"
              }
              disabled={!selectedChat || selectedChat.read_only || sending}
              rows={2}
            />
            <button type="submit" disabled={!selectedChat || selectedChat.read_only || sending || !draft.trim()}>
              {sending ? "Sending..." : "Send update"}
            </button>
          </form>
        </section>
      </section>

      <section className="footer-panel">
        <div>
          <p className="section-label">Python test</p>
          <code>ApplicationBuilder().token(&quot;{activeToken}&quot;).base_url(&quot;{API_ROOT}/bot&quot;)</code>
        </div>
        <div>
          <p className="section-label">Supported methods</p>
          <code>getMe</code>
          <code>getUpdates</code>
          <code>sendMessage</code>
          <code>setWebhook</code>
        </div>
      </section>

      {loading && <div className="loading-banner">Booting local simulator...</div>}
    </main>
  );
}

function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default App;
