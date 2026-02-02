/// アプリケーション全体で使用するエラー型
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Network error: {0}")]
    Network(String),

    #[error("HTTP error: status {status}, message: {message}")]
    Http { status: u16, message: String },

    #[error("Authentication failed: {0}")]
    Auth(String),

    #[error("JSON serialization/deserialization error: {0}")]
    Json(String),

    #[error("Storage error: {0}")]
    Storage(String),

    #[error("Tauri error: {0}")]
    Tauri(String),

    #[error("Rate limit exceeded")]
    RateLimit,

    #[error("Unknown error: {0}")]
    Unknown(String),
}

// Tauriコマンドで使うため、StringへのFrom実装
impl From<AppError> for String {
    fn from(error: AppError) -> Self {
        error.to_string()
    }
}

// reqwestエラーからの変換
impl From<reqwest::Error> for AppError {
    fn from(error: reqwest::Error) -> Self {
        if error.is_timeout() {
            AppError::Network("Request timeout".to_string())
        } else if error.is_connect() {
            AppError::Network("Connection failed".to_string())
        } else {
            AppError::Network(error.to_string())
        }
    }
}

// serde_jsonエラーからの変換
impl From<serde_json::Error> for AppError {
    fn from(error: serde_json::Error) -> Self {
        AppError::Json(error.to_string())
    }
}

// tauri::Error からの変換
impl From<tauri::Error> for AppError {
    fn from(error: tauri::Error) -> Self {
        AppError::Tauri(error.to_string())
    }
}

// std::io::Error からの変換
impl From<std::io::Error> for AppError {
    fn from(error: std::io::Error) -> Self {
        AppError::Storage(error.to_string())
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
