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

    contactType() {
        try{
            const peer = this.senderContact.toPeer();
            const _type = peer.chatType;
            switch (_type) {
                case 1:
                    const contactName = this.senderContact.getNick();
                    return {chatType: _type, format: "私聊", name: contactName};
                case 2:
                    const groupName = this.senderContact.getName();
                    return {chatType: _type, format: "群聊", name: groupName };
                default:
                    return {chatType: _type, format: "未知", name: "未知" };
            }
        } catch (error) {
            return {chatType: null, format: "未知", name: "未知" };
        }
    }

    async parseMessage () {
        const contactType = this.contactType();

        const parseList = [
            { regExp: /\{\{发送人}}/g, result: this.sender },
            { regExp: /\{\{时间}}/g, result: new Date().toLocaleString() },
            { regExp: /\{\{消息}}/g, result: this.originMessage.contentToString() },
            { regExp: /\{\{聊天类型}}/g, result: contactType.format },
            { regExp: /\{\{发送人昵称}}/g, result: contactType.name }
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
        const contactType = this.contactType();
        let bodyString = this.config.webhookConfig.body
        let body = {
            sender_id: senderID,
            message: messageString,
            timestamp: Date.now(),
            contact_type: contactType.format,
            sender_name: contactType.name
        };
        
        const parseList = [
            { regExp: /\{\{发送人}}/g, result: this.sender },
            { regExp: /\{\{时间}}/g, result: new Date().toLocaleString() },
            { regExp: /\{\{消息}}/g, result: this.originMessage.contentToString() },
            { regExp: /\{\{聊天类型}}/g, result: contactType.format },
            { regExp: /\{\{发送人昵称}}/g, result: contactType.name }
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
        // 跳过自己发的消息，避免无限转发
        if (this.isSender) return;
        await this.parseMessage();
        const rule = this.config.globalRule;
        const contactType = this.contactType();

        if (this.config.apikey === '') return;

        const prompt = `你是一位专业的聊天内容理解大师，你被集成在QQ客户端的一个第三方插件\`AutoForward\`中，这个插件的核心职责是：通过用户设定设置的规则转发用户收到的QQ消息。而你在其中扮演的角色是：转发判定，**结合用户设定的规则，判断收到的消息是否应该被转发**。

## 核心规则
- 深度理解用户收到的消息JSON，理解消息内容。
- 深度理解用户设定的转发规则(通常是纯文本的自然语言描述)，结合收到的消息内容JSON做出判定。
- 你回复仅限于：\`0\`、\`1\`。除此之外你绝对不应该回复其他内容，当：
    - 你认为消息应该被转发时，你应该回复：1
    - 你认为消息不应该被转发时，你应该回复：0
    - 其他难以分类/你难以抉择/用户没有提及的场景，你应该回复：0
    - 用户自己发送的消息(is_sender == true)，统一回复：0

## 消息格式解读
- 你会收到一条JSON类型的消息。
- 其中具体字段解释如下：
    - **uin**：当前收到消息发送人的ID，如果是群聊时为群聊号、如果是私聊时为QQ号。
    - **message**：当前收到的消息，具体内容。
    - **sender_name**：消息发送人的昵称，如果是群聊时为群聊名称、如果是私聊时为联系人昵称。    
    - **contact_type**：消息来源的类型，分为三种结果：群聊、私聊、未知。
    - **time**：消息发送的具体时间，例如：\`2025/6/30 12:36:48\`。
    - **is_sender**：标注当前用户是否为发送方，true为发送方，false为接收方。
- 当消息来自群聊时，发送人的最小粒度为群聊。**插件无法分辨出消息具体是来自哪一位群成员，因此规则中若是涉及到具体群成员时，应该被判断为不转发**。

## 示例
### 示例一：
- 用户设定的规则，为：
**所有来自私聊的消息，并且包含负面情绪时，应该被转发。**
- 当前收到的消息：
\`\`\`json
{ 
    uin: 123456, 
    message: "今天又要加班，我好累。", 
    sender_name: "Pony Ma", 
    contact_type: "私聊",
    time: "2023-05-01 12:00:00",
    is_sender: false
}
\`\`\`
- 你应该回复：1

### 示例二：
- 用户设定的规则，为：
**来自群聊的消息中，包含了侮辱人的敏感词时应该被转发。**
- 当前收到的消息：
\`\`\`json
{ 
    uin: 123456, 
    message: "你是不是有病啊，这都不知道", 
    sender_name: "Pony Ma", 
    contact_type: "私聊",
    time: "2023-05-01 12:00:00",
    is_sender: false
}
\`\`\`
- 你应该回复：0

### 示例三：
- 用户设定的规则，为：
**Pony Ma在“产品交流群”中发送的所有消息都应该被转发**
- 场景一：
    * 当前收到的消息：
    \`\`\`json
    { 
        uin: 123456, 
        message: "什么时候发版？", 
        sender_name: "产品交流群", 
        contact_type: "群聊",
        time: "2023-05-01 12:00:00",
        is_sender: false
    }
    \`\`\`
    - 你应该回复：0

- 场景二：
    * 当前收到的消息：
    \`\`\`json
    { 
        uin: 123456, 
        message: "这个很影响体验，今天下班前改掉。", 
        sender_name: "Pony Ma", 
        contact_type: "私聊",
        time: "2023-05-01 12:00:00",
        is_sender: false
    }
    \`\`\`
    - 你应该回复：0

## 用户设定的规则：
${rule}

## 当前收到的消息：
\`\`\`json
${JSON.stringify({ uin: this.sender, message: this.originMessage.contentToString(), sender_name: contactType.name, contact_type: contactType.format, time: new Date().toLocaleString(), is_sender: this.isSender}, null, 4)}
\`\`\`
`
        const response = await ChatGLM.send(
            [
                { role: 'user', content:  prompt}
            ],
            this.config.apikey
        );
        window.AutoForward.log(prompt)
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