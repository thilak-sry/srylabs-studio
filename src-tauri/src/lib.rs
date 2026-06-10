use std::net::TcpListener;
use std::io::{BufRead, BufReader, Write};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::fs;
use tauri::Emitter;
use tauri::Manager;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct TokenSession {
    access_token: String,
    refresh_token: String,
}

#[derive(Default)]
pub struct AuthState {
    pub is_running: Arc<AtomicBool>,
}

fn open_browser(url: &str) {
    #[cfg(target_os = "macos")]
    let _ = std::process::Command::new("open").arg(url).spawn();
    #[cfg(target_os = "windows")]
    let _ = std::process::Command::new("cmd").args(["/C", "start", "", url]).spawn();
    #[cfg(target_os = "linux")]
    let _ = std::process::Command::new("xdg-open").arg(url).spawn();
}

fn run_local_server(app: tauri::AppHandle, is_running: Arc<AtomicBool>) {
    let listener = match TcpListener::bind("127.0.0.1:53421") {
        Ok(l) => l,
        Err(_) => {
            is_running.store(false, Ordering::SeqCst);
            return;
        }
    };

    let _ = listener.set_nonblocking(true);
    let start_time = std::time::Instant::now();

    loop {
        // Timeout after 5 minutes
        if start_time.elapsed().as_secs() > 300 {
            break;
        }

        match listener.accept() {
            Ok((mut stream, _)) => {
                let _ = stream.set_read_timeout(Some(std::time::Duration::from_secs(5)));
                let mut reader = BufReader::new(&mut stream);
                let mut request_line = String::new();
                
                if reader.read_line(&mut request_line).is_ok() {
                    if let Some(path) = request_line.split_whitespace().nth(1) {
                        if path.starts_with("/callback?") {
                            let params = path.split('?').nth(1).unwrap_or("");
                            let mut auth_code = None;
                            
                            for param in params.split('&') {
                                let mut parts = param.split('=');
                                if let (Some(key), Some(val)) = (parts.next(), parts.next()) {
                                    if key == "code" {
                                        auth_code = Some(val.to_string());
                                        break;
                                    }
                                }
                            }
                            
                            if let Some(code) = auth_code {
                                let _ = app.emit("auth-code-received", code);
                                
                                let html = r#"
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <title>Authenticated - SRY Studio</title>
                                        <style>
                                            body {
                                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                                background-color: #0b1121;
                                                color: #ffffff;
                                                display: flex;
                                                flex-direction: column;
                                                align-items: center;
                                                justify-content: center;
                                                height: 100vh;
                                                margin: 0;
                                            }
                                            .card {
                                                background-color: #fdfbf2;
                                                color: #1c1b1b;
                                                padding: 40px;
                                                border-radius: 20px;
                                                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                                                text-align: center;
                                                max-width: 400px;
                                            }
                                            h1 {
                                                color: #10b981;
                                                margin-top: 0;
                                            }
                                            p {
                                                color: #464554;
                                                font-size: 16px;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="card">
                                            <h1>✓ Sign In Successful</h1>
                                            <p>You have successfully logged in to SRY Studio.</p>
                                            <p>You can close this browser tab and return to the desktop application.</p>
                                        </div>
                                    </body>
                                    </html>
                                "#;
                                
                                let response = format!(
                                    "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                                    html.len(),
                                    html
                                );
                                
                                let _ = stream.write_all(response.as_bytes());
                                let _ = stream.flush();
                                break;
                            }
                        }
                    }
                }
                
                let response = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
                let _ = stream.write_all(response.as_bytes());
            }
            Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                std::thread::sleep(std::time::Duration::from_millis(100));
            }
            Err(_) => {
                break;
            }
        }
    }

    is_running.store(false, Ordering::SeqCst);
}

#[tauri::command]
fn start_auth_server(
    app: tauri::AppHandle,
    state: tauri::State<'_, AuthState>,
) -> Result<(), String> {
    let is_running = state.is_running.clone();
    
    if is_running.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst).is_ok() {
        let app_clone = app.clone();
        std::thread::spawn(move || {
            run_local_server(app_clone, is_running);
        });
    }
    
    let url = "http://localhost:3000/SignInWebpage?redirect_uri=http://127.0.0.1:53421/callback";
    open_browser(url);
    
    Ok(())
}

#[tauri::command]
fn get_tokens(app: tauri::AppHandle) -> Result<Option<(String, String)>, String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let session_path = config_dir.join("session.json");
    
    if !session_path.exists() {
        return Ok(None);
    }
    
    let content = fs::read_to_string(session_path).map_err(|e| e.to_string())?;
    if let Ok(session) = serde_json::from_str::<TokenSession>(&content) {
        return Ok(Some((session.access_token, session.refresh_token)));
    }
    
    Ok(None)
}

#[tauri::command]
fn save_tokens(app: tauri::AppHandle, access_token: String, refresh_token: String) -> Result<(), String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    
    let session_path = config_dir.join("session.json");
    let session = TokenSession { access_token, refresh_token };
    let serialized = serde_json::to_string(&session).map_err(|e| e.to_string())?;
    
    fs::write(session_path, serialized).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn clear_tokens(app: tauri::AppHandle) -> Result<(), String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let session_path = config_dir.join("session.json");
    if session_path.exists() {
        let _ = fs::remove_file(session_path);
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AuthState::default())
    .invoke_handler(tauri::generate_handler![
      start_auth_server,
      get_tokens,
      save_tokens,
      clear_tokens
    ])
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
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
