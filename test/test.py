import asyncio
import json
import os
from datetime import datetime
from typing import Any
from urllib.error import HTTPError
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from telegram import BotCommand, Update
from telegram.ext import Application, CommandHandler, ContextTypes


BOT_TOKEN = os.getenv(
    "BOT_TOKEN", "8399914870:AAH3mANGZFUfqAU8kf1HvOHCNNvr-j6RagY"
)
SIMULATOR_BASE_URL = os.getenv("TELEMOCK_BASE_URL", "http://127.0.0.1:8443").rstrip("/")

COMMANDS = [
    BotCommand("start", "Start the bot"),
    BotCommand("help", "Show available commands"),
    BotCommand("ping", "Check bot status"),
    BotCommand("about", "Show bot info"),
]


def log(message: str) -> None:
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [ptb-bot] {message}")


def short_text(text: str, limit: int = 80) -> str:
    if len(text) <= limit:
        return text
    return text[: limit - 3] + "..."


def current_chat_id(update: Update) -> str:
    chat = update.effective_chat
    return str(chat.id) if chat is not None else "unknown"


async def reply(update: Update, text: str) -> None:
    message = update.effective_message
    if message is not None:
        await message.reply_text(text)
        log(f"Sent reply to chat_id={current_chat_id(update)} text={short_text(text)!r}")


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    log(f"Received /start from chat_id={current_chat_id(update)}")
    await reply(update, "Hello! I am your PTB bot running inside Telemock.")


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    log(f"Received /help from chat_id={current_chat_id(update)}")
    await reply(
        update,
        "/start - start the bot\n/help - show commands\n/ping - check bot status\n/about - bot info",
    )


async def ping_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_label = current_chat_id(update)
    log(f"Received /ping from chat_id={chat_label}")
    await reply(update, f"Pong from Telemock. chat_id={chat_label}")


async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    log(f"Received /about from chat_id={current_chat_id(update)}")
    await reply(update, "This bot uses python-telegram-bot and is connected to the Telemock simulator.")


def fetch_json(url: str) -> dict[str, Any]:
    with urlopen(url, timeout=5) as response:
        return json.load(response)


def get_simulator_state() -> dict[str, Any]:
    query = urlencode({"token": BOT_TOKEN})
    payload = fetch_json(f"{SIMULATOR_BASE_URL}/internal/state?{query}")
    return payload["result"]


def get_bot_profile() -> dict[str, Any]:
    payload = fetch_json(f"{SIMULATOR_BASE_URL}/bot{BOT_TOKEN}/getMe")
    return payload["result"]


def ensure_simulator_ready() -> None:
    log(f"Checking simulator health at {SIMULATOR_BASE_URL}/internal/health")
    try:
        fetch_json(f"{SIMULATOR_BASE_URL}/internal/health")
    except URLError as error:
        raise RuntimeError(
            f"Telemock is not reachable at {SIMULATOR_BASE_URL}. Start the app first, then run this bot again."
        ) from error
    log("Simulator healthcheck passed")

    log("Checking Bot API route with getMe")
    try:
        profile = get_bot_profile()
    except HTTPError as error:
        raise RuntimeError(
            f"Telemock responded on {SIMULATOR_BASE_URL}, but the Bot API route /bot<TOKEN>/getMe returned HTTP {error.code}. Rebuild and restart the app so the local Bot API server is loaded."
        ) from error
    except URLError as error:
        raise RuntimeError(
            f"Telemock health works, but the Bot API route at {SIMULATOR_BASE_URL} is unreachable."
        ) from error

    username = profile.get("username", "unknown")
    log(f"Bot API route is ready for @{username}")


async def post_init(application: Application) -> None:
    log("Registering bot commands")
    await application.bot.set_my_commands(COMMANDS)
    me = await application.bot.get_me()
    log(f"Connected as @{me.username} ({me.first_name})")
    log("Loading simulator state snapshot")

    try:
        state = await asyncio.to_thread(get_simulator_state)
    except Exception as error:
        log(f"Simulator state unavailable: {error}")
        return

    log(f"Simulator API: {state['base_url']}")
    log(f"Available chats: {len(state.get('chats', []))}")

    for chat in state.get("chats", []):
        access = "read-only" if chat.get("read_only") else "interactive"
        log(f"chat={chat['title']} type={chat['type']} chat_id={chat['id']} access={access}")

    log("Send a message from the Telemock UI to an interactive chat to trigger commands")


def build_application() -> Application:
    log(f"Configuring PTB base_url={SIMULATOR_BASE_URL}/bot{{token}}")
    builder = Application.builder().token(BOT_TOKEN).post_init(post_init)

    builder = builder.base_url(f"{SIMULATOR_BASE_URL}/bot{{token}}")
    builder = builder.base_file_url(f"{SIMULATOR_BASE_URL}/file/bot{{token}}")

    return builder.build()


def main() -> None:
    log(f"Starting bot with token={short_text(BOT_TOKEN, 18)!r}")
    ensure_simulator_ready()

    app = build_application()
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("ping", ping_command))
    app.add_handler(CommandHandler("about", about_command))

    log(f"Bot is running with Telemock on {SIMULATOR_BASE_URL}")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
