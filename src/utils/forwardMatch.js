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



export default class ForwardMatch {
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