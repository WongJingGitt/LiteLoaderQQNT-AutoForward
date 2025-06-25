import ChatGLM from "./chatGLM.js";

class Forward {
    constructor(config, message, senderContact, isSender=false) {
        this.config = config;
        this.originMessage = message;
        this.message = message;
        this.sender = senderContact.getId();
        this.senderContact = senderContact;
        this.isSender = isSender;
        this.isTextMessage = false;
    }

    async parseMessage () {

        const parseList = [
            { regExp: /\{\{发送人}}/g, result: this.sender },
            { regExp: /\{\{时间}}/g, result: new Date().toLocaleString() },
            { regExp: /\{\{消息}}/g, result: this.originMessage.contentToString() }
        ]
        let textPreprocessing = this.config?.globalTextPreprocessing || '';

        // 判断是不是纯文字消息，如果不是直接转发最初初始消息。
        const singles = await this.originMessage.toElements();
        const isText = singles.every(item => item?.elementType === 1);
        if (!isText) {
            // 如果纯文字配置了模板, 则使用固定模板转发消息
            if (textPreprocessing) {
                const textInfo = new window.euphony.PlainText(`\n消息发送人: ${this.sender}\n消息时间: ${new Date().toLocaleString()}`);
                this.message.append(textInfo);
            }
            return;
        }

        // 纯文字消息做预处理
        if (textPreprocessing === '') {
            this.message = new window.euphony.PlainText(this.originMessage.contentToString());
            return;
        }
        parseList.forEach(item => textPreprocessing = textPreprocessing.replace(item.regExp, item.result));
        this.message = new window.euphony.PlainText(textPreprocessing)
        this.isTextMessage = true;
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

    webhookRecipient() {
        const webhookRecipientQQ = this.config.webhookConfig.statusRecipients
        return webhookRecipientQQ.map(item => window.euphony.Friend.fromUin(item)).filter(item => item !== null);
    }

    async webhook (senderID, messageString) { 
        if (!this.config?.webhookConfig?.enable) return false;
        let bodyString = this.config.webhookConfig.body
        let body = {
            sender_id: senderID,
            message: messageString,
            timestamp: Date.now()
        };
        const parseList = [
            { regExp: /\{\{发送人}}/g, result: senderID },
            { regExp: /\{\{时间}}/g, result: new Date().toLocaleString() },
            { regExp: /\{\{消息}}/g, result: messageString }
        ]
        try {
            parseList.forEach(item => {
                bodyString = bodyString.replace(item.regExp, item.result)
            })
            body = JSON.parse(bodyString)
        } catch (error) { 

        }

        try {
            const response = await window.AutoForward.fetch(this.config?.webhookConfig?.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.config?.webhookConfig?.authorization
                },
                body: JSON.stringify(body)
            });
            window.AutoForward.log('[Webhook]', await response.json());
            return await response.json();
        } catch (e) {
            return false;
        }
    }

    async forward () {}
}

class KeywordMatch extends Forward {
    constructor(config, message, sender, isSender=false) {
        super(config, message, sender, isSender);
    }
    async forward () {
        await this.parseMessage();
        const rule = this.config.globalRule.split(',');
        if (!rule.some(item => this.originMessage.contentToString().includes(item)) || this.isSender) return;
        this.recipient().forEach(item => item?.sendMessage(this.message));
        if (!this.isTextMessage) return;
        const response = await this.webhook(this.sender, this.originMessage.contentToString());
        let messageText = ''
        if (!response) {
            messageText = 'webhook请求失败'
        }else {
            messageText = 'webhook请求成功'
        }
        this.webhookRecipient().forEach(item => item?.sendMessage(messageText));
    }
}

class CharMatch extends Forward {
    constructor(config, message, sender, isSender=false) {
        super(config, message, sender, isSender);
    }

    async forward () {
        await this.parseMessage();
        const rule = this.config.globalRule.split(',');
        if (!rule.includes(this.originMessage.contentToString()) || this.isSender) return;
        this.recipient().forEach(item => item?.sendMessage(this.message));
        if (!this.isTextMessage) return;
        const response = await this.webhook(this.sender, this.originMessage.contentToString());
        let messageText = ''
        if (!response) {
            messageText = 'webhook请求失败'
        }else {
            messageText = 'webhook请求成功'
        }
        this.webhookRecipient().forEach(item => item?.sendMessage(messageText));
    }

}

class QQMatch extends Forward {
    constructor(config, message, sender, isSender=false) {
        super(config, message, sender, isSender);
    }

    async forward () {
        await this.parseMessage();
        const rule = this.config.globalRule.split(',');
        if (!rule.includes(this.sender)) return;
        this.recipient().forEach(item => item?.sendMessage(this.message));
    }
}

class AIMatch extends Forward {
    constructor(config, message, sender, isSender=false) {
        super(config, message, sender, isSender);
    }

    async forward () {
        await this.parseMessage();
        const rule = this.config.globalRule;

        if (this.config.apikey === '') return;

        const prompt = `你是一个专业的内容转发判定大师，通过接收到的文案判定该内容是否应该被转发，你的能力如下：
        - 你会收到一个JSON，uin代表消息来源的QQ号或者群聊号，message代表消息内容。
        - 总结并且理解消息内容;
        - ${rule};
        - 当内容应该被转发时回复1，不应该被转发时回复0;
        - 难以分类的问题统一回复0
        - 你的回复仅限于0或1，不要回复其他任何内容。`

        const response = await ChatGLM.send(
            [
                { role: 'system', content: prompt },
                { role: 'user', content: JSON.stringify({ uin: this.sender, message: this.originMessage.contentToString() }) }
            ],
            this.config.apikey
        );

        const result = response?.choices?.at(0)?.message?.content;
        if ( result !== '1' ) return;
        this.recipient().forEach(item => item?.sendMessage(this.message));
        if (!this.isTextMessage) return;
        const webHookResponse = await this.webhook(this.sender, this.originMessage.contentToString());
        let messageText = ''
        if (!webHookResponse) {
            messageText = 'webhook请求失败'
        }else {
            messageText = 'webhook请求成功'
        }
        this.webhookRecipient().forEach(item => item?.sendMessage(messageText));
    }
}

export default class ForwardMatch {
    static matchList = {
        keyword: KeywordMatch,
        char: CharMatch,
        uin: QQMatch,
        ai: AIMatch
    };



    static send (config, message, sender, isSender=false) {
        const match = ForwardMatch.matchList[config.matchMode];
        if (!match) return;
        (new match(config, message, sender, isSender))?.forward();
    }
}