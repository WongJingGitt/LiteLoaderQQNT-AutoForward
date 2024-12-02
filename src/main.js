const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const pluginPath = LiteLoader.plugins.AutoForward.path.plugin;
const configTemplatePath = path.join(pluginPath, 'src/config/config.json');
let userConfigPath;
let userUid;

exports.onLogin = (uid) => {
    userUid = uid;
    const userConfig = LiteLoader.api.config.get('AutoForward', {});
    if (!userConfig?.[uid]) {
        userConfig[uid] = require(configTemplatePath);
        LiteLoader.api.config.set('AutoForward', userConfig);
    }
    // userConfigPath = path.join(pluginPath, `src/config/config_${uid}.json`);
    // if (!fs.existsSync(userConfigPath)) {
    //     fs.copyFileSync(configTemplatePath, userConfigPath);
    // }
}

ipcMain.on('AutoForward.log', (event, ...msg) => {
    console.log('[AutoForward LOG]', ...msg)
})

ipcMain.on('AutoForward.setConfig', (event, config) => {
    // fs.writeFileSync(userConfigPath, JSON.stringify(config, null, '\t'))
    const userConfig = LiteLoader.api.config.get('AutoForward', {});
    userConfig[userUid] = config;
    LiteLoader.api.config.set('AutoForward', userConfig);
})