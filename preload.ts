import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  saveExcel: (data) => ipcRenderer.invoke("saveExcel", data),
});
