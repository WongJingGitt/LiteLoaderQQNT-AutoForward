import getConfig from "./getConfig.js";
import { textPreprocessingParse } from './textPreprocessingPreview.js';

export default async function initConfig(view) {
    const config = await getConfig();

    view.querySelector(`[data-value=${config.matchMode}]`).click();
    view.querySelector('#rule').value = config.globalRule;
    view.querySelector('#global-recipient-qq').value = config.globalRecipientQQ;
    view.querySelector('#global-recipient-group').value = config.globalRecipientGroup;
    view.querySelector(`[data-value=${config.globalForward ? 'forward-on' : 'forward-off'}]`).click();
    view.querySelector('#global-text-preprocessing').value = config.globalTextPreprocessing;
    view.querySelector('#global-recipient-group-uid').value = config.globalRecipientMember.group;
    view.querySelector('#global-recipient-group-member').value = config.globalRecipientMember.member;
    view.querySelector('#text-preprocessing-preview').innerHTML = textPreprocessingParse(config.globalTextPreprocessing)

    view.querySelector('#chatglm-apikey-info').innerHTML = config.apikey === '' ? '未设置' : '已设置';
    view.querySelector('#chatglm-apikey-info').style.color = config.apikey === '' ? 'red' : 'green';
}