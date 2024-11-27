const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const pluginPath = LiteLoader.plugins.AutoForward.path.plugin;
const configTemplatePath = path.join(pluginPath, 'src/config/config.json');
let userConfigPath;
// 创建窗口时触发
exports.onBrowserWindowCreated = (window) => {
    // window 为 Electron 的 BrowserWindow 实例
    
}


// 用户登录时触发
exports.onLogin = (uid) => {
    // uid 为 账号 的 字符串 标识
    userConfigPath = path.join(pluginPath, `src/config/config_${uid}.json`);
    console.log(`[AutoForward LOG] 用户 ${uid} 登录，配置文件路径为 ${userConfigPath}`)
    if (!fs.existsSync(userConfigPath)) {
        fs.copyFileSync(configTemplatePath, userConfigPath);
        console.log(`[AutoForward LOG] 创建用户配置文件 ${userConfigPath}`)
    };
}

ipcMain.on('AutoForward.log', (event, ...msg) => {
    console.log('[AutoForward LOG]', ...msg)
})

ipcMain.on('AutoForward.getConfig', (event, config) => {
    console.log('[AutoForward LOG]', config, userConfigPath)
    fs.writeFileSync(userConfigPath, JSON.stringify(config, null, '\t'))
    // const config = JSON.parse(fs.readFileSync('config/config.json'))
    // event.sender.send('AutoForward.configResult', config)
    // console.log(config)
    // console.log('---------------')
})