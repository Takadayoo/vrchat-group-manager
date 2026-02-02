use serde::{Deserialize, Serialize};

mod error;
mod token_store;
mod vrc_api;

/// ユーザー情報レスポンス
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub display_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar_url: Option<String>,
}

/// グループ情報レスポンス
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GroupResponse {
    pub group_id: String,
    pub name: String,
    pub member_visibility: String, // "visible", "friends", "hidden"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub member_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
}

/// ログインレスポンス
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
    pub user: UserResponse,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            login_with_token,
            get_my_groups,
            update_group_status,
            save_token,
            load_token,
            delete_token,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// トークンでログイン
#[tauri::command]
async fn login_with_token(token: String) -> std::result::Result<LoginResponse, String> {
    // トークンを保存
    token_store::save_token(&token)?;

    // ユーザー情報を取得
    let user = vrc_api::get_my_user(&token).await?;

    Ok(LoginResponse {
        user: UserResponse {
            id: user.id,
            username: user.username.unwrap_or_default(),
            display_name: user.display_name,
            avatar_url: user.avatar_url,
        },
    })
}

/// グループ一覧取得
#[tauri::command]
async fn get_my_groups(token: String, user_id: String) -> std::result::Result<Vec<GroupResponse>, String> {
    let groups = vrc_api::get_my_groups(&token, &user_id).await?;

    Ok(groups.into_iter().map(group_to_response).collect())
}

/// グループの可視状態を更新
#[tauri::command]
async fn update_group_status(
    group_id: String,
    visibility: String,
) -> std::result::Result<(), String> {
    let token = token_store::load_token()?.ok_or("Token not found")?;
    let user = vrc_api::get_my_user(&token).await?;

    let vis = vrc_api::parse_visibility(&visibility)?;
    vrc_api::update_group_visibility(&token, &user.id, &group_id, vis).await?;

    Ok(())
}

/// トークンを保存
#[tauri::command]
fn save_token(token: String) -> std::result::Result<(), String> {
    token_store::save_token(&token)?;
    Ok(())
}

/// トークンを読み込み
#[tauri::command]
fn load_token() -> std::result::Result<Option<String>, String> {
    let token = token_store::load_token()?;
    Ok(token)
}

/// トークンを削除
#[tauri::command]
fn delete_token() -> std::result::Result<(), String> {
    token_store::delete_token()?;
    Ok(())
}

/// VRCGroupをGroupResponseに変換
fn group_to_response(group: vrc_api::VRCGroup) -> GroupResponse {
    GroupResponse {
        group_id: group.group_id,
        name: group.name,
        member_visibility: match group.member_visibility {
            vrc_api::GroupMemberVisibility::Visible => "visible".to_string(),
            vrc_api::GroupMemberVisibility::Friends => "friends".to_string(),
            vrc_api::GroupMemberVisibility::Hidden => "hidden".to_string(),
        },
        icon_url: group.icon_url,
        member_count: group.member_count,
        created_at: group.created_at,
    }
}
