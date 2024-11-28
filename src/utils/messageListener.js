import getConfig from "./getConfig.js";
import ForwardMatch from "./forwardMatch.js";

export default async function messageListener() {
    const eventChannel = window.euphony.EventChannel.withTriggers();
    eventChannel.subscribeEvent('receive-message', async (message, source) => {

        const msgString = message.contentToString();        // 收到的消息
        const sender = source.getContact().getId();     // 消息发送者的QQ号/群号

        const config = await getConfig();

        if (!config.globalForward) return;
        ForwardMatch.send(config, msgString, sender);
    });
}