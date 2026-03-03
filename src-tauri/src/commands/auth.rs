use crate::models::{LoginResponse, UserResponse};
use crate::{token_store, vrc_api};

/// トークンでログイン
#[tauri::command]
pub async fn login_with_token(token: String) -> std::result::Result<LoginResponse, String> {
    token_store::save_token(&token)?;

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

/// トークンを保存
#[tauri::command]
pub fn save_token(token: String) -> std::result::Result<(), String> {
    token_store::save_token(&token)?;
    Ok(())
}

/// トークンを読み込み
#[tauri::command]
pub fn load_token() -> std::result::Result<Option<String>, String> {
    let token = token_store::load_token()?;
    Ok(token)
}

/// トークンを削除
#[tauri::command]
pub fn delete_token() -> std::result::Result<(), String> {
    token_store::delete_token()?;
    Ok(())
}
