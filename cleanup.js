/**
 * Cleanup script for Journal App
 * This script removes unnecessary files and directories to optimize the app size
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to delete
const dirsToDelete = [
  // Development/test directories
  '__tests__',
  '.bundle',
  'server', // Local server - not needed since we're using the deployed version
  
  // Cache and build directories
  'android/app/build/intermediates',
  'android/app/build/tmp',
  'android/build/intermediates',
  'android/build/tmp',
  
  // iOS related directories (if not using iOS)
  'ios',
  
  // Editor specific directories
  '.idea',
];

// Files to delete
const filesToDelete = [
  // Development config files
  '.eslintrc.js',
  '.prettierrc.js',
  'jest.config.js',
  'tsconfig.json',
  '.watchmanconfig',
  'setup.js',
  'app_setup.js',
  
  // Test related files
  'Gemfile',
];

console.log('🧹 Starting cleanup process...');

// Delete directories
dirsToDelete.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Removing directory: ${dir}`);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed ${dir}`);
    } catch (error) {
      console.error(`❌ Error removing ${dir}: ${error.message}`);
    }
  }
});

// Delete files
filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`Removing file: ${file}`);
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed ${file}`);
    } catch (error) {
      console.error(`❌ Error removing ${file}: ${error.message}`);
    }
  }
});

// Clean up the package.json by removing dev dependencies
console.log('Optimizing package.json...');
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = require(packageJsonPath);
  
  // Keep only essential scripts
  packageJson.scripts = {
    android: "react-native run-android",
    start: "react-native start",
  };
  
  // Remove all devDependencies
  delete packageJson.devDependencies;
  
  // Remove test-related dependencies
  delete packageJson.dependencies['jest'];
  
  // Write back the optimized package.json
  fs.writeFileSync(
    packageJsonPath, 
    JSON.stringify(packageJson, null, 2)
  );
  console.log('✅ Optimized package.json');
} catch (error) {
  console.error(`❌ Error optimizing package.json: ${error.message}`);
}

// Clean npm cache
console.log('Cleaning npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cleaned npm cache');
} catch (error) {
  console.error(`❌ Error cleaning npm cache: ${error.message}`);
}

console.log('🎉 Cleanup completed! The app is now optimized for production use.');
console.log('You can now run the app with: npx react-native run-android'); 