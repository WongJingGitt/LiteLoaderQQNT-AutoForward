import getConfig from "../utils/getConfig.js";
import messageListener from "../utils/messageListener.js";
import initConfig from "../utils/initConfig.js";
import textPreprocessingPreview from "../utils/textPreprocessingPreview.js";

const pluginPath = LiteLoader.plugins.AutoForward.path.plugin;

messageListener();

export const onSettingWindowCreated = async (view) => {
    view.innerHTML = await (await fetch(`local:///${pluginPath}/src/pages/index.html`)).text();

    await initConfig(view);
    textPreprocessingPreview(view);

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

    // 更新全局预处理到本地文件
    view.querySelector('#set-global-text-preprocessing').addEventListener('click', async (e) => {
        const config = await getConfig();
        const textPreprocessing = view.querySelector('#global-text-preprocessing').value;
        window.AutoForward.setConfig({...config, globalTextPreprocessing: textPreprocessing});
    });


    view.querySelector('#set-global-recipient-group-member').addEventListener('click', async (e) => {
        const config = await getConfig();
        const group = view.querySelector('#global-recipient-group-uid').value;
        const member = view.querySelector('#global-recipient-group-member').value;
        window.AutoForward.setConfig({...config, globalRecipientMember: {group, member}});
    })

    view.querySelector('#set-chatglm-apikey').addEventListener('click', async (e) => {
        const config = await getConfig();
        const chatglm = view.querySelector('#chatglm-apikey').value;

        if (chatglm === '') {
            view.querySelector('#chatglm-apikey-info').style.color = 'red';
            view.querySelector('#chatglm-apikey-info').innerText = '未设置';
        }else {
            view.querySelector('#chatglm-apikey-info').style.color = 'green';
            view.querySelector('#chatglm-apikey-info').innerText = '已设置';
        }

        window.AutoForward.setConfig({...config, apikey: chatglm});
    })

}
