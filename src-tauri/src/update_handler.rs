use serde::Serialize;
use tauri::AppHandle;
use tauri_plugin_updater::UpdaterExt;
use url::Url;

use crate::settings_store;

const RELEASE_ENDPOINT: &str =
    "https://github.com/Takadayoo/vrchat-group-manager/releases/latest/download/latest.json";
const PRERELEASE_ENDPOINT: &str =
    "https://github.com/Takadayoo/vrchat-group-manager/releases/download/pre-release/latest.json";

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub version: String,
    pub body: Option<String>,
}

fn get_endpoint(include_prerelease: bool) -> &'static str {
    if include_prerelease {
        PRERELEASE_ENDPOINT
    } else {
        RELEASE_ENDPOINT
    }
}

/// アップデートを確認する
pub async fn check(app: &AppHandle) -> Result<Option<UpdateInfo>, String> {
    let settings = settings_store::load_settings(app)?;
    let url = Url::parse(get_endpoint(settings.update.include_prerelease))
        .map_err(|e| e.to_string())?;

    let update = app
        .updater_builder()
        .endpoints(vec![url])
        .map_err(|e| e.to_string())?
        .build()
        .map_err(|e| e.to_string())?
        .check()
        .await
        .map_err(|e| e.to_string())?;

    Ok(update.map(|u| UpdateInfo {
        version: u.version,
        body: u.body,
    }))
}

/// アップデートをダウンロードしてインストールする
pub async fn install(app: &AppHandle) -> Result<(), String> {
    let settings = settings_store::load_settings(app)?;
    let url = Url::parse(get_endpoint(settings.update.include_prerelease))
        .map_err(|e| e.to_string())?;

    let update = app
        .updater_builder()
        .endpoints(vec![url])
        .map_err(|e| e.to_string())?
        .build()
        .map_err(|e| e.to_string())?
        .check()
        .await
        .map_err(|e| e.to_string())?;

    if let Some(update) = update {
        update
            .download_and_install(|_chunk: usize, _total: Option<u64>| {}, || {})
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}
