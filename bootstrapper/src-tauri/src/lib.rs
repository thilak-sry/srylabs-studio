use tauri::AppHandle;

#[cfg(target_os = "windows")]
use std::process::Command;

#[cfg(target_os = "windows")]
#[tauri::command]
async fn install_app(app: AppHandle, install_path: String) -> Result<(), String> {
    // Embed the installer directly into the binary at compile time
    let installer_bytes = include_bytes!("../../assets/SRY Studio.exe");
    
    // Write the embedded installer to a temporary location
    let temp_dir = std::env::temp_dir();
    let installer_path = temp_dir.join("SRY_Studio_Installer_Temp.exe");
    
    std::fs::write(&installer_path, installer_bytes)
        .map_err(|e| format!("Failed to extract installer payload: {}", e))?;

    // Execute the installer silently with a custom destination path
    // NSIS requires /D=<path> to be the last argument and not wrapped in quotes
    let status = Command::new(&installer_path)
        .arg("/S")
        .arg(format!("/D={}", install_path))
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

#[cfg(not(target_os = "windows"))]
#[tauri::command]
async fn install_app(_app: AppHandle, _install_path: String) -> Result<(), String> {
    Err("Installation is only supported on Windows".to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn launch_app(install_path: String) -> Result<(), String> {
    let app_path = std::path::Path::new(&install_path)
        .join("SRY Studio.exe");

    let target_exe = if app_path.exists() {
        app_path
    } else {
        let fallback_path = std::path::Path::new(&install_path).join("app.exe");
        if fallback_path.exists() {
            fallback_path
        } else {
            return Err(format!("Application not found at installation path: {}", install_path));
        }
    };

    Command::new(&target_exe)
        .spawn()
        .map_err(|e| format!("Failed to launch app: {}", e))?;

    std::process::exit(0);
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
fn launch_app(_install_path: String) -> Result<(), String> {
    Err("Launching is only supported on Windows".to_string())
}


#[tauri::command]
fn close_app() {
    std::process::exit(0);
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn get_default_path() -> Result<String, String> {
    let local_app_data = std::env::var("LOCALAPPDATA")
        .map_err(|_| "Failed to get LOCALAPPDATA".to_string())?;
    let path = std::path::Path::new(&local_app_data)
        .join("Programs")
        .join("SRY Studio");
    Ok(path.to_string_lossy().into_owned())
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
fn get_default_path() -> Result<String, String> {
    Ok("C:\\Users\\Default\\AppData\\Local\\Programs\\SRY Studio".to_string())
}

#[tauri::command]
async fn select_directory() -> Result<Option<String>, String> {
    let result = rfd::FileDialog::new()
        .set_title("Select Installation Folder")
        .pick_folder();
    
    Ok(result.map(|path| path.to_string_lossy().into_owned()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            install_app,
            launch_app,
            close_app,
            get_default_path,
            select_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
