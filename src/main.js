const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const pluginPath = LiteLoader.plugins.AutoForward.path.plugin;
const configTemplatePath = path.join(pluginPath, 'src/config/config.json');
let userConfigPath;


exports.onLogin = (uid) => {
    userConfigPath = path.join(pluginPath, `src/config/config_${uid}.json`);
    if (!fs.existsSync(userConfigPath)) {
        fs.copyFileSync(configTemplatePath, userConfigPath);
    }
}

ipcMain.on('AutoForward.log', (event, ...msg) => {
    console.log('[AutoForward LOG]', ...msg)
})

ipcMain.on('AutoForward.getConfig', (event, config) => {
    fs.writeFileSync(userConfigPath, JSON.stringify(config, null, '\t'))
})