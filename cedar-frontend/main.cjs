const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let frontendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load frontend (assumes Next.js is running on localhost:3000)
  win.loadURL("http://localhost:3000"); // OR file:// if using static export

  win.on("closed", () => {
    if (frontendProcess) {
      frontendProcess.kill();
      frontendProcess = null;
    }
  });
}

app.whenReady().then(() => {
  // Start the frontend server (yarn install and yarn dev)
  frontendProcess = spawn("bash", [
    path.join(__dirname, "../cedar-frontend/start_frontend.sh"),
  ]);

  frontendProcess.stdout.on("data", (data) => {
    console.log(`[FRONTEND] ${data}`);
  });

  frontendProcess.stderr.on("data", (data) => {
    console.error(`[FRONTEND ERROR] ${data}`);
  });

  frontendProcess.on("exit", (code) => {
    console.log(`[FRONTEND] exited with code ${code}`);
  });

  // Start frontend window
  createWindow();
});

app.on("window-all-closed", () => {
  if (frontendProcess) frontendProcess.kill();
  app.quit();
});
