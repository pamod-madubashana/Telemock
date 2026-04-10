<div align="center">
  <h1>Telemock</h1>
  <img src="src-tauri/icons/icon.png" alt="Telemock icon" width="200" height="200" />
  <p><strong>An offline Telegram Bot API simulator with a Telegram-like UI for local bot testing.</strong></p>
</div>

---

## Overview

Telemock is a local-first Telegram Bot API simulator built for bot development and testing without using real Telegram servers. It aims to provide a Telegram-like desktop experience, mock chats, and a Bot API-compatible backend so bot code can run locally with minimal changes before production.

## Features

- Offline Telegram Bot API simulation
- Telegram Desktop-like testing UI
- Mock private, group, and channel chats
- Local update generation for bot testing
- Compatible testing flow for libraries like `python-telegram-bot`
- Minimal production switch by changing the API base URL

## Planned Structure

- **Frontend:** Telegram-like desktop UI
- **Backend:** Local Bot API simulator
- **Storage:** Local state for chats, messages, updates, and bot data

## Main Goal

Make bot code think it is talking to a real local Telegram Bot API server, while keeping everything fully offline and developer-friendly.

## Use Cases

- Test bot commands locally
- Simulate updates without real Telegram data
- Develop and debug bots faster
- Build bot workflows before deploying to production

## Status

Telemock is currently in active development.

## Long-Term Vision

- Full Bot API method coverage
- Better behavioral parity with Telegram Bot API
- Rich local chat simulation
- Media, callbacks, webhooks, and more advanced testing flows

## Development Philosophy

Telemock focuses on:

- API compatibility first
- clean local testing workflow
- minimal changes between local and production environments

## Production Switching

The goal is to keep the transition simple:

- **Local:** Telemock base URL
- **Production:** Official Telegram Bot API base URL

## License

This project is licensed under the MIT License.