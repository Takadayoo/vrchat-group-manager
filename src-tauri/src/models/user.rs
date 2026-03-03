use serde::{Deserialize, Serialize};

/// VRChatユーザー情報（API生レスポンス）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VRCUser {
    pub id: String,
    pub username: Option<String>,
    #[serde(rename = "displayName")]
    pub display_name: String,
    #[serde(rename = "profilePicOverride")]
    pub avatar_url: Option<String>,
}

/// フロントエンドに返すユーザーDTO
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub display_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar_url: Option<String>,
}

/// フロントエンドに返すログインDTO
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
    pub user: UserResponse,
}
