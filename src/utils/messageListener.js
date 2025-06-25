import getConfig from "./getConfig.js";
import ForwardMatch from "./forwardMatch.js";

export default async function messageListener() {
    const eventChannel = window.euphony.EventChannel.withTriggers();
    eventChannel.subscribeEvent('receive-message', async (message, source) => {
        const contact = source.getContact();
        const config = await getConfig();
        if (!config.globalForward) return;
        ForwardMatch.send(config, message, contact);
    });

    eventChannel.subscribeEvent('send-message', async (message, source) => { 
        const contact = source.getContact();
        const config = await getConfig();
        if (!config.globalForward) return;
        ForwardMatch.send(config, message, contact, true);
        // window.AutoForward.log('send-message', contact.getId())
    })
}