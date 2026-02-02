use keyring::Entry;
use log::{info, warn};

use crate::error::{AppError, Result};

/// keyringのサービス名（Windows資格情報マネージャーで表示される名前）
const SERVICE_NAME: &str = "VRChatGroupManager";
/// keyringのユーザー名（識別子）
const USERNAME: &str = "api_token";

/// keyring Entryを作成
fn create_entry() -> Result<Entry> {
    Entry::new(SERVICE_NAME, USERNAME)
        .map_err(|e| AppError::Storage(format!("Failed to create keyring entry: {}", e)))
}

/// トークンを保存
///
/// Windows: 資格情報マネージャーに保存
/// macOS: キーチェーンに保存
/// Linux: Secret Serviceに保存
pub fn save_token(token: &str) -> Result<()> {
    info!("Saving token to system keyring");
    info!("Service: {}, User: {}", SERVICE_NAME, USERNAME);

    let entry = create_entry()?;

    // トークンを保存
    entry.set_password(token).map_err(|e| match e {
        keyring::Error::PlatformFailure(msg) => {
            AppError::Storage(format!("Platform error: {}", msg))
        }
        _ => AppError::Storage(format!("Failed to save token: {}", e)),
    })?;

    info!("Token saved successfully to keyring");
    Ok(())
}

/// トークンを読み込み
pub fn load_token() -> Result<Option<String>> {
    info!("Loading token from system keyring");
    info!("Service: {}, User: {}", SERVICE_NAME, USERNAME);

    let entry = create_entry()?;

    // トークンを取得
    match entry.get_password() {
        Ok(token) => {
            info!("Token loaded successfully (length: {})", token.len());
            Ok(Some(token))
        }
        Err(keyring::Error::NoEntry) => {
            warn!("No token found in keyring");
            Ok(None)
        }
        Err(keyring::Error::PlatformFailure(msg)) => {
            Err(AppError::Storage(format!("Platform error: {}", msg)))
        }
        Err(e) => Err(AppError::Storage(format!("Failed to load token: {}", e))),
    }
}

/// トークンを削除
pub fn delete_token() -> Result<()> {
    info!("Deleting token from system keyring");

    let entry = create_entry()?;

    // トークンを削除
    match entry.delete_credential() {
        Ok(_) => {
            info!("Token deleted successfully");
            Ok(())
        }
        Err(keyring::Error::NoEntry) => {
            warn!("Token not found (already deleted)");
            Ok(())
        }
        Err(keyring::Error::PlatformFailure(msg)) => {
            Err(AppError::Storage(format!("Platform error: {}", msg)))
        }
        Err(e) => Err(AppError::Storage(format!("Failed to delete token: {}", e))),
    }
}
