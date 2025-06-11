/**
 * Production build script for Journal App
 * This script creates a production-ready APK
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build process...');

// Function to execute shell commands
function runCommand(command) {
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    return false;
  }
}

// Check if cleanup has been done
if (fs.existsSync(path.join(__dirname, '__tests__'))) {
  console.log('❓ It seems cleanup has not been performed yet.');
  console.log('Running node cleanup.js first...');
  
  if (!runCommand('node cleanup.js')) {
    console.error('❌ Cleanup failed. Aborting build.');
    process.exit(1);
  }
}

// Step 1: Replace package.json with the production version
console.log('📦 Setting up production package.json...');
if (fs.existsSync(path.join(__dirname, 'package.production.json'))) {
  // Backup original package.json
  fs.copyFileSync(
    path.join(__dirname, 'package.json'),
    path.join(__dirname, 'package.json.backup')
  );
  
  // Copy production package.json
  fs.copyFileSync(
    path.join(__dirname, 'package.production.json'),
    path.join(__dirname, 'package.json')
  );
  
  console.log('✅ Production package.json is now active');
}

// Step 2: Clean the Android build
console.log('🧹 Cleaning Android build...');
if (!runCommand('cd android && gradlew clean')) {
  console.error('❌ Failed to clean Android build. Aborting.');
  process.exit(1);
}

// Step 3: Build the release APK
console.log('🔨 Building release APK...');
if (!runCommand('cd android && gradlew assembleRelease')) {
  console.error('❌ Failed to build release APK. Aborting.');
  process.exit(1);
}

// Step 4: Copy the APK to the project root for easy access
console.log('📋 Copying APK to project root...');
const apkPath = path.join(__dirname, 'android/app/build/outputs/apk/release/app-release.apk');
const destinationPath = path.join(__dirname, 'JournalApp-release.apk');

if (fs.existsSync(apkPath)) {
  fs.copyFileSync(apkPath, destinationPath);
  console.log(`✅ APK copied to: ${destinationPath}`);
} else {
  console.error(`❌ Could not find APK at: ${apkPath}`);
}

console.log('🎉 Production build completed!');
console.log('You can now install the app directly from: JournalApp-release.apk'); 