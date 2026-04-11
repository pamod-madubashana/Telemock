import botFatherAvatar from "@/assets/botfather.png";

export const MOCK_BOT_NAME = "MockBot";
export const MOCK_BOT_USERNAME = "mock_test_bot";
export const MOCK_BOT_TOKEN = "8399914870:AAH3mANGZFUfqAU8kf1HvOHCNNvr-j6RagY";

export interface User {
  id: string;
  name: string;
  isBot: boolean;
  avatar?: string;
  initials: string;
  color: string;
}

export interface Chat {
  id: string;
  type: "private" | "group" | "channel";
  title: string;
  subtitle?: string;
  avatar?: string;
  verified?: boolean;
  profileSubtitle?: string;
  profileId?: string;
  initials: string;
  color: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  pinned?: boolean;
  members?: number;
  online?: boolean;
  description?: string;
  username?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: "text" | "system" | "command";
  replyTo?: { sender: string; text: string };
  read?: boolean;
}

export const currentUser: User = {
  id: "user-1",
  name: "Developer",
  isBot: false,
  initials: "D",
  color: "hsl(200, 70%, 50%)",
};

export const users: Record<string, User> = {
  "user-1": currentUser,
  "bot-1": {
    id: "bot-1",
    name: MOCK_BOT_NAME,
    isBot: true,
    initials: "MB",
    color: "hsl(200, 80%, 45%)",
  },
  botfather: {
    id: "botfather",
    name: "BotFather",
    isBot: true,
    avatar: botFatherAvatar,
    initials: "BF",
    color: "hsl(200, 85%, 50%)",
  },
  "user-2": {
    id: "user-2",
    name: "Alice",
    isBot: false,
    initials: "A",
    color: "hsl(340, 65%, 55%)",
  },
  "user-3": {
    id: "user-3",
    name: "Bob",
    isBot: false,
    initials: "B",
    color: "hsl(30, 70%, 50%)",
  },
};

export const chats: Chat[] = [
  {
    id: "chat-botfather",
    type: "private",
    title: "BotFather",
    subtitle: "bot",
    avatar: botFatherAvatar,
    verified: true,
    profileSubtitle: "8,099,021 monthly users",
    profileId: "93372553",
    initials: "BF",
    color: "hsl(200, 85%, 50%)",
    lastMessage: "Use /newbot to create a new bot",
    lastMessageTime: "Now",
    unreadCount: 1,
    online: true,
    description:
      "BotFather is the one bot to rule them all. Use it to create new bot accounts and manage your existing bots.",
    username: "BotFather",
  },
  {
    id: "chat-1",
    type: "private",
    title: MOCK_BOT_NAME,
    subtitle: "bot",
    profileId: "7814203112",
    initials: "MB",
    color: "hsl(200, 80%, 45%)",
    lastMessage: "",
    lastMessageTime: "",
    unreadCount: 0,
    online: true,
    description: "Local Telemock bot wired to the simulated Telegram Bot API.",
    username: MOCK_BOT_USERNAME,
  },
  {
    id: "chat-2",
    type: "group",
    title: "Bot Testing Group",
    subtitle: "3 members",
    initials: "BT",
    color: "hsl(142, 60%, 40%)",
    lastMessage: "Bob: /help",
    lastMessageTime: "11:30",
    unreadCount: 3,
    members: 3,
    description:
      "A group for testing bot commands and interactions in a group environment.",
  },
  {
    id: "chat-3",
    type: "channel",
    title: "Bot Testing Channel",
    subtitle: "128 subscribers",
    initials: "BC",
    color: "hsl(262, 60%, 55%)",
    lastMessage: "New bot update available v2.1",
    lastMessageTime: "Yesterday",
    unreadCount: 1,
    members: 128,
    description:
      "Updates, tips, and test broadcasts for Mockgram bot developers.",
    username: "bot_testing_channel",
  },
];

export const messages: Record<string, Message[]> = {
  "chat-botfather": [
    {
      id: "bf1",
      chatId: "chat-botfather",
      senderId: "user-1",
      text: "/start",
      timestamp: "09:00",
      type: "command",
      read: true,
    },
    {
      id: "bf2",
      chatId: "chat-botfather",
      senderId: "botfather",
      text: "I can help you create and manage Mockgram bots. If you're new to the Bot API, please see the manual.\n\nYou can control me by sending these commands:\n\n/newbot — create a new bot\n/mybots — edit your bots\n/setname — change a bot's name\n/setdescription — change bot description\n/setabouttext — change bot about info\n/setuserpic — change bot profile photo\n/setcommands — change the list of commands\n/deletebot — delete a bot\n\n/token — generate authorization token\n/revoke — revoke bot access token",
      timestamp: "09:00",
      type: "text",
      read: true,
    },
    {
      id: "bf3",
      chatId: "chat-botfather",
      senderId: "user-1",
      text: "/newbot",
      timestamp: "09:01",
      type: "command",
      read: true,
    },
    {
      id: "bf4",
      chatId: "chat-botfather",
      senderId: "botfather",
      text: "Alright, a new bot. How are we going to call it? Please choose a name for your bot.",
      timestamp: "09:01",
      type: "text",
      read: true,
    },
    {
      id: "bf5",
      chatId: "chat-botfather",
      senderId: "user-1",
      text: "MockBot",
      timestamp: "09:02",
      type: "text",
      read: true,
    },
    {
      id: "bf6",
      chatId: "chat-botfather",
      senderId: "botfather",
      text: "Good. Now let's choose a username for your bot. It must end in 'bot'. Like this, for example: TetrisBot or tetris_bot.",
      timestamp: "09:02",
      type: "text",
      read: true,
    },
    {
      id: "bf7",
      chatId: "chat-botfather",
      senderId: "user-1",
      text: "mock_test_bot",
      timestamp: "09:03",
      type: "text",
      read: true,
    },
    {
      id: "bf8",
      chatId: "chat-botfather",
      senderId: "botfather",
      text: `Done! Congratulations on your new bot. You will find it at t.me/${MOCK_BOT_USERNAME}. You can now add a description, about section and profile picture for your bot, see /help for a list of commands.\n\nUse this token to access the HTTP API:\n<code>${MOCK_BOT_TOKEN}</code>\n\nKeep your token secure and store it safely, it can be used by anyone to control your bot.\n\nFor a description of the Bot API, see this page: https://core.telegram.org/bots/api`,
      timestamp: "09:03",
      type: "text",
      read: true,
    },
  ],
  "chat-1": [],
  "chat-2": [
    {
      id: "g1",
      chatId: "chat-2",
      senderId: "system",
      text: "Alice joined the group",
      timestamp: "10:00",
      type: "system",
    },
    {
      id: "g2",
      chatId: "chat-2",
      senderId: "user-2",
      text: "Hey everyone! Let's test the bot here.",
      timestamp: "10:15",
      type: "text",
    },
    {
      id: "g3",
      chatId: "chat-2",
      senderId: "user-1",
      text: "/start@MockBot",
      timestamp: "10:20",
      type: "command",
    },
    {
      id: "g4",
      chatId: "chat-2",
      senderId: "bot-1",
      text: "Bot activated in group chat! I'll respond to commands prefixed with /command@MockBot.",
      timestamp: "10:20",
      type: "text",
    },
    {
      id: "g5",
      chatId: "chat-2",
      senderId: "user-3",
      text: "Nice, the bot is working!",
      timestamp: "11:00",
      type: "text",
    },
    {
      id: "g6",
      chatId: "chat-2",
      senderId: "user-3",
      text: "/help",
      timestamp: "11:30",
      type: "command",
      replyTo: { sender: "MockBot", text: "Bot activated in group chat!" },
    },
  ],
  "chat-3": [
    {
      id: "c1",
      chatId: "chat-3",
      senderId: "bot-1",
      text: "📢 Bot Testing Channel\n\nWelcome to the Mockgram testing channel. Here you'll find updates and test broadcasts.",
      timestamp: "Yesterday",
      type: "text",
    },
    {
      id: "c2",
      chatId: "chat-3",
      senderId: "bot-1",
      text: "🔄 New bot update available v2.1\n\n• Improved command parsing\n• Added inline query support\n• Fixed callback query handling\n• Better error messages\n\nUpdate your bot to get the latest features!",
      timestamp: "Yesterday",
      type: "text",
    },
    {
      id: "c3",
      chatId: "chat-3",
      senderId: "bot-1",
      text: "🧪 Testing Tip\n\nUse /debug mode to see raw update objects as your bot receives them. Great for debugging webhook payloads!",
      timestamp: "Today",
      type: "text",
    },
  ],
};

// BotFather conversation state machine
export type BotFatherState =
  | "idle"
  | "awaiting_name"
  | "awaiting_username"
  | "awaiting_delete_selection"
  | "awaiting_setname_selection"
  | "awaiting_new_name";

export interface CreatedBot {
  name: string;
  username: string;
  token: string;
  createdAt: string;
}

function generateToken(): string {
  const id = Math.floor(Math.random() * 9000000000) + 1000000000;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  let secret = "";
  for (let i = 0; i < 35; i++)
    secret += chars[Math.floor(Math.random() * chars.length)];
  return `${id}:${secret}`;
}

export function handleBotFatherMessage(
  text: string,
  state: BotFatherState,
  bots: CreatedBot[],
  pendingName?: string,
): {
  reply: string;
  newState: BotFatherState;
  newBot?: CreatedBot;
  deletedUsername?: string;
  pendingName?: string;
  renamedBot?: { username: string; newName: string };
} {
  const trimmed = text.trim();

  // Commands always reset state
  if (trimmed === "/start" || trimmed === "/help") {
    return {
      reply:
        "I can help you create and manage Mockgram bots. If you're new to the Bot API, please see the manual.\n\nYou can control me by sending these commands:\n\n/newbot — create a new bot\n/mybots — edit your bots\n/setname — change a bot's name\n/setdescription — change bot description\n/deletebot — delete a bot\n\n/token — generate authorization token\n/revoke — revoke bot access token",
      newState: "idle",
    };
  }

  if (trimmed === "/newbot") {
    return {
      reply:
        "Alright, a new bot. How are we going to call it? Please choose a name for your bot.",
      newState: "awaiting_name",
    };
  }

  if (trimmed === "/mybots") {
    if (bots.length === 0) {
      return {
        reply: "You have no bots yet. Use /newbot to create one.",
        newState: "idle",
      };
    }
    const list = bots
      .map((b) => `🤖 @${b.username} — ${b.name}\n   Token: ${b.token}`)
      .join("\n\n");
    return { reply: `Your bots:\n\n${list}`, newState: "idle" };
  }

  if (trimmed === "/deletebot") {
    if (bots.length === 0) {
      return {
        reply: "You have no bots to delete. Use /newbot to create one first.",
        newState: "idle",
      };
    }
    const list = bots.map((b) => `@${b.username}`).join("\n");
    return {
      reply: `Choose a bot to delete:\n\n${list}\n\nSend the username of the bot you want to delete.`,
      newState: "awaiting_delete_selection",
    };
  }

  if (trimmed === "/setname") {
    if (bots.length === 0) {
      return {
        reply: "You have no bots yet. Use /newbot to create one.",
        newState: "idle",
      };
    }
    const list = bots.map((b) => `@${b.username}`).join("\n");
    return {
      reply: `Choose a bot to rename:\n\n${list}\n\nSend the username of the bot.`,
      newState: "awaiting_setname_selection",
    };
  }

  if (trimmed === "/token") {
    if (bots.length === 0) {
      return {
        reply: "You have no bots yet. Use /newbot to create one first.",
        newState: "idle",
      };
    }
    const list = bots
      .map((b) => `@${b.username}\nToken: ${b.token}`)
      .join("\n\n");
    return { reply: `Your bot tokens:\n\n${list}`, newState: "idle" };
  }

  // State machine responses
  if (state === "awaiting_name") {
    return {
      reply:
        "Good. Now let's choose a username for your bot. It must end in 'bot'. Like this, for example: TetrisBot or tetris_bot.",
      newState: "awaiting_username",
      pendingName: trimmed,
    };
  }

  if (state === "awaiting_username") {
    if (!trimmed.toLowerCase().endsWith("bot")) {
      return {
        reply: "Sorry, the username must end in 'bot'. Please try again.",
        newState: "awaiting_username",
        pendingName,
      };
    }
    if (bots.some((b) => b.username.toLowerCase() === trimmed.toLowerCase())) {
      return {
        reply:
          "Sorry, this username is already taken. Please try a different one.",
        newState: "awaiting_username",
        pendingName,
      };
    }
    const token = generateToken();
    const newBot: CreatedBot = {
      name: pendingName || trimmed,
      username: trimmed,
      token,
      createdAt: new Date().toISOString(),
    };
    return {
      reply: `Done! Congratulations on your new bot. You will find it at t.me/${trimmed}. You can now add a description, about section and profile picture for your bot, see /help for a list of commands.\n\nUse this token to access the HTTP API:\n<code>${token}</code>\n\nKeep your token secure and store it safely, it can be used by anyone to control your bot.`,
      newState: "idle",
      newBot,
    };
  }

  if (state === "awaiting_delete_selection") {
    const bot = bots.find(
      (b) =>
        b.username.toLowerCase() === trimmed.replace("@", "").toLowerCase(),
    );
    if (!bot) {
      return {
        reply: "Bot not found. Please send a valid username from the list.",
        newState: "awaiting_delete_selection",
      };
    }
    return {
      reply: `Done! The bot @${bot.username} has been deleted. /help`,
      newState: "idle",
      deletedUsername: bot.username,
    };
  }

  if (state === "awaiting_setname_selection") {
    const bot = bots.find(
      (b) =>
        b.username.toLowerCase() === trimmed.replace("@", "").toLowerCase(),
    );
    if (!bot) {
      return {
        reply: "Bot not found. Please send a valid username from the list.",
        newState: "awaiting_setname_selection",
      };
    }
    return {
      reply: `OK. Send me the new name for @${bot.username}.`,
      newState: "awaiting_new_name",
      pendingName: bot.username,
    };
  }

  if (state === "awaiting_new_name") {
    return {
      reply: `Done! The name of @${pendingName} has been updated to "${trimmed}".`,
      newState: "idle",
      renamedBot: { username: pendingName!, newName: trimmed },
    };
  }

  return {
    reply: "I'm not sure what you mean. Use /help to see available commands.",
    newState: "idle",
  };
}
