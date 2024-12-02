// Electron 主进程 与 渲染进程 交互的桥梁
const { contextBridge, ipcRenderer } = require("electron");


// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("AutoForward", {
    log: (...data) => ipcRenderer.send("AutoForward.log", ...data),
    setConfig: config => {
        ipcRenderer.send("AutoForward.setConfig", config);
    }
});
