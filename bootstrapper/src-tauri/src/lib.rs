use tauri::{AppHandle, Manager};
use std::process::Command;

#[tauri::command]
async fn install_app(app: AppHandle) -> Result<(), String> {
    // Embed the installer directly into the binary at compile time
    let installer_bytes = include_bytes!("../../assets/SRY Studio.exe");
    
    // Write the embedded installer to a temporary location
    let temp_dir = std::env::temp_dir();
    let installer_path = temp_dir.join("SRY_Studio_Installer_Temp.exe");
    
    std::fs::write(&installer_path, installer_bytes)
        .map_err(|e| format!("Failed to extract installer payload: {}", e))?;

    // Execute the installer silently
    let status = Command::new(&installer_path)
        .arg("/S")
        .status()
        .map_err(|e| format!("Failed to run installer: {}", e))?;

    if status.success() {
        // Clean up the temporary file
        let _ = std::fs::remove_file(installer_path);
        Ok(())
    } else {
        Err(format!("Installer exited with code: {:?}", status.code()))
    }
}

#[tauri::command]
fn launch_app() -> Result<(), String> {
    let local_app_data = std::env::var("LOCALAPPDATA")
        .map_err(|_| "Failed to get LOCALAPPDATA".to_string())?;
    
    let app_path = std::path::Path::new(&local_app_data)
        .join("SRY Studio")
        .join("app.exe");

    if !app_path.exists() {
        return Err("Application not found at installation path".into());
    }

    Command::new(&app_path)
        .spawn()
        .map_err(|e| format!("Failed to launch app: {}", e))?;

    std::process::exit(0);
}

#[tauri::command]
fn close_app() {
    std::process::exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![install_app, launch_app, close_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
