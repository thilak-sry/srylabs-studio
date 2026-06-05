const fs = require('fs');
const path = require('path');

const nsisDir = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle', 'nsis');
const msiDir = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle', 'msi');
const outputDir = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle');

function renameBundle(dir, ext, targetName) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return;
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith(ext) && file !== `${targetName}${ext}`) {
      const oldPath = path.join(dir, file);
      const newPath = path.join(dir, `${targetName}${ext}`);
      
      // Also copy to outputDir for convenience
      const rootNewPath = path.join(outputDir, `${targetName}${ext}`);

      // Copy to bootstrapper assets if it's the executable installer
      let bootstrapperPath = null;
      if (ext === '.exe') {
        const assetsDir = path.join(__dirname, '..', 'bootstrapper', 'assets');
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true });
        }
        bootstrapperPath = path.join(assetsDir, `${targetName}${ext}`);
      }
      
      try {
        fs.copyFileSync(oldPath, newPath);
        fs.copyFileSync(oldPath, rootNewPath);
        if (bootstrapperPath) fs.copyFileSync(oldPath, bootstrapperPath);
        console.log(`Successfully created:`);
        console.log(`  - ${newPath}`);
        console.log(`  - ${rootNewPath}`);
        if (bootstrapperPath) console.log(`  - ${bootstrapperPath}`);
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }
  }
}

console.log('Running post-build script to rename installers...');
renameBundle(nsisDir, '.exe', 'SRY Studio');
renameBundle(msiDir, '.msi', 'SRY Studio');

// Now that the main installer is in the bootstrapper's assets, build the bootstrapper
console.log('\n--- Building the Bootstrapper ---');
const { execSync } = require('child_process');
const bootstrapperDir = path.join(__dirname, '..', 'bootstrapper');

try {
  // Build the bootstrapper using Tauri CLI
  execSync('npx tauri build', { cwd: bootstrapperDir, stdio: 'inherit' });
  
  // The bootstrapper executable is generated here:
  const rawBootstrapperExe = path.join(bootstrapperDir, 'src-tauri', 'target', 'release', 'bootstrapper.exe');
  
  if (fs.existsSync(rawBootstrapperExe)) {
    // Create the installer directory if it doesn't exist
    const installerDir = path.join(outputDir, 'installer');
    if (!fs.existsSync(installerDir)) {
      fs.mkdirSync(installerDir, { recursive: true });
    }

    // Copy the final bootstrapper exe to the installer directory, renamed!
    const finalSetupPath = path.join(installerDir, 'SRY Studio.exe');
    fs.copyFileSync(rawBootstrapperExe, finalSetupPath);
    console.log(`\n✅ Successfully generated the final custom Bootstrapper!`);
    console.log(`✅ Final File: ${finalSetupPath}`);
  } else {
    console.error('Bootstrapper executable was not found after build!');
  }
} catch (err) {
  console.error('\n❌ Failed to build the bootstrapper:', err.message);
}
