use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, State,
};

// Save data types matching TypeScript
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveDataStats {
    pub total_clicks: u32,
    pub total_feedings: u32,
    pub peak_snacks: u32,
    pub session_playtime: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveData {
    pub version: u8,
    pub snacks: u32,
    pub stats: SaveDataStats,
}

impl Default for SaveData {
    fn default() -> Self {
        Self {
            version: 1,
            snacks: 0,
            stats: SaveDataStats {
                total_clicks: 0,
                total_feedings: 0,
                peak_snacks: 0,
                session_playtime: 0,
            },
        }
    }
}

// App state
pub struct SnackState {
    pub data: Mutex<SaveData>,
}

impl Default for SnackState {
    fn default() -> Self {
        Self {
            data: Mutex::new(SaveData::default()),
        }
    }
}

fn get_save_path(app: &AppHandle) -> PathBuf {
    let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");
    fs::create_dir_all(&app_data_dir).ok();
    app_data_dir.join("save.json")
}

fn save_to_file(app: &AppHandle, data: &SaveData) {
    let path = get_save_path(app);
    if let Ok(json) = serde_json::to_string_pretty(data) {
        fs::write(path, json).ok();
    }
}

#[tauri::command]
fn load_save(app: AppHandle, state: State<SnackState>) -> Option<SaveData> {
    let path = get_save_path(&app);
    
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(data) = serde_json::from_str::<SaveData>(&content) {
                let mut state_data = state.data.lock().unwrap();
                *state_data = data.clone();
                return Some(data);
            }
        }
    }
    
    // Return default if no save exists
    let default_data = SaveData::default();
    let mut state_data = state.data.lock().unwrap();
    *state_data = default_data.clone();
    Some(default_data)
}

#[tauri::command]
fn snack_add(app: AppHandle, state: State<SnackState>, amount: Option<u32>) {
    let amount = amount.unwrap_or(1);
    
    let new_snacks = {
        let mut data = state.data.lock().unwrap();
        data.snacks += amount;
        data.stats.total_clicks += 1;
        if data.snacks > data.stats.peak_snacks {
            data.stats.peak_snacks = data.snacks;
        }
        save_to_file(&app, &data);
        data.snacks
    };
    
    // Emit update event to frontend
    app.emit("snack_update", new_snacks).ok();
}

#[tauri::command]
fn snack_spend(app: AppHandle, state: State<SnackState>, amount: Option<u32>) -> bool {
    let amount = amount.unwrap_or(1);
    
    let (success, new_snacks) = {
        let mut data = state.data.lock().unwrap();
        if data.snacks >= amount {
            data.snacks -= amount;
            data.stats.total_feedings += 1;
            save_to_file(&app, &data);
            (true, data.snacks)
        } else {
            (false, data.snacks)
        }
    };
    
    if success {
        app.emit("snack_update", new_snacks).ok();
    }
    
    success
}

fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let stats_item = MenuItem::with_id(app, "stats", "Stats", true, None::<&str>)?;
    
    let menu = Menu::with_items(app, &[&stats_item, &quit_item])?;
    
    let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Maenggu Run")
        .icon(app.default_window_icon().unwrap().clone())
        .on_menu_event(move |app, event| {
            match event.id.as_ref() {
                "quit" => {
                    app.exit(0);
                }
                "stats" => {
                    let state: State<SnackState> = app.state();
                    let data = state.data.lock().unwrap();
                    
                    // Show stats in a dialog
                    let message = format!(
                        "Snacks: {}\n\nTotal Clicks: {}\nTotal Feedings: {}\nPeak Snacks: {}",
                        data.snacks,
                        data.stats.total_clicks,
                        data.stats.total_feedings,
                        data.stats.peak_snacks
                    );
                    
                    // Use native dialog
                    rfd::MessageDialog::new()
                        .set_title("Maenggu Stats")
                        .set_description(&message)
                        .set_level(rfd::MessageLevel::Info)
                        .show();
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|_tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                // Left click - could show/hide window or do nothing
            }
        })
        .build(app)?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SnackState::default())
        .invoke_handler(tauri::generate_handler![load_save, snack_add, snack_spend])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            
            // Setup system tray
            setup_tray(app.handle())?;
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
