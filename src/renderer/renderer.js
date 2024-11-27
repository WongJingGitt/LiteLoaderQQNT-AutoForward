class Forward {
    constructor(config, message, sender) {
        this.config = config;
        this.originMessage = message;
        this.message = message;
        this.sender = sender;
        this.#parseMessage();
    }

    #parseMessage () {
        const prefix = this.config?.globalPrefix || '';
        const suffix = this.config?.globalSuffix || '';
        this.message = new window.euphony.PlainText(`${prefix}${this.originMessage}${suffix}`);
        window.AutoForward.log(this.message);
    }

    recipient () {
        const globalRecipientQQ = this.config.globalRecipientQQ;
        const globalRecipientGroup = this.config.globalRecipientGroup;
        const globalRecipientMember = this.config.globalRecipientMember;
        const { group, member } = globalRecipientMember;

        let globalRecipientQQList = globalRecipientQQ.split(',');
        let globalRecipientGroupList = globalRecipientGroup.split(',');
        let memberList = member.split(',');

        globalRecipientQQList = globalRecipientQQList.map(item => window.euphony.Friend.fromUin(item)).filter(item => item !== null);
        globalRecipientGroupList = globalRecipientGroupList.map(item => window.euphony.Group.make(item)).filter(item => item !== null);
        memberList = memberList.map(item => window.euphony.Group.make(group)?.getMemberFromUin(item)).filter(item => item !== null);

        return [...globalRecipientQQList, ...globalRecipientGroupList, ...memberList];
    }

    async forward () {}
}

class KeywordMatch extends Forward {
    constructor(config, message, sender) {
        super(config, message, sender);
    }
    async forward () {
        const rule = this.config.globalRule.split(',');
        if (!rule.some(item => this.originMessage.includes(item))) return;
        this.recipient().forEach(item => item?.sendMessage(this.message))
    }
}

class CharMatch extends Forward {
    constructor(config, message, sender) {
        super(config, message, sender);
    }

    async forward () {
        const rule = this.config.globalRule.split(',');
        if (!rule.includes(this.originMessage)) return;
        this.recipient().forEach(item => item?.sendMessage(this.message));
    }

}

class QQMatch extends Forward {
    constructor(config, message, sender) {
        super(config, message, sender);
    }

    async forward () {
        const rule = this.config.globalRule.split(',');
        if (!rule.includes(this.sender)) return;
        this.recipient().forEach(item => item?.sendMessage(this.message));
    }
}



class ForwardMatch {
    static matchList = {
        keyword: KeywordMatch,
        char: CharMatch,
        uin: QQMatch
    };



    static send (config, message, sender) {
        const match = ForwardMatch.matchList[config.matchMode];
        if (!match) return;
        (new match(config, message, sender))?.forward();
    }
}


const eventChannel = window.euphony.EventChannel.withTriggers();
const client = window.euphony.Client;
const pluginPath = LiteLoader.plugins.AutoForward.path.plugin;


// 获取当前登录账号的本地配置文件
const getConfig = async () => await (await fetch(`local:///${pluginPath}/src/config/config_${client.getUid()}.json`)).json()

eventChannel.subscribeEvent('receive-message', async (message, source) => {
    // 收到的消息
    const msgString = message.contentToString();
    // 消息发送者的QQ号/群号
    const sender = source.getContact().getId();

    window.AutoForward.log(msgString);
    window.AutoForward.log(sender);
    window.AutoForward.log('================');

    const config = await getConfig();

    if (!config.globalForward) return;
    ForwardMatch.send(config, msgString, sender);

});

const initConfig = async (view) => {
    const config = await getConfig();
    

    view.querySelector(`[data-value=${config.matchMode}]`).click();
    view.querySelector('#rule').value = config.globalRule;
    view.querySelector('#global-recipient-qq').value = config.globalRecipientQQ;
    view.querySelector('#global-recipient-group').value = config.globalRecipientGroup;
    view.querySelector(`[data-value=${config.globalForward ? 'forward-on' : 'forward-off'}]`).click();
    view.querySelector('#global-prefix').value = config.globalPrefix;
    view.querySelector('#global-suffix').value = config.globalSuffix;
    view.querySelector('#global-recipient-group-uid').value = config.globalRecipientMember.group;
    view.querySelector('#global-recipient-group-member').value = config.globalRecipientMember.member;

}


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


// Vue组件挂载时触发
export const onVueComponentMount = (component) => {
    // component 为 Vue Component 对象
    
}


// Vue组件卸载时触发
export const onVueComponentUnmount = (component) => {
    // component 为 Vue Component 对象
}