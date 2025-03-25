import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "url";
import path, { join } from "path";
import { exec } from "child_process";
import isDev from "electron-is-dev";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let flaskProcess;
let nextProcess;

function startFlaskServer() {
  console.log("Starting Flask backend...");

  const backendPath = isDev
    ? join(__dirname, "../majesty-backend")
    : join(app.getAppPath(), "majesty-backend");

  const venvCommand =
    process.platform === "win32"
      ? `cd "${backendPath}" && backend\\Scripts\\activate && flask run`
      : `cd "${backendPath}" && source backend/bin/activate && flask run`;

  try {
    flaskProcess = exec(venvCommand, { windowsHide: true, shell: true });

    flaskProcess.stdout.on("data", (data) => console.log(`[Flask]: ${data}`));
    flaskProcess.stderr.on("data", (data) =>
      console.error(`[Flask Error]: ${data}`)
    );

    flaskProcess.on("exit", (code) => {
      console.log(`Flask process exited with code ${code}`);
    });

    flaskProcess.on("error", (err) => {
      console.error("Error starting Flask server:", err);
    });
  } catch (error) {
    console.error("Failed to start Flask backend:", error);
  }
}

function startNextServer() {
  console.log("Starting Next.js server...");

  if (isDev) {
    nextProcess = exec("yarn dev", {
      cwd: join(__dirname, "../"),
      shell: true,
    });
  } else {
    nextProcess = exec("yarn start", {
      cwd: join(app.getAppPath(), "next"),
      shell: true,
    });
  }

  nextProcess.stdout.on("data", (data) => console.log(`[Next.js]: ${data}`));
  nextProcess.stderr.on("data", (data) =>
    console.error(`[Next.js Error]: ${data}`)
  );

  nextProcess.on("exit", (code) => {
    console.log(`Next.js process exited with code ${code}`);
  });

  nextProcess.on("error", (err) => {
    console.error("Error starting Next.js server:", err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, "preload.js"),
    },
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error("Failed to load:", errorCode, errorDescription);
    }
  );

  mainWindow.webContents.on("console-message", (event, level, message) => {
    console.log("Console Message:", message);
  });

  const appURL = isDev
    ? "http://localhost:3000"
    : `file://${join(app.getAppPath(), "frontend", "index.html")}`;

  console.log("🔍 Loading app from:", appURL);
  mainWindow.loadURL(appURL);

  mainWindow.webContents.once("did-finish-load", () => {
    console.log("Frontend Loaded Successfully");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    shutdownProcesses();
  });
}

function shutdownProcesses() {
  if (flaskProcess) {
    console.log("Killing Flask process...");
    flaskProcess.kill();
  }
  if (nextProcess) {
    console.log("Killing Next.js process...");
    nextProcess.kill();
  }
}

app.whenReady().then(() => {
  startFlaskServer();
  if (isDev) startNextServer();
  setTimeout(createWindow, 5000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    shutdownProcesses();
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

process.on("exit", shutdownProcesses);
