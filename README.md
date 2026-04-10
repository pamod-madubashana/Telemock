# Telemock

Telemock is a local Telegram Bot API simulator with a Telegram-style desktop UI.

It starts a Rust HTTP server on `http://127.0.0.1:8081` and exposes a React chat client inside the Tauri app.

## API surface

- Every official Bot API method name from `https://core.telegram.org/bots/api` is recognized through `http://127.0.0.1:8081/bot<TOKEN>/<METHOD>`
- Method matching is case-insensitive, like the official Bot API
- `GET`, `POST`, JSON bodies, and form-encoded requests are accepted on the Bot API routes
- Internal UI endpoints at `http://127.0.0.1:8081/internal/*`

## Currently simulated

- `getMe`
- `getUpdates`
- `sendMessage`
- `setWebhook`
- `deleteWebhook`
- `getWebhookInfo`
- `logOut`
- `close`
- `setMyName`
- `getMyName`
- `setMyDescription`
- `getMyDescription`
- `setMyShortDescription`
- `getMyShortDescription`
- `setMyCommands`
- `getMyCommands`
- `deleteMyCommands`

All remaining official methods currently return a structured Bot API error response with `ok: false` and `error_code: 501`, which keeps the external route surface complete while deeper simulation is being added.

The simulator persists bot profiles, localized profile metadata, commands, messages, webhook settings, and queued updates in SQLite.

## Local chats

- Private chat with `User`
- Group chat: `Neighborhood Lab`
- Channel preview: `Mock Broadcast`

Messages sent from the UI create updates for the selected bot token. Messages sent through `sendMessage` appear in the UI without creating inbound updates.

## Run it

```bash
npm install
npm run tauri dev
```

The Tauri window launches the UI and starts the local Bot API server automatically.

## python-telegram-bot example

```python
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, filters

app = ApplicationBuilder() \
    .token("123:ABC") \
    .base_url("http://127.0.0.1:8081/bot") \
    .build()

async def handle(update: Update, context):
    await update.message.reply_text("Hello from bot")

app.add_handler(MessageHandler(filters.TEXT, handle))
app.run_polling()
```

To switch to production, change only the `base_url`.

## Verification

- Frontend build: `npm run build`
- Backend tests: `cargo test --manifest-path src-tauri/Cargo.toml`
