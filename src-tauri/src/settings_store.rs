use crate::error::{AppError, Result};
use log::{info, warn};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    #[serde(default)]
    pub ui: UiSettings,
    #[serde(default)]
    pub update: UpdateSettings,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UiSettings {
    #[serde(default)]
    pub theme: String, // "light" | "dark" | "system"
    pub language: String, // "ja" | "en"
}

impl Default for UiSettings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            language: "ja".to_string(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettings {
    pub check_on_startup: bool,
    pub include_prerelease: bool,
}

impl Default for UpdateSettings {
    fn default() -> Self {
        Self {
            check_on_startup: true,
            include_prerelease: false,
        }
    }
}

fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| AppError::Storage(format!("Failed to get app data dir: {}", e)))?;

    Ok(dir.join("settings.json"))
}

pub fn load_settings(app: &tauri::AppHandle) -> Result<AppSettings> {
    let path = settings_path(app)?;

    // ファイルが存在しない場合はデフォルト値を返す
    if !path.exists() {
        info!("Settings file not found, using defaults");
        return Ok(AppSettings::default());
    }
    // ファイルを読み込み
    let content = fs::read_to_string(&path)
        .map_err(|e| AppError::Storage(format!("Failed to read settings: {}", e)))?;

    // JSONをパース（失敗したらデフォルト値を返す）
    match serde_json::from_str::<AppSettings>(&content) {
        Ok(settings) => Ok(settings),
        Err(e) => {
            warn!("Failed to parse settings ({}), using defaults", e);
            Ok(AppSettings::default())
        }
    }
}

pub fn save_settings(app: &tauri::AppHandle, settings: &AppSettings) -> Result<()> {
    let path = settings_path(app)?;

    // 親ディレクトリが存在しなければ作成
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| AppError::Storage(format!("Failed to create dir: {}", e)))?;
        }
    }

    // JSONに変換して書き込み
    let content = serde_json::to_string_pretty(settings)
        .map_err(|e| AppError::Storage(format!("Failed to serialize settings: {}", e)))?;

    let tmp_path = path.with_extension("json.tmp");
    fs::write(&tmp_path, content)
        .map_err(|e| AppError::Storage(format!("Failed to write tmp: {}", e)))?;

    fs::rename(&tmp_path, &path)
        .map_err(|e| AppError::Storage(format!("Failed to rename settings: {}", e)))?;
    info!("Settings saved to {:?}", path);
    Ok(())
}
