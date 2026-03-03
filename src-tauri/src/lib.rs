mod commands;
mod error;
mod models;
mod settings_store;
mod token_store;
mod update_handler;
mod vrc_api;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
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
            commands::auth::login_with_token,
            commands::auth::save_token,
            commands::auth::load_token,
            commands::auth::delete_token,
            commands::groups::get_my_groups,
            commands::groups::update_group_status,
            commands::groups::get_represented_group,
            commands::groups::update_group_representation,
            commands::settings::get_settings,
            commands::settings::save_settings_cmd,
            commands::update::check_for_updates,
            commands::update::install_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
