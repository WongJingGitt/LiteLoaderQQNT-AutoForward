import getConfig from "../utils/getConfig.js";
import messageListener from "../utils/messageListener";
import initConfig from "../utils/initConfig.js";

const pluginPath = LiteLoader.plugins.AutoForward.path.plugin;

messageListener();

export const onSettingWindowCreated = async (view) => {
    view.innerHTML = await (await fetch(`local:///${pluginPath}/src/pages/index.html`)).text();

    await initConfig(view);

    // 更新匹配模式到本地文件
    view.querySelector('#match-mode').addEventListener('selected', async (e) => {
        const config = await getConfig();
        window.AutoForward.setConfig({...config, matchMode: e.detail.value});
    });

    // 更新全局匹配规则到本地文件
    view.querySelector('#set-rule').addEventListener('click', async (e) => {
        const config = await getConfig();
        const rule = view.querySelector('#rule').value;
        window.AutoForward.setConfig({...config, globalRule: rule});
    });

    // 更新全局接收人QQ到本地文件
    view.querySelector('#set-global-recipient-qq').addEventListener('click', async (e) => {
        const config = await getConfig();
        const qq = view.querySelector('#global-recipient-qq').value;
        window.AutoForward.setConfig({...config, globalRecipientQQ: qq});
    });

    // 更新全局接收群到本地文件
    view.querySelector('#set-global-recipient-group').addEventListener('click', async (e) => {
        const config = await getConfig();
        const group = view.querySelector('#global-recipient-group').value;
        window.AutoForward.setConfig({...config, globalRecipientGroup: group});
    });



    // 更新全局转发设置到本地文件
    view.querySelector('#global-forward-select').addEventListener('selected', async (e) => {
        const config = await getConfig();
        const globalForward = e.detail.value === 'forward-on';
        window.AutoForward.setConfig({...config, globalForward});
    });

    // 更新全局前缀到本地文件
    view.querySelector('#set-global-prefix').addEventListener('click', async (e) => {
        const config = await getConfig();
        const prefix = view.querySelector('#global-prefix').value;
        window.AutoForward.setConfig({...config, globalPrefix: prefix});
    });

    // 更新全局后缀到本地文件
    view.querySelector('#set-global-suffix').addEventListener('click', async (e) => {
        const config = await getConfig();
        const suffix = view.querySelector('#global-suffix').value;
        window.AutoForward.setConfig({...config, globalSuffix: suffix});
    })

    view.querySelector('#set-global-recipient-group-member').addEventListener('click', async (e) => {
        const config = await getConfig();
        const group = view.querySelector('#global-recipient-group-uid').value;
        const member = view.querySelector('#global-recipient-group-member').value;
        window.AutoForward.setConfig({...config, globalRecipientMember: {group, member}});
    })

}
