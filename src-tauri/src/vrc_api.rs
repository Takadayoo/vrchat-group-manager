use reqwest::header::{HeaderMap, HeaderValue, COOKIE, USER_AGENT};
use serde::{Deserialize, Serialize};
use std::fmt;

use crate::error::{AppError, Result};

/// グループメンバーの可視状態
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum GroupMemberVisibility {
    Visible,
    Friends,
    Hidden,
}

impl fmt::Display for GroupMemberVisibility {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Visible => write!(f, "visible"),
            Self::Friends => write!(f, "friends"),
            Self::Hidden => write!(f, "hidden"),
        }
    }
}

/// VRChatユーザー情報
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VRCUser {
    pub id: String,
    pub username: Option<String>,
    #[serde(rename = "displayName")]
    pub display_name: String,
    #[serde(rename = "profilePicOverride")]
    pub avatar_url: Option<String>,
}

/// VRChatグループ情報
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VRCGroup {
    pub name: String,
    pub description: String,
    #[serde(rename = "iconUrl")]
    pub icon_url: Option<String>,
    #[serde(rename = "memberCount")]
    pub member_count: Option<i32>,
    #[serde(rename = "groupId")]
    pub group_id: String,
    #[serde(rename = "memberVisibility")]
    pub member_visibility: GroupMemberVisibility,
    #[serde(rename = "isRepresenting")]
    pub is_representing: Option<bool>,
}

const USER_AGENT_STR: &str = "VRC Group Manager/0.2.3 discord:takadayoo_1203";
const BASE_URL: &str = "https://api.vrchat.cloud/api/1";

/// HTTPクライアントを作成
fn create_http_client(token: &str) -> Result<reqwest::Client> {
    let mut headers = HeaderMap::new();

    headers.insert(USER_AGENT, HeaderValue::from_static(USER_AGENT_STR));

    let cookie_value = format!("auth={}", token);
    headers.insert(
        COOKIE,
        HeaderValue::from_str(&cookie_value)
            .map_err(|e| AppError::Auth(format!("Invalid token format: {}", e)))?,
    );

    reqwest::Client::builder()
        .default_headers(headers)
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| AppError::Network(format!("Failed to create HTTP client: {}", e)))
}

/// HTTPステータスコードからエラーを生成
fn create_http_error(status: u16) -> AppError {
    match status {
        401 => AppError::Auth("Invalid or expired token".to_string()),
        403 => AppError::Auth("Forbidden: insufficient permissions".to_string()),
        429 => AppError::RateLimit,
        404 => AppError::Http {
            status,
            message: "Resource not found".to_string(),
        },
        500..=599 => AppError::Http {
            status,
            message: "Server error".to_string(),
        },
        _ => AppError::Http {
            status,
            message: format!("HTTP error: {}", status),
        },
    }
}

/// visibility文字列をGroupMemberVisibilityに変換
pub fn parse_visibility(visibility: &str) -> Result<GroupMemberVisibility> {
    match visibility {
        "visible" => Ok(GroupMemberVisibility::Visible),
        "friends" => Ok(GroupMemberVisibility::Friends),
        "hidden" => Ok(GroupMemberVisibility::Hidden),
        _ => Err(AppError::Unknown(format!(
            "Invalid visibility: {}",
            visibility
        ))),
    }
}

/// 現在のユーザー情報を取得
pub async fn get_my_user(token: &str) -> Result<VRCUser> {
    let client = create_http_client(token)?;
    let url = format!("{}/auth/user", BASE_URL);

    let response = client.get(&url).send().await?;
    let status = response.status().as_u16();

    if !response.status().is_success() {
        return Err(create_http_error(status));
    }

    let user = response
        .json::<VRCUser>()
        .await
        .map_err(|e| AppError::Json(format!("Failed to decode user data: {}", e)))?;

    Ok(user)
}

/// ユーザーの所属グループ一覧を取得
pub async fn get_my_groups(token: &str, user_id: &str) -> Result<Vec<VRCGroup>> {
    let client = create_http_client(token)?;
    let url = format!("{}/users/{}/groups", BASE_URL, user_id);

    let response = client.get(&url).send().await?;
    let status = response.status().as_u16();

    if !response.status().is_success() {
        return Err(create_http_error(status));
    }

    let groups = response
        .json::<Vec<VRCGroup>>()
        .await
        .map_err(|e| AppError::Json(format!("Failed to decode groups data: {}", e)))?;

    Ok(groups)
}

/// グループの可視状態を更新
pub async fn update_group_visibility(
    token: &str,
    user_id: &str,
    group_id: &str,
    visibility: GroupMemberVisibility,
) -> Result<()> {
    let client = create_http_client(token)?;
    let url = format!("{}/groups/{}/members/{}", BASE_URL, group_id, user_id);

    let body = serde_json::json!({ "visibility": visibility.to_string() });

    let response = client.put(&url).json(&body).send().await?;
    let status = response.status().as_u16();

    if !response.status().is_success() {
        return Err(create_http_error(status));
    }

    Ok(())
}

/// 掲示中のグループを取得する
pub async fn get_represented_group(token: &str, user_id: &str) -> Result<Vec<VRCGroup>> {
    let client = create_http_client(token)?;
    let url = format!("{}/users/{}/groups/represented", BASE_URL, user_id);

    let response = client.get(&url).send().await?;
    let status = response.status().as_u16();

    if !response.status().is_success() {
        return Err(create_http_error(status));
    }

    let groups = response
        .json::<Vec<VRCGroup>>()
        .await
        .map_err(|e| AppError::Json(format!("Failed to decode groups data: {}", e)))?;

    Ok(groups)
}

/// 指定したグループを掲示する(掲示中の場合を掲示停止する)
pub async fn update_group_representation(
    token: &str,
    group_id: &str,
    is_representing: &bool,
) -> Result<()> {
    let client = create_http_client(token)?;
    let url = format!("{}/groups/{}/representation", BASE_URL, group_id);

    let body = serde_json::json!({ "isRepresenting": is_representing });

    let response = client.put(&url).json(&body).send().await?;
    let status = response.status().as_u16();

    if !response.status().is_success() {
        return Err(create_http_error(status));
    }

    Ok(())
}
