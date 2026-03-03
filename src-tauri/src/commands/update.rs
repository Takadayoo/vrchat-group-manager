use crate::update_handler;
use tauri::AppHandle;

/// アップデートを確認する
#[tauri::command]
pub async fn check_for_updates(
    app: AppHandle,
) -> std::result::Result<Option<update_handler::UpdateInfo>, String> {
    update_handler::check(&app).await
}

/// アップデートをダウンロードしてインストール
#[tauri::command]
pub async fn install_update(app: AppHandle) -> std::result::Result<(), String> {
    update_handler::install(&app).await
}
