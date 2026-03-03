use crate::settings_store;
use tauri::AppHandle;

#[tauri::command]
pub fn get_settings(app: AppHandle) -> std::result::Result<settings_store::AppSettings, String> {
    let settings = settings_store::load_settings(&app)?;
    Ok(settings)
}

#[tauri::command]
pub fn save_settings_cmd(
    app: AppHandle,
    settings: settings_store::AppSettings,
) -> std::result::Result<(), String> {
    settings_store::save_settings(&app, &settings)?;
    Ok(())
}
