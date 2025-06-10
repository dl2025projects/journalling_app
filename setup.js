/**
 * Setup script for Journal App
 * 
 * This script:
 * 1. Installs required dependencies
 * 2. Sets up server dependencies
 * 3. Configures environment variables
 * 4. Runs server and mobile app
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const readline = require('readline');
const os = require('os');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helpers
const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

const runCommand = (command, args, cwd = process.cwd()) => {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
};

// Get local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

// Setup steps
async function installDependencies() {
  console.log('📦 Installing app dependencies...');
  
  try {
    await runCommand('npm', ['install']);
    console.log('✅ App dependencies installed successfully');
    
    // Check if AsyncStorage is installed
    try {
      require.resolve('@react-native-async-storage/async-storage');
      console.log('✅ AsyncStorage already installed');
    } catch (e) {
      console.log('📦 Installing AsyncStorage...');
      await runCommand('npm', ['install', '@react-native-async-storage/async-storage']);
      console.log('✅ AsyncStorage installed successfully');
    }
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    throw error;
  }
}

async function setupServer() {
  console.log('📦 Setting up server...');
  
  try {
    // Run server setup script
    await runCommand('node', ['setup.js'], path.join(process.cwd(), 'server'));
    console.log('✅ Server setup completed');
  } catch (error) {
    console.error('❌ Failed to setup server:', error.message);
    throw error;
  }
}

async function updateApiConfig() {
  const apiPath = path.join(process.cwd(), 'src', 'services', 'api.js');
  
  if (!fs.existsSync(apiPath)) {
    console.warn('⚠️ API configuration file not found. Skipping configuration.');
    return;
  }
  
  try {
    console.log('🔹 Updating API configuration...');
    
    // Get IP address
    const ipAddress = getLocalIpAddress();
    console.log(`🔹 Detected local IP address: ${ipAddress}`);
    
    // Read API file
    let apiContent = fs.readFileSync(apiPath, 'utf8');
    
    // Update BASE_URL
    apiContent = apiContent.replace(
      /const BASE_URL = ['"]http:\/\/[^:'"]+:3000\/api['"]/,
      `const BASE_URL = 'http://${ipAddress}:3000/api'`
    );
    
    // Write back to file
    fs.writeFileSync(apiPath, apiContent);
    
    console.log('✅ API configuration updated');
  } catch (error) {
    console.error('❌ Failed to update API configuration:', error.message);
  }
}

// Main setup function
async function setup() {
  console.log('🚀 Setting up Journal App...');
  
  try {
    await installDependencies();
    
    const setupServerNow = await askQuestion('Setup server now? (y/n): ');
    if (setupServerNow.toLowerCase() === 'y') {
      await setupServer();
    }
    
    await updateApiConfig();
    
    console.log('\n✅ Setup complete!');
    console.log('\nTo start the server:');
    console.log('  cd server && npm run dev');
    console.log('\nTo start the app:');
    console.log('  npx react-native run-android');
    console.log('  or');
    console.log('  npx react-native run-ios\n');
    
    const startNow = await askQuestion('Start server and app now? (y/n): ');
    if (startNow.toLowerCase() === 'y') {
      console.log('🚀 Starting server...');
      
      // Start server in background
      const serverProc = spawn('npm', ['run', 'dev'], {
        cwd: path.join(process.cwd(), 'server'),
        stdio: 'inherit',
        shell: process.platform === 'win32',
        detached: true
      });
      
      // Wait a bit for server to start
      console.log('⏳ Waiting for server to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Start the app
      console.log('🚀 Starting app...');
      await runCommand('npx', ['react-native', 'run-android']);
    }
  } catch (error) {
    console.error('\n❌ Setup failed!');
  } finally {
    rl.close();
  }
}

// Run setup
setup(); 