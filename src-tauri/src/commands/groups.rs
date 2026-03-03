use crate::models::{group_to_response, GroupResponse};
use crate::{token_store, vrc_api};

/// グループ一覧取得
#[tauri::command]
pub async fn get_my_groups(
    token: String,
    user_id: String,
) -> std::result::Result<Vec<GroupResponse>, String> {
    let groups = vrc_api::get_my_groups(&token, &user_id).await?;
    Ok(groups.into_iter().map(group_to_response).collect())
}

/// グループの可視状態を更新
#[tauri::command]
pub async fn update_group_status(
    user_id: String,
    group_id: String,
    visibility: String,
) -> std::result::Result<(), String> {
    let token = token_store::load_token()?.ok_or("Token not found")?;
    let vis = vrc_api::parse_visibility(&visibility)?;
    vrc_api::update_group_visibility(&token, &user_id, &group_id, vis).await?;
    Ok(())
}

/// 掲示中のグループを取得する
#[tauri::command]
pub async fn get_represented_group() -> std::result::Result<Vec<GroupResponse>, String> {
    let token = token_store::load_token()?.ok_or("Token not found")?;
    let user = vrc_api::get_my_user(&token).await?;
    let groups = vrc_api::get_represented_group(&token, &user.id).await?;

    Ok(groups.into_iter().map(group_to_response).collect())
}

/// 指定したグループを掲示する
#[tauri::command]
pub async fn update_group_representation(
    group_id: String,
    is_representing: bool,
) -> std::result::Result<(), String> {
    let token = token_store::load_token()?.ok_or("Token not found")?;
    vrc_api::update_group_representation(&token, &group_id, &is_representing).await?;
    Ok(())
}
