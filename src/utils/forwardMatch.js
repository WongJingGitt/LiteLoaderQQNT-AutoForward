import ChatGLM from "./chatGLM.js";

class Forward {
    constructor(config, message, sender) {
        this.config = config;
        this.originMessage = message;
        this.message = message;
        this.sender = sender;
        this.#parseMessage();
    }

    #parseMessage () {

        const parseList = [
            { regExp: /\{\{发送人}}/g, result: this.sender },
            { regExp: /\{\{时间}}/g, result: new Date().toLocaleString() },
            { regExp: /\{\{消息}}/g, result: this.originMessage }
        ]


        let textPreprocessing = this.config?.globalTextPreprocessing || '';
        if (textPreprocessing === '') {
            this.message = new window.euphony.PlainText(this.originMessage);
            return;
        }
        parseList.forEach(item => textPreprocessing = textPreprocessing.replace(item.regExp, item.result));
        this.message = new window.euphony.PlainText(textPreprocessing);
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

class AIMatch extends Forward {
    constructor(config, message, sender) {
        super(config, message, sender);
    }

    async forward () {
        const rule = this.config.globalRule
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
                { role: 'user', content: JSON.stringify({ uin: this.sender, message: this.originMessage }) }
            ],
            this.config.apikey
        );

        const result = response?.choices?.at(0)?.message?.content;

        if ( result !== '1' ) return;
        this.recipient().forEach(item => item?.sendMessage(this.message));
    }
}

export default class ForwardMatch {
    static matchList = {
        keyword: KeywordMatch,
        char: CharMatch,
        uin: QQMatch,
        ai: AIMatch
    };



    static send (config, message, sender) {
        const match = ForwardMatch.matchList[config.matchMode];
        if (!match) return;
        (new match(config, message, sender))?.forward();
    }
}