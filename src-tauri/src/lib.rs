use axum::{
    body::Bytes,
    extract::{Path, Query, RawQuery, State},
    http::{header::CONTENT_TYPE, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{any, get, post},
    Json, Router,
};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{de::DeserializeOwned, Deserialize, Deserializer, Serialize};
use serde_json::{json, Value};
use std::{
    collections::BTreeMap,
    path::PathBuf,
    sync::{Arc, Mutex},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::Manager;
use tower_http::cors::{Any, CorsLayer};

const DEFAULT_SERVER_HOST: &str = "127.0.0.1";
const DEFAULT_SERVER_PORT: u16 = 8443;
#[cfg(test)]
const DEFAULT_SERVER_BASE_URL: &str = "http://127.0.0.1:8443";
const DEFAULT_TOKEN: &str = "8399914870:AAH3mANGZFUfqAU8kf1HvOHCNNvr-j6RagY";
const DEFAULT_BOT_NAME: &str = "MockBot";
const DEFAULT_BOT_USERNAME: &str = "mock_test_bot";
const USER_ID: i64 = 1;
const USER_NAME: &str = "User";
const USER_USERNAME: &str = "local_user";
const DEFAULT_BOT_DESCRIPTION: &str = "Offline Telegram Bot API simulator bot";
const DEFAULT_BOT_SHORT_DESCRIPTION: &str = "Offline Telegram simulator";
const KNOWN_BOT_API_METHODS: &[&str] = &[
    "getUpdates",
    "setWebhook",
    "deleteWebhook",
    "getWebhookInfo",
    "getMe",
    "logOut",
    "close",
    "sendMessage",
    "forwardMessage",
    "forwardMessages",
    "copyMessage",
    "copyMessages",
    "sendPhoto",
    "sendAudio",
    "sendDocument",
    "sendVideo",
    "sendAnimation",
    "sendVoice",
    "sendVideoNote",
    "sendPaidMedia",
    "sendMediaGroup",
    "sendLocation",
    "sendVenue",
    "sendContact",
    "sendPoll",
    "sendChecklist",
    "sendDice",
    "sendMessageDraft",
    "sendChatAction",
    "setMessageReaction",
    "getUserProfilePhotos",
    "getUserProfileAudios",
    "setUserEmojiStatus",
    "getFile",
    "banChatMember",
    "unbanChatMember",
    "restrictChatMember",
    "promoteChatMember",
    "setChatAdministratorCustomTitle",
    "setChatMemberTag",
    "banChatSenderChat",
    "unbanChatSenderChat",
    "setChatPermissions",
    "exportChatInviteLink",
    "createChatInviteLink",
    "editChatInviteLink",
    "createChatSubscriptionInviteLink",
    "editChatSubscriptionInviteLink",
    "revokeChatInviteLink",
    "approveChatJoinRequest",
    "declineChatJoinRequest",
    "setChatPhoto",
    "deleteChatPhoto",
    "setChatTitle",
    "setChatDescription",
    "pinChatMessage",
    "unpinChatMessage",
    "unpinAllChatMessages",
    "leaveChat",
    "getChat",
    "getChatAdministrators",
    "getChatMemberCount",
    "getChatMember",
    "setChatStickerSet",
    "deleteChatStickerSet",
    "getForumTopicIconStickers",
    "createForumTopic",
    "editForumTopic",
    "closeForumTopic",
    "reopenForumTopic",
    "deleteForumTopic",
    "unpinAllForumTopicMessages",
    "editGeneralForumTopic",
    "closeGeneralForumTopic",
    "reopenGeneralForumTopic",
    "hideGeneralForumTopic",
    "unhideGeneralForumTopic",
    "unpinAllGeneralForumTopicMessages",
    "answerCallbackQuery",
    "getUserChatBoosts",
    "getBusinessConnection",
    "getManagedBotToken",
    "replaceManagedBotToken",
    "setMyCommands",
    "deleteMyCommands",
    "getMyCommands",
    "setMyName",
    "getMyName",
    "setMyDescription",
    "getMyDescription",
    "setMyShortDescription",
    "getMyShortDescription",
    "setMyProfilePhoto",
    "removeMyProfilePhoto",
    "setChatMenuButton",
    "getChatMenuButton",
    "setMyDefaultAdministratorRights",
    "getMyDefaultAdministratorRights",
    "getAvailableGifts",
    "sendGift",
    "giftPremiumSubscription",
    "verifyUser",
    "verifyChat",
    "removeUserVerification",
    "removeChatVerification",
    "getMyStarBalance",
    "getStarTransactions",
    "refundStarPayment",
    "editUserStarSubscription",
    "readBusinessMessage",
    "deleteBusinessMessages",
    "setBusinessAccountName",
    "setBusinessAccountUsername",
    "setBusinessAccountBio",
    "setBusinessAccountProfilePhoto",
    "removeBusinessAccountProfilePhoto",
    "setBusinessAccountGiftSettings",
    "getBusinessAccountStarBalance",
    "transferBusinessAccountStars",
    "getBusinessAccountGifts",
    "getUserGifts",
    "getChatGifts",
    "convertGiftToStars",
    "upgradeGift",
    "transferGift",
    "postStory",
    "repostStory",
    "editStory",
    "deleteStory",
    "answerWebAppQuery",
    "savePreparedInlineMessage",
    "savePreparedKeyboardButton",
    "editMessageText",
    "editMessageCaption",
    "editMessageMedia",
    "editMessageLiveLocation",
    "stopMessageLiveLocation",
    "editMessageChecklist",
    "editMessageReplyMarkup",
    "stopPoll",
    "approveSuggestedPost",
    "declineSuggestedPost",
    "deleteMessage",
    "deleteMessages",
    "sendSticker",
    "getStickerSet",
    "getCustomEmojiStickers",
    "uploadStickerFile",
    "createNewStickerSet",
    "addStickerToSet",
    "setStickerPositionInSet",
    "deleteStickerFromSet",
    "replaceStickerInSet",
    "setStickerEmojiList",
    "setStickerKeywords",
    "setStickerMaskPosition",
    "setStickerSetTitle",
    "setStickerSetThumbnail",
    "setCustomEmojiStickerSetThumbnail",
    "deleteStickerSet",
    "answerInlineQuery",
    "sendInvoice",
    "createInvoiceLink",
    "answerShippingQuery",
    "answerPreCheckoutQuery",
    "setPassportDataErrors",
    "sendGame",
    "setGameScore",
    "getGameHighScores",
];

#[derive(Clone)]
struct AppState {
    db: Arc<Mutex<Connection>>,
    base_url: String,
}

#[derive(Debug)]
struct ApiError {
    status: StatusCode,
    description: String,
}

#[derive(Clone)]
struct BotProfile {
    id: i64,
    first_name: String,
    username: String,
    can_join_groups: bool,
    can_read_all_group_messages: bool,
    supports_inline_queries: bool,
    can_connect_to_business: bool,
    has_main_web_app: bool,
    has_topics_enabled: bool,
    allows_users_to_create_topics: bool,
    can_manage_bots: bool,
}

#[derive(Clone)]
struct ChatRecord {
    id: i64,
    kind: String,
    title: String,
    username: Option<String>,
    read_only: bool,
}

struct MessageRecord {
    message_id: i64,
    date: i64,
    is_bot: bool,
    text: String,
    chat: ChatRecord,
}

struct UpdateRecord {
    update_id: i64,
    update_type: String,
    message: MessageRecord,
}

#[derive(Default, Deserialize)]
struct GetUpdatesParams {
    offset: Option<i64>,
    limit: Option<usize>,
    #[serde(rename = "timeout")]
    _timeout: Option<u64>,
}

#[derive(Default, Deserialize)]
struct SendMessageParams {
    chat_id: i64,
    text: String,
}

#[derive(Default, Deserialize)]
struct SetWebhookParams {
    url: Option<String>,
    ip_address: Option<String>,
    max_connections: Option<i64>,
    allowed_updates: Option<Vec<String>>,
    drop_pending_updates: Option<bool>,
    secret_token: Option<String>,
}

#[derive(Default, Deserialize)]
struct DeleteWebhookParams {
    drop_pending_updates: Option<bool>,
}

#[derive(Default, Deserialize)]
struct SetMyNameParams {
    name: Option<String>,
    language_code: Option<String>,
}

#[derive(Default, Deserialize)]
struct GetMyNameParams {
    language_code: Option<String>,
}

#[derive(Default, Deserialize)]
struct SetMyDescriptionParams {
    description: Option<String>,
    language_code: Option<String>,
}

#[derive(Default, Deserialize)]
struct GetMyDescriptionParams {
    language_code: Option<String>,
}

#[derive(Default, Deserialize)]
struct SetMyShortDescriptionParams {
    short_description: Option<String>,
    language_code: Option<String>,
}

#[derive(Default, Deserialize)]
struct GetMyShortDescriptionParams {
    language_code: Option<String>,
}

#[derive(Default, Deserialize)]
struct SetMyCommandsParams {
    #[serde(deserialize_with = "deserialize_bot_commands")]
    commands: Vec<BotCommand>,
    #[serde(default, deserialize_with = "deserialize_optional_bot_command_scope")]
    scope: Option<BotCommandScope>,
    language_code: Option<String>,
}

#[derive(Default, Deserialize)]
struct GetMyCommandsParams {
    #[serde(default, deserialize_with = "deserialize_optional_bot_command_scope")]
    scope: Option<BotCommandScope>,
    language_code: Option<String>,
}

#[derive(Deserialize)]
struct InternalTokenQuery {
    token: Option<String>,
}

#[derive(Deserialize)]
struct InternalSendRequest {
    token: Option<String>,
    chat_id: i64,
    text: String,
}

#[derive(Serialize)]
struct ApiEnvelope<T> {
    ok: bool,
    result: T,
}

#[derive(Clone, Deserialize, Serialize)]
struct BotCommand {
    command: String,
    description: String,
}

#[derive(Clone, Deserialize, Serialize)]
struct BotCommandScope {
    #[serde(rename = "type", default = "default_bot_command_scope")]
    kind: String,
    #[serde(flatten)]
    extra: BTreeMap<String, Value>,
}

impl Default for BotCommandScope {
    fn default() -> Self {
        Self {
            kind: default_bot_command_scope(),
            extra: BTreeMap::new(),
        }
    }
}

#[derive(Clone, Serialize)]
struct TelegramUser {
    id: i64,
    is_bot: bool,
    first_name: String,
    username: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    can_join_groups: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    can_read_all_group_messages: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    supports_inline_queries: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    can_connect_to_business: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    has_main_web_app: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    has_topics_enabled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    allows_users_to_create_topics: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    can_manage_bots: Option<bool>,
}

#[derive(Clone, Serialize)]
struct TelegramChat {
    id: i64,
    #[serde(rename = "type")]
    kind: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    first_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
}

#[derive(Clone, Serialize)]
struct TelegramMessage {
    message_id: i64,
    date: i64,
    chat: TelegramChat,
    #[serde(skip_serializing_if = "Option::is_none")]
    from: Option<TelegramUser>,
    #[serde(skip_serializing_if = "Option::is_none")]
    sender_chat: Option<TelegramChat>,
    text: String,
}

#[derive(Serialize)]
struct TelegramUpdate {
    update_id: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<TelegramMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    channel_post: Option<TelegramMessage>,
}

#[derive(Serialize)]
struct InternalChatView {
    id: i64,
    #[serde(rename = "type")]
    kind: String,
    title: String,
    subtitle: String,
    read_only: bool,
    messages: Vec<TelegramMessage>,
}

#[derive(Serialize)]
struct InternalStateView {
    base_url: String,
    token: String,
    bot: TelegramUser,
    chats: Vec<InternalChatView>,
}

#[derive(Serialize)]
struct WebhookInfo {
    url: String,
    has_custom_certificate: bool,
    pending_update_count: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    ip_address: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    last_error_date: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    last_error_message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    last_synchronization_error_date: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_connections: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    allowed_updates: Option<Vec<String>>,
}

#[derive(Serialize)]
struct BotName {
    name: String,
}

#[derive(Serialize)]
struct BotDescription {
    description: String,
}

#[derive(Serialize)]
struct BotShortDescription {
    short_description: String,
}

impl ApiError {
    fn bad_request(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::BAD_REQUEST,
            description: message.into(),
        }
    }

    fn internal(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            description: message.into(),
        }
    }

    fn not_implemented(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::NOT_IMPLEMENTED,
            description: message.into(),
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let payload = Json(json!({
            "ok": false,
            "error_code": self.status.as_u16(),
            "description": self.description,
        }));

        (self.status, payload).into_response()
    }
}

impl AppState {
    fn new(db_path: PathBuf, base_url: String) -> Result<Self, Box<dyn std::error::Error>> {
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let connection = Connection::open(db_path)?;
        Self::initialize_schema(&connection)?;

        Ok(Self {
            db: Arc::new(Mutex::new(connection)),
            base_url,
        })
    }

    #[cfg(test)]
    fn in_memory(base_url: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let connection = Connection::open_in_memory()?;
        Self::initialize_schema(&connection)?;

        Ok(Self {
            db: Arc::new(Mutex::new(connection)),
            base_url: base_url.to_string(),
        })
    }

    fn initialize_schema(connection: &Connection) -> rusqlite::Result<()> {
        connection.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS bots (
                token TEXT PRIMARY KEY,
                telegram_id INTEGER NOT NULL UNIQUE,
                first_name TEXT NOT NULL,
                username TEXT NOT NULL,
                webhook_url TEXT
            );

            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                username TEXT,
                read_only INTEGER NOT NULL DEFAULT 0,
                sort_index INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                bot_token TEXT NOT NULL,
                message_id INTEGER NOT NULL,
                chat_id INTEGER NOT NULL,
                date INTEGER NOT NULL,
                is_bot INTEGER NOT NULL,
                text TEXT NOT NULL,
                PRIMARY KEY (bot_token, message_id)
            );

            CREATE TABLE IF NOT EXISTS updates (
                update_id INTEGER PRIMARY KEY AUTOINCREMENT,
                bot_token TEXT NOT NULL,
                message_id INTEGER NOT NULL,
                update_type TEXT NOT NULL,
                consumed INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS bot_names (
                bot_token TEXT NOT NULL,
                language_code TEXT NOT NULL,
                value TEXT NOT NULL,
                PRIMARY KEY (bot_token, language_code)
            );

            CREATE TABLE IF NOT EXISTS bot_descriptions (
                bot_token TEXT NOT NULL,
                language_code TEXT NOT NULL,
                value TEXT NOT NULL,
                PRIMARY KEY (bot_token, language_code)
            );

            CREATE TABLE IF NOT EXISTS bot_short_descriptions (
                bot_token TEXT NOT NULL,
                language_code TEXT NOT NULL,
                value TEXT NOT NULL,
                PRIMARY KEY (bot_token, language_code)
            );

            CREATE TABLE IF NOT EXISTS bot_commands (
                bot_token TEXT NOT NULL,
                scope_key TEXT NOT NULL,
                language_code TEXT NOT NULL,
                commands_json TEXT NOT NULL,
                PRIMARY KEY (bot_token, scope_key, language_code)
            );

            CREATE INDEX IF NOT EXISTS idx_messages_bot_chat ON messages (bot_token, chat_id, message_id);
            CREATE INDEX IF NOT EXISTS idx_updates_bot_consumed ON updates (bot_token, consumed, update_id);
            ",
        )?;

        ensure_column(&connection, "bots", "webhook_ip_address", "TEXT")?;
        ensure_column(&connection, "bots", "webhook_max_connections", "INTEGER")?;
        ensure_column(&connection, "bots", "webhook_allowed_updates", "TEXT")?;
        ensure_column(&connection, "bots", "webhook_secret_token", "TEXT")?;

        connection.execute(
            "INSERT OR IGNORE INTO chats (id, type, title, username, read_only, sort_index) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![1_i64, "private", USER_NAME, USER_USERNAME, 0_i64, 1_i64],
        )?;
        connection.execute(
            "INSERT OR IGNORE INTO chats (id, type, title, username, read_only, sort_index) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![-1001_i64, "group", "Neighborhood Lab", Option::<String>::None, 0_i64, 2_i64],
        )?;
        connection.execute(
            "INSERT OR IGNORE INTO chats (id, type, title, username, read_only, sort_index) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![-1002_i64, "channel", "Mock Broadcast", "mock_broadcast", 1_i64, 3_i64],
        )?;

        Ok(())
    }

    fn get_or_create_bot(&self, token: &str) -> Result<BotProfile, ApiError> {
        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        let existing = connection
            .query_row(
                "SELECT telegram_id, first_name, username FROM bots WHERE token = ?1",
                params![token],
                |row| {
                    Ok(BotProfile {
                        id: row.get(0)?,
                        first_name: row.get(1)?,
                        username: row.get(2)?,
                        can_join_groups: true,
                        can_read_all_group_messages: true,
                        supports_inline_queries: false,
                        can_connect_to_business: false,
                        has_main_web_app: false,
                        has_topics_enabled: false,
                        allows_users_to_create_topics: false,
                        can_manage_bots: false,
                    })
                },
            )
            .optional()
            .map_err(map_sqlite_error)?;

        if let Some(bot) = existing {
            return Ok(bot);
        }

        let next_id = connection
            .query_row(
                "SELECT COALESCE(MAX(telegram_id), 998) + 1 FROM bots",
                [],
                |row| row.get::<_, i64>(0),
            )
            .map_err(map_sqlite_error)?;

        let username = if next_id == 999 {
            DEFAULT_BOT_USERNAME.to_string()
        } else {
            format!("{}_{}", DEFAULT_BOT_USERNAME, next_id)
        };

        connection
            .execute(
                "INSERT INTO bots (token, telegram_id, first_name, username) VALUES (?1, ?2, ?3, ?4)",
                params![token, next_id, DEFAULT_BOT_NAME, username],
            )
            .map_err(map_sqlite_error)?;

        Ok(BotProfile {
            id: next_id,
            first_name: DEFAULT_BOT_NAME.to_string(),
            username,
            can_join_groups: true,
            can_read_all_group_messages: true,
            supports_inline_queries: false,
            can_connect_to_business: false,
            has_main_web_app: false,
            has_topics_enabled: false,
            allows_users_to_create_topics: false,
            can_manage_bots: false,
        })
    }

    fn set_webhook(&self, token: &str, params: SetWebhookParams) -> Result<bool, ApiError> {
        self.get_or_create_bot(token)?;

        if params.drop_pending_updates.unwrap_or(false) {
            self.clear_pending_updates(token)?;
        }

        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        let allowed_updates = params
            .allowed_updates
            .as_ref()
            .map(serde_json::to_string)
            .transpose()
            .map_err(|error| ApiError::internal(format!("Internal Server Error: {error}")))?;

        connection
            .execute(
                "
                UPDATE bots
                SET webhook_url = ?1,
                    webhook_ip_address = ?2,
                    webhook_max_connections = ?3,
                    webhook_allowed_updates = ?4,
                    webhook_secret_token = ?5
                WHERE token = ?6
                ",
                params![
                    params.url.as_deref().unwrap_or(""),
                    params.ip_address,
                    params.max_connections,
                    allowed_updates,
                    params.secret_token,
                    token
                ],
            )
            .map_err(map_sqlite_error)?;

        Ok(true)
    }

    fn delete_webhook(&self, token: &str, params: DeleteWebhookParams) -> Result<bool, ApiError> {
        self.get_or_create_bot(token)?;

        if params.drop_pending_updates.unwrap_or(false) {
            self.clear_pending_updates(token)?;
        }

        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        connection
            .execute(
                "
                UPDATE bots
                SET webhook_url = '',
                    webhook_ip_address = NULL,
                    webhook_max_connections = NULL,
                    webhook_allowed_updates = NULL,
                    webhook_secret_token = NULL
                WHERE token = ?1
                ",
                params![token],
            )
            .map_err(map_sqlite_error)?;

        Ok(true)
    }

    fn get_webhook_info(&self, token: &str) -> Result<WebhookInfo, ApiError> {
        self.get_or_create_bot(token)?;

        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        let (url, ip_address, max_connections, allowed_updates_json) = connection
            .query_row(
                "
                SELECT
                    COALESCE(webhook_url, ''),
                    webhook_ip_address,
                    webhook_max_connections,
                    webhook_allowed_updates
                FROM bots
                WHERE token = ?1
                ",
                params![token],
                |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, Option<String>>(1)?,
                        row.get::<_, Option<i64>>(2)?,
                        row.get::<_, Option<String>>(3)?,
                    ))
                },
            )
            .map_err(map_sqlite_error)?;

        let pending_update_count = connection
            .query_row(
                "SELECT COUNT(*) FROM updates WHERE bot_token = ?1 AND consumed = 0",
                params![token],
                |row| row.get::<_, i64>(0),
            )
            .map_err(map_sqlite_error)?;

        let allowed_updates = allowed_updates_json
            .as_deref()
            .map(serde_json::from_str::<Vec<String>>)
            .transpose()
            .map_err(|error| ApiError::internal(format!("Internal Server Error: {error}")))?;

        Ok(WebhookInfo {
            url,
            has_custom_certificate: false,
            pending_update_count,
            ip_address,
            last_error_date: None,
            last_error_message: None,
            last_synchronization_error_date: None,
            max_connections,
            allowed_updates,
        })
    }

    fn set_my_name(&self, token: &str, params: SetMyNameParams) -> Result<bool, ApiError> {
        self.get_or_create_bot(token)?;
        let language_code = normalize_language_code(params.language_code.as_deref());
        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        if let Some(name) = normalized_optional_text(params.name.as_deref()) {
            connection
                .execute(
                    "INSERT INTO bot_names (bot_token, language_code, value) VALUES (?1, ?2, ?3) ON CONFLICT(bot_token, language_code) DO UPDATE SET value = excluded.value",
                    params![token, language_code, name],
                )
                .map_err(map_sqlite_error)?;
        } else {
            connection
                .execute(
                    "DELETE FROM bot_names WHERE bot_token = ?1 AND language_code = ?2",
                    params![token, language_code],
                )
                .map_err(map_sqlite_error)?;
        }

        Ok(true)
    }

    fn get_my_name(&self, token: &str, params: GetMyNameParams) -> Result<BotName, ApiError> {
        let bot = self.get_or_create_bot(token)?;
        let value = self.get_localized_bot_value(
            "bot_names",
            token,
            params.language_code.as_deref(),
            &bot.first_name,
        )?;

        Ok(BotName { name: value })
    }

    fn set_my_description(
        &self,
        token: &str,
        params: SetMyDescriptionParams,
    ) -> Result<bool, ApiError> {
        self.set_localized_bot_value(
            "bot_descriptions",
            token,
            params.language_code.as_deref(),
            params.description.as_deref(),
        )
    }

    fn get_my_description(
        &self,
        token: &str,
        params: GetMyDescriptionParams,
    ) -> Result<BotDescription, ApiError> {
        self.get_or_create_bot(token)?;
        let value = self.get_localized_bot_value(
            "bot_descriptions",
            token,
            params.language_code.as_deref(),
            DEFAULT_BOT_DESCRIPTION,
        )?;

        Ok(BotDescription { description: value })
    }

    fn set_my_short_description(
        &self,
        token: &str,
        params: SetMyShortDescriptionParams,
    ) -> Result<bool, ApiError> {
        self.set_localized_bot_value(
            "bot_short_descriptions",
            token,
            params.language_code.as_deref(),
            params.short_description.as_deref(),
        )
    }

    fn get_my_short_description(
        &self,
        token: &str,
        params: GetMyShortDescriptionParams,
    ) -> Result<BotShortDescription, ApiError> {
        self.get_or_create_bot(token)?;
        let value = self.get_localized_bot_value(
            "bot_short_descriptions",
            token,
            params.language_code.as_deref(),
            DEFAULT_BOT_SHORT_DESCRIPTION,
        )?;

        Ok(BotShortDescription {
            short_description: value,
        })
    }

    fn set_my_commands(&self, token: &str, params: SetMyCommandsParams) -> Result<bool, ApiError> {
        self.get_or_create_bot(token)?;

        let scope_key = serialize_command_scope(params.scope.as_ref())?;
        let language_code = normalize_language_code(params.language_code.as_deref());
        let commands_json = serde_json::to_string(&params.commands)
            .map_err(|error| ApiError::internal(format!("Internal Server Error: {error}")))?;

        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        connection
            .execute(
                "INSERT INTO bot_commands (bot_token, scope_key, language_code, commands_json) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(bot_token, scope_key, language_code) DO UPDATE SET commands_json = excluded.commands_json",
                params![token, scope_key, language_code, commands_json],
            )
            .map_err(map_sqlite_error)?;

        Ok(true)
    }

    fn get_my_commands(
        &self,
        token: &str,
        params: GetMyCommandsParams,
    ) -> Result<Vec<BotCommand>, ApiError> {
        self.get_or_create_bot(token)?;

        let scope_key = serialize_command_scope(params.scope.as_ref())?;
        let language_code = normalize_language_code(params.language_code.as_deref());
        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        let commands_json = connection
            .query_row(
                "SELECT commands_json FROM bot_commands WHERE bot_token = ?1 AND scope_key = ?2 AND language_code = ?3",
                params![token, scope_key, language_code],
                |row| row.get::<_, String>(0),
            )
            .optional()
            .map_err(map_sqlite_error)?;

        match commands_json {
            Some(value) => serde_json::from_str(&value)
                .map_err(|error| ApiError::internal(format!("Internal Server Error: {error}"))),
            None => Ok(Vec::new()),
        }
    }

    fn delete_my_commands(
        &self,
        token: &str,
        params: GetMyCommandsParams,
    ) -> Result<bool, ApiError> {
        self.get_or_create_bot(token)?;

        let scope_key = serialize_command_scope(params.scope.as_ref())?;
        let language_code = normalize_language_code(params.language_code.as_deref());
        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        connection
            .execute(
                "DELETE FROM bot_commands WHERE bot_token = ?1 AND scope_key = ?2 AND language_code = ?3",
                params![token, scope_key, language_code],
            )
            .map_err(map_sqlite_error)?;

        Ok(true)
    }

    fn get_localized_bot_value(
        &self,
        table_name: &str,
        token: &str,
        language_code: Option<&str>,
        fallback: &str,
    ) -> Result<String, ApiError> {
        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;
        let language_code = normalize_language_code(language_code);

        let query =
            format!("SELECT value FROM {table_name} WHERE bot_token = ?1 AND language_code = ?2");
        let value = connection
            .query_row(&query, params![token, language_code], |row| {
                row.get::<_, String>(0)
            })
            .optional()
            .map_err(map_sqlite_error)?;

        Ok(value.unwrap_or_else(|| fallback.to_string()))
    }

    fn set_localized_bot_value(
        &self,
        table_name: &str,
        token: &str,
        language_code: Option<&str>,
        value: Option<&str>,
    ) -> Result<bool, ApiError> {
        self.get_or_create_bot(token)?;
        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;
        let language_code = normalize_language_code(language_code);

        if let Some(value) = normalized_optional_text(value) {
            let query = format!(
                "INSERT INTO {table_name} (bot_token, language_code, value) VALUES (?1, ?2, ?3) ON CONFLICT(bot_token, language_code) DO UPDATE SET value = excluded.value"
            );
            connection
                .execute(&query, params![token, language_code, value])
                .map_err(map_sqlite_error)?;
        } else {
            let query =
                format!("DELETE FROM {table_name} WHERE bot_token = ?1 AND language_code = ?2");
            connection
                .execute(&query, params![token, language_code])
                .map_err(map_sqlite_error)?;
        }

        Ok(true)
    }

    fn clear_pending_updates(&self, token: &str) -> Result<(), ApiError> {
        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        connection
            .execute(
                "UPDATE updates SET consumed = 1 WHERE bot_token = ?1 AND consumed = 0",
                params![token],
            )
            .map_err(map_sqlite_error)?;

        Ok(())
    }

    fn send_bot_message(
        &self,
        token: &str,
        chat_id: i64,
        text: &str,
    ) -> Result<TelegramMessage, ApiError> {
        if text.trim().is_empty() {
            return Err(ApiError::bad_request("Bad Request: message text is empty"));
        }

        let bot = self.get_or_create_bot(token)?;
        let message = self.insert_message(token, chat_id, true, text, None)?;

        Ok(serialize_message(&bot, &message))
    }

    fn send_user_message(
        &self,
        token: &str,
        chat_id: i64,
        text: &str,
    ) -> Result<TelegramMessage, ApiError> {
        if text.trim().is_empty() {
            return Err(ApiError::bad_request("Bad Request: message text is empty"));
        }

        let bot = self.get_or_create_bot(token)?;
        let message = self.insert_message(token, chat_id, false, text, Some("message"))?;

        Ok(serialize_message(&bot, &message))
    }

    fn get_updates(
        &self,
        token: &str,
        params: GetUpdatesParams,
    ) -> Result<Vec<TelegramUpdate>, ApiError> {
        let bot = self.get_or_create_bot(token)?;

        let offset = params.offset;
        let limit = params.limit.unwrap_or(100).clamp(1, 100) as i64;
        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        if let Some(offset_value) = offset {
            connection
                .execute(
                    "UPDATE updates SET consumed = 1 WHERE bot_token = ?1 AND update_id < ?2",
                    params![token, offset_value],
                )
                .map_err(map_sqlite_error)?;
        }

        let mut statement = connection
            .prepare(
                "
                SELECT
                    u.update_id,
                    u.update_type,
                    m.message_id,
                    m.chat_id,
                    m.date,
                    m.is_bot,
                    m.text,
                    c.type,
                    c.title,
                    c.username,
                    c.read_only
                FROM updates u
                JOIN messages m ON m.bot_token = u.bot_token AND m.message_id = u.message_id
                JOIN chats c ON c.id = m.chat_id
                WHERE u.bot_token = ?1
                  AND u.consumed = 0
                  AND (?2 IS NULL OR u.update_id >= ?2)
                ORDER BY u.update_id ASC
                LIMIT ?3
                ",
            )
            .map_err(map_sqlite_error)?;

        let rows = statement
            .query_map(params![token, offset, limit], |row| {
                Ok(UpdateRecord {
                    update_id: row.get(0)?,
                    update_type: row.get(1)?,
                    message: MessageRecord {
                        message_id: row.get(2)?,
                        date: row.get(4)?,
                        is_bot: row.get::<_, i64>(5)? != 0,
                        text: row.get(6)?,
                        chat: ChatRecord {
                            id: row.get(3)?,
                            kind: row.get(7)?,
                            title: row.get(8)?,
                            username: row.get(9)?,
                            read_only: row.get::<_, i64>(10)? != 0,
                        },
                    },
                })
            })
            .map_err(map_sqlite_error)?;

        let records = rows
            .collect::<Result<Vec<_>, _>>()
            .map_err(map_sqlite_error)?;

        for record in &records {
            connection
                .execute(
                    "UPDATE updates SET consumed = 1 WHERE bot_token = ?1 AND update_id = ?2",
                    params![token, record.update_id],
                )
                .map_err(map_sqlite_error)?;
        }

        Ok(records
            .into_iter()
            .map(|record| serialize_update(&bot, record))
            .collect())
    }

    fn load_internal_state(&self, token: &str) -> Result<InternalStateView, ApiError> {
        let bot = self.get_or_create_bot(token)?;
        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        let mut chats_statement = connection
            .prepare(
                "SELECT id, type, title, username, read_only FROM chats ORDER BY sort_index ASC",
            )
            .map_err(map_sqlite_error)?;

        let chat_rows = chats_statement
            .query_map([], |row| {
                Ok(ChatRecord {
                    id: row.get(0)?,
                    kind: row.get(1)?,
                    title: row.get(2)?,
                    username: row.get(3)?,
                    read_only: row.get::<_, i64>(4)? != 0,
                })
            })
            .map_err(map_sqlite_error)?;

        let chat_records = chat_rows
            .collect::<Result<Vec<_>, _>>()
            .map_err(map_sqlite_error)?;

        let mut chats = Vec::with_capacity(chat_records.len());

        for chat in chat_records {
            let mut messages_statement = connection
                .prepare(
                    "
                    SELECT message_id, chat_id, date, is_bot, text
                    FROM messages
                    WHERE bot_token = ?1 AND chat_id = ?2
                    ORDER BY message_id ASC
                    ",
                )
                .map_err(map_sqlite_error)?;

            let message_rows = messages_statement
                .query_map(params![token, chat.id], |row| {
                    Ok(MessageRecord {
                        message_id: row.get(0)?,
                        date: row.get(2)?,
                        is_bot: row.get::<_, i64>(3)? != 0,
                        text: row.get(4)?,
                        chat: chat.clone(),
                    })
                })
                .map_err(map_sqlite_error)?;

            let messages = message_rows
                .collect::<Result<Vec<_>, _>>()
                .map_err(map_sqlite_error)?
                .into_iter()
                .map(|record| serialize_message(&bot, &record))
                .collect();

            chats.push(InternalChatView {
                id: chat.id,
                kind: chat.kind.clone(),
                title: chat.title.clone(),
                subtitle: describe_chat(&chat.kind),
                read_only: chat.read_only,
                messages,
            });
        }

        Ok(InternalStateView {
            base_url: self.base_url.clone(),
            token: token.to_string(),
            bot: bot.as_telegram_user(),
            chats,
        })
    }

    fn insert_message(
        &self,
        token: &str,
        chat_id: i64,
        is_bot: bool,
        text: &str,
        update_type: Option<&str>,
    ) -> Result<MessageRecord, ApiError> {
        let connection = self
            .db
            .lock()
            .map_err(|_| ApiError::internal("Internal Server Error: database lock poisoned"))?;

        let chat = connection
            .query_row(
                "SELECT id, type, title, username, read_only FROM chats WHERE id = ?1",
                params![chat_id],
                |row| {
                    Ok(ChatRecord {
                        id: row.get(0)?,
                        kind: row.get(1)?,
                        title: row.get(2)?,
                        username: row.get(3)?,
                        read_only: row.get::<_, i64>(4)? != 0,
                    })
                },
            )
            .optional()
            .map_err(map_sqlite_error)?
            .ok_or_else(|| ApiError::bad_request("Bad Request: chat not found"))?;

        if update_type.is_some() && chat.read_only {
            return Err(ApiError::bad_request(
                "Bad Request: this chat is read only in the local simulator",
            ));
        }

        let next_message_id = connection
            .query_row(
                "SELECT COALESCE(MAX(message_id), 0) + 1 FROM messages WHERE bot_token = ?1",
                params![token],
                |row| row.get::<_, i64>(0),
            )
            .map_err(map_sqlite_error)?;

        let timestamp = unix_timestamp();

        connection
            .execute(
                "
                INSERT INTO messages (bot_token, message_id, chat_id, date, is_bot, text)
                VALUES (?1, ?2, ?3, ?4, ?5, ?6)
                ",
                params![
                    token,
                    next_message_id,
                    chat_id,
                    timestamp,
                    if is_bot { 1_i64 } else { 0_i64 },
                    text
                ],
            )
            .map_err(map_sqlite_error)?;

        if let Some(kind) = update_type {
            connection
                .execute(
                    "INSERT INTO updates (bot_token, message_id, update_type) VALUES (?1, ?2, ?3)",
                    params![token, next_message_id, kind],
                )
                .map_err(map_sqlite_error)?;
        }

        Ok(MessageRecord {
            message_id: next_message_id,
            date: timestamp,
            is_bot,
            text: text.to_string(),
            chat,
        })
    }
}

impl BotProfile {
    fn as_telegram_user(&self) -> TelegramUser {
        TelegramUser {
            id: self.id,
            is_bot: true,
            first_name: self.first_name.clone(),
            username: self.username.clone(),
            can_join_groups: None,
            can_read_all_group_messages: None,
            supports_inline_queries: None,
            can_connect_to_business: None,
            has_main_web_app: None,
            has_topics_enabled: None,
            allows_users_to_create_topics: None,
            can_manage_bots: None,
        }
    }

    fn as_me_user(&self) -> TelegramUser {
        TelegramUser {
            id: self.id,
            is_bot: true,
            first_name: self.first_name.clone(),
            username: self.username.clone(),
            can_join_groups: Some(self.can_join_groups),
            can_read_all_group_messages: Some(self.can_read_all_group_messages),
            supports_inline_queries: Some(self.supports_inline_queries),
            can_connect_to_business: Some(self.can_connect_to_business),
            has_main_web_app: Some(self.has_main_web_app),
            has_topics_enabled: Some(self.has_topics_enabled),
            allows_users_to_create_topics: Some(self.allows_users_to_create_topics),
            can_manage_bots: Some(self.can_manage_bots),
        }
    }
}

fn default_bot_command_scope() -> String {
    "default".to_string()
}

fn describe_chat(kind: &str) -> String {
    match kind {
        "private" => "Direct line to the local test user".to_string(),
        "group" => "Shared room for user and bot messages".to_string(),
        "channel" => "Broadcast preview driven by bot output".to_string(),
        _ => "Telegram-style chat".to_string(),
    }
}

fn map_sqlite_error(error: rusqlite::Error) -> ApiError {
    ApiError::internal(format!("Internal Server Error: {error}"))
}

fn unix_timestamp() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs() as i64)
        .unwrap_or_default()
}

fn serialize_chat(chat: &ChatRecord) -> TelegramChat {
    if chat.kind == "private" {
        TelegramChat {
            id: chat.id,
            kind: chat.kind.clone(),
            title: None,
            first_name: Some(chat.title.clone()),
            username: chat.username.clone(),
        }
    } else {
        TelegramChat {
            id: chat.id,
            kind: chat.kind.clone(),
            title: Some(chat.title.clone()),
            first_name: None,
            username: chat.username.clone(),
        }
    }
}

fn serialize_message(bot: &BotProfile, record: &MessageRecord) -> TelegramMessage {
    let chat = serialize_chat(&record.chat);
    let is_channel_post = record.chat.kind == "channel" && record.is_bot;

    let from = if is_channel_post {
        None
    } else if record.is_bot {
        Some(bot.as_telegram_user())
    } else {
        Some(TelegramUser {
            id: USER_ID,
            is_bot: false,
            first_name: USER_NAME.to_string(),
            username: USER_USERNAME.to_string(),
            can_join_groups: None,
            can_read_all_group_messages: None,
            supports_inline_queries: None,
            can_connect_to_business: None,
            has_main_web_app: None,
            has_topics_enabled: None,
            allows_users_to_create_topics: None,
            can_manage_bots: None,
        })
    };

    let sender_chat = if is_channel_post {
        Some(chat.clone())
    } else {
        None
    };

    TelegramMessage {
        message_id: record.message_id,
        date: record.date,
        chat,
        from,
        sender_chat,
        text: record.text.clone(),
    }
}

fn serialize_update(bot: &BotProfile, record: UpdateRecord) -> TelegramUpdate {
    let message = serialize_message(bot, &record.message);

    if record.update_type == "channel_post" {
        TelegramUpdate {
            update_id: record.update_id,
            message: None,
            channel_post: Some(message),
        }
    } else {
        TelegramUpdate {
            update_id: record.update_id,
            message: Some(message),
            channel_post: None,
        }
    }
}

fn token_from_segment(segment: &str) -> Result<&str, ApiError> {
    segment
        .strip_prefix("bot")
        .filter(|token| !token.is_empty())
        .ok_or_else(|| {
            ApiError::bad_request("Bad Request: malformed bot path, expected /bot<TOKEN>/METHOD")
        })
}

fn token_or_default(token: Option<&str>) -> &str {
    token
        .and_then(|value| {
            let trimmed = value.trim();
            if trimmed.is_empty() {
                None
            } else {
                Some(trimmed)
            }
        })
        .unwrap_or(DEFAULT_TOKEN)
}

fn parse_request<T: DeserializeOwned + Default>(
    headers: &HeaderMap,
    body: &[u8],
    raw_query: Option<&str>,
) -> Result<T, ApiError> {
    if !body.is_empty() {
        let content_type = headers
            .get(CONTENT_TYPE)
            .and_then(|value| value.to_str().ok())
            .unwrap_or_default();

        let parsed = if content_type.contains("application/json") {
            serde_json::from_slice(body).map_err(|error| error.to_string())
        } else if content_type.contains("application/x-www-form-urlencoded")
            || content_type.is_empty()
        {
            serde_urlencoded::from_bytes(body)
                .map_err(|error| error.to_string())
                .or_else(|_| serde_json::from_slice(body).map_err(|error| error.to_string()))
        } else {
            serde_json::from_slice(body)
                .map_err(|error| error.to_string())
                .or_else(|_| serde_urlencoded::from_bytes(body).map_err(|error| error.to_string()))
        };

        return parsed.map_err(|error| ApiError::bad_request(format!("Bad Request: {error}")));
    }

    if let Some(query) = raw_query.filter(|value| !value.is_empty()) {
        return serde_urlencoded::from_str(query)
            .map_err(|error| ApiError::bad_request(format!("Bad Request: {error}")));
    }

    Ok(T::default())
}

fn ensure_column(
    connection: &Connection,
    table_name: &str,
    column_name: &str,
    column_definition: &str,
) -> rusqlite::Result<()> {
    let pragma = format!("PRAGMA table_info({table_name})");
    let mut statement = connection.prepare(&pragma)?;
    let column_names = statement
        .query_map([], |row| row.get::<_, String>(1))?
        .collect::<Result<Vec<_>, _>>()?;

    if column_names.iter().any(|existing| existing == column_name) {
        return Ok(());
    }

    let alter = format!("ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}");
    connection.execute(&alter, [])?;

    Ok(())
}

fn normalize_language_code(language_code: Option<&str>) -> String {
    language_code.unwrap_or_default().trim().to_string()
}

fn normalized_optional_text(value: Option<&str>) -> Option<String> {
    value.and_then(|item| {
        let trimmed = item.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_string())
        }
    })
}

fn server_host() -> String {
    std::env::var("TELEMOCK_HOST")
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| DEFAULT_SERVER_HOST.to_string())
}

fn server_port() -> u16 {
    std::env::var("TELEMOCK_PORT")
        .ok()
        .and_then(|value| value.trim().parse::<u16>().ok())
        .filter(|value| *value != 0)
        .unwrap_or(DEFAULT_SERVER_PORT)
}

fn server_base_url() -> String {
    format!("http://{}:{}", server_host(), server_port())
}

fn redact_token(token: &str) -> String {
    let mut chars = token.chars();
    let prefix: String = chars.by_ref().take(6).collect();
    let suffix: String = token
        .chars()
        .rev()
        .take(4)
        .collect::<String>()
        .chars()
        .rev()
        .collect();

    if token.len() <= 12 {
        token.to_string()
    } else {
        format!("{prefix}...{suffix}")
    }
}

fn log_server(message: impl AsRef<str>) {
    println!("[telemock-server] {}", message.as_ref());
}

fn log_server_error(message: impl AsRef<str>) {
    eprintln!("[telemock-server] {}", message.as_ref());
}

fn deserialize_bot_commands<'de, D>(deserializer: D) -> Result<Vec<BotCommand>, D::Error>
where
    D: Deserializer<'de>,
{
    #[derive(Deserialize)]
    #[serde(untagged)]
    enum BotCommandsField {
        Native(Vec<BotCommand>),
        Json(String),
    }

    match BotCommandsField::deserialize(deserializer)? {
        BotCommandsField::Native(commands) => Ok(commands),
        BotCommandsField::Json(value) => {
            serde_json::from_str(&value).map_err(serde::de::Error::custom)
        }
    }
}

fn deserialize_optional_bot_command_scope<'de, D>(
    deserializer: D,
) -> Result<Option<BotCommandScope>, D::Error>
where
    D: Deserializer<'de>,
{
    #[derive(Deserialize)]
    #[serde(untagged)]
    enum ScopeField {
        Native(BotCommandScope),
        Json(String),
    }

    match Option::<ScopeField>::deserialize(deserializer)? {
        None => Ok(None),
        Some(ScopeField::Native(scope)) => Ok(Some(scope)),
        Some(ScopeField::Json(value)) => serde_json::from_str(&value)
            .map(Some)
            .map_err(serde::de::Error::custom),
    }
}

fn serialize_command_scope(scope: Option<&BotCommandScope>) -> Result<String, ApiError> {
    serde_json::to_string(scope.unwrap_or(&BotCommandScope::default()))
        .map_err(|error| ApiError::internal(format!("Internal Server Error: {error}")))
}

fn canonical_method_name(method_name: &str) -> Option<&'static str> {
    KNOWN_BOT_API_METHODS
        .iter()
        .copied()
        .find(|candidate| candidate.eq_ignore_ascii_case(method_name))
}

fn api_response<T: Serialize>(result: T) -> Response {
    Json(ApiEnvelope { ok: true, result }).into_response()
}

async fn bot_api_entry(
    State(state): State<AppState>,
    Path((bot_segment, method_name)): Path<(String, String)>,
    raw_query: RawQuery,
    headers: HeaderMap,
    body: Bytes,
) -> Result<Response, ApiError> {
    let token = token_from_segment(&bot_segment)?;
    let canonical_method = canonical_method_name(&method_name).ok_or_else(|| {
        ApiError::bad_request(format!("Bad Request: unknown method {method_name}"))
    })?;
    let query = raw_query.0.as_deref();
    let content_type = headers
        .get(CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .unwrap_or_default();
    log_server(format!(
        "api method={canonical_method} token={} content_type={} body_bytes={} query_present={}",
        redact_token(token),
        if content_type.is_empty() {
            "<empty>"
        } else {
            content_type
        },
        body.len(),
        query.is_some_and(|value| !value.is_empty())
    ));

    match canonical_method {
        "getMe" => Ok(api_response(state.get_or_create_bot(token)?.as_me_user())),
        "getUpdates" => {
            let params = parse_request::<GetUpdatesParams>(&headers, &body, query)?;
            Ok(api_response(state.get_updates(token, params)?))
        }
        "sendMessage" => {
            let params = parse_request::<SendMessageParams>(&headers, &body, query)?;
            Ok(api_response(state.send_bot_message(token, params.chat_id, &params.text)?))
        }
        "setWebhook" => {
            let params = parse_request::<SetWebhookParams>(&headers, &body, query)?;
            Ok(api_response(state.set_webhook(token, params)?))
        }
        "deleteWebhook" => {
            let params = parse_request::<DeleteWebhookParams>(&headers, &body, query)?;
            Ok(api_response(state.delete_webhook(token, params)?))
        }
        "getWebhookInfo" => Ok(api_response(state.get_webhook_info(token)?)),
        "setMyName" => {
            let params = parse_request::<SetMyNameParams>(&headers, &body, query)?;
            Ok(api_response(state.set_my_name(token, params)?))
        }
        "getMyName" => {
            let params = parse_request::<GetMyNameParams>(&headers, &body, query)?;
            Ok(api_response(state.get_my_name(token, params)?))
        }
        "setMyDescription" => {
            let params = parse_request::<SetMyDescriptionParams>(&headers, &body, query)?;
            Ok(api_response(state.set_my_description(token, params)?))
        }
        "getMyDescription" => {
            let params = parse_request::<GetMyDescriptionParams>(&headers, &body, query)?;
            Ok(api_response(state.get_my_description(token, params)?))
        }
        "setMyShortDescription" => {
            let params = parse_request::<SetMyShortDescriptionParams>(&headers, &body, query)?;
            Ok(api_response(state.set_my_short_description(token, params)?))
        }
        "getMyShortDescription" => {
            let params = parse_request::<GetMyShortDescriptionParams>(&headers, &body, query)?;
            Ok(api_response(state.get_my_short_description(token, params)?))
        }
        "setMyCommands" => {
            let params = parse_request::<SetMyCommandsParams>(&headers, &body, query)?;
            Ok(api_response(state.set_my_commands(token, params)?))
        }
        "getMyCommands" => {
            let params = parse_request::<GetMyCommandsParams>(&headers, &body, query)?;
            Ok(api_response(state.get_my_commands(token, params)?))
        }
        "deleteMyCommands" => {
            let params = parse_request::<GetMyCommandsParams>(&headers, &body, query)?;
            Ok(api_response(state.delete_my_commands(token, params)?))
        }
        "logOut" | "close" => Ok(api_response(true)),
        _ => Err(ApiError::not_implemented(format!(
            "Not Implemented: {canonical_method} is recognized by the simulator but not simulated yet"
        ))),
    }
}

async fn internal_state(
    State(state): State<AppState>,
    Query(query): Query<InternalTokenQuery>,
) -> Result<Json<ApiEnvelope<InternalStateView>>, ApiError> {
    let token = token_or_default(query.token.as_deref());
    let snapshot = state.load_internal_state(token)?;

    Ok(Json(ApiEnvelope {
        ok: true,
        result: snapshot,
    }))
}

async fn internal_send(
    State(state): State<AppState>,
    Json(request): Json<InternalSendRequest>,
) -> Result<Json<ApiEnvelope<TelegramMessage>>, ApiError> {
    let token = token_or_default(request.token.as_deref());
    let message = state.send_user_message(token, request.chat_id, &request.text)?;

    Ok(Json(ApiEnvelope {
        ok: true,
        result: message,
    }))
}

async fn healthcheck() -> Json<ApiEnvelope<&'static str>> {
    Json(ApiEnvelope {
        ok: true,
        result: "ready",
    })
}

async fn start_server(state: AppState) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let base_url = state.base_url.clone();
    let app = Router::new()
        .route("/internal/health", get(healthcheck))
        .route("/internal/state", get(internal_state))
        .route("/internal/send", post(internal_send))
        .route("/:bot_segment/:method_name", any(bot_api_entry))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(state);

    let host = server_host();
    let port = server_port();
    log_server(format!("binding local Bot API server on {host}:{port}"));
    let listener = tokio::net::TcpListener::bind((host.as_str(), port)).await?;

    log_server(format!("listening on {base_url}"));

    axum::serve(listener, app).await?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));
            let base_url = server_base_url();
            log_server(format!("preparing local Bot API server at {base_url}"));
            let state = AppState::new(data_dir.join("telemock.sqlite3"), base_url)?;

            let server_state = state.clone();
            tauri::async_runtime::spawn(async move {
                log_server("background server task started");
                if let Err(error) = start_server(server_state).await {
                    log_server_error(format!("server task failed: {error}"));
                }
            });

            app.manage(state);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn user_messages_enter_and_leave_the_update_queue() {
        let state = AppState::in_memory(DEFAULT_SERVER_BASE_URL).expect("state");

        state
            .send_user_message(DEFAULT_TOKEN, 1, "hello")
            .expect("user message");

        let first_batch = state
            .get_updates(
                DEFAULT_TOKEN,
                GetUpdatesParams {
                    offset: None,
                    limit: None,
                    _timeout: None,
                },
            )
            .expect("first updates");

        assert_eq!(first_batch.len(), 1);
        assert_eq!(
            first_batch[0]
                .message
                .as_ref()
                .expect("message update")
                .text,
            "hello"
        );

        let second_batch = state
            .get_updates(
                DEFAULT_TOKEN,
                GetUpdatesParams {
                    offset: None,
                    limit: None,
                    _timeout: None,
                },
            )
            .expect("second updates");

        assert!(second_batch.is_empty());
    }

    #[test]
    fn bot_messages_are_visible_in_the_ui_snapshot() {
        let state = AppState::in_memory(DEFAULT_SERVER_BASE_URL).expect("state");

        state
            .send_bot_message(DEFAULT_TOKEN, 1, "Hello from bot")
            .expect("bot message");

        let snapshot = state.load_internal_state(DEFAULT_TOKEN).expect("snapshot");
        let private_chat = snapshot
            .chats
            .into_iter()
            .find(|chat| chat.id == 1)
            .expect("private chat");

        assert_eq!(private_chat.messages.len(), 1);
        assert_eq!(private_chat.messages[0].text, "Hello from bot");
        assert!(private_chat.messages[0].from.as_ref().expect("from").is_bot);
    }
}
