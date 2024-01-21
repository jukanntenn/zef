import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import * as XLSX from "xlsx";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

/**
 * Given an array of arrays, returns a single
 * dimentional array with all items in it.
 */
const flat = (lists) => {
  return lists.reduce((acc, list) => {
    acc.push(...list);
    return acc;
  }, []);
};

const generateFilename = (fileCount) => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;

  return `合并文件_${fileCount}_${timestamp}.xlsx`;
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    // Open the DevTools.
    win.webContents.openDevTools();
  } else {
    win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
};

app.whenReady().then(() => {
  ipcMain.handle("saveExcel", (event, data) => {
    try {
      const ws = XLSX.utils.json_to_sheet(flat(data));
      let wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      const desktopPath = app.getPath("desktop");
      const filename = generateFilename(data.length);
      const dest = `${desktopPath}/${filename}`;
      XLSX.writeFile(wb, dest);
      return { code: 0, msg: dest };
    } catch (err) {
      return { code: -1, msg: err };
    }
  });
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
