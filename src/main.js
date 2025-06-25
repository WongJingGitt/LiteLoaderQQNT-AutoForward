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

    const userConfigKeys = Object.keys(userConfig?.[uid]);
    const templateKeys = Object.keys(require(configTemplatePath));
    if (userConfigKeys.length < templateKeys.length) {
        for (let key of templateKeys) {
            if (userConfigKeys.includes(key)) continue;
            userConfig[uid][key] = require(configTemplatePath)[key];
        }
        LiteLoader.api.config.set('AutoForward', userConfig);
    }
}

ipcMain.on('AutoForward.log', (event, ...msg) => {
    console.log('[AutoForward LOG]', ...msg)
})

ipcMain.on('AutoForward.setConfig', (event, config) => {
    const userConfig = LiteLoader.api.config.get('AutoForward', {});
    userConfig[userUid] = config;
    LiteLoader.api.config.set('AutoForward', userConfig);
})

ipcMain.handle('AutoForward.fetch', async (event, ...fetchArgs) => {
    try {
      const response = await fetch(...fetchArgs);
      const responseData = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
      
      return responseData; 
    } catch (error) {
      return { error: error.message };
    }
  });