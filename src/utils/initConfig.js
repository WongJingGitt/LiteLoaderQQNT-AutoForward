import getConfig from "./getConfig.js";

export default async function initConfig(view) {
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