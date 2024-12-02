export function textPreprocessingParse( textPreprocessing ) {
    if (textPreprocessing === '') return '你好，我是消息转发助手。'
    const parseList = [
        { regExp: /\{\{发送人}}/g, result: 123456 },
        { regExp: /\{\{时间}}/g, result: new Date().toLocaleString() },
        { regExp: /\{\{消息}}/g, result: '你好，我是消息转发助手。' }
    ];
    parseList.forEach(item => textPreprocessing = textPreprocessing.replace(item.regExp, item.result));
    return textPreprocessing;
}

export default function textPreprocessingPreview(view) {
    const handler = {
        set: ( target, propKey, value, receiver ) => {
            target[propKey] = value;
            switch (propKey) {
                case 'label':
                    view.querySelector('#text-preprocessing-preview').innerHTML = textPreprocessingParse(target[propKey]);
                    break;
                default:
                    break;
            }
            return true;
        }
    };
    const proxy = new Proxy({label: ''}, handler);

    view.querySelector('#global-text-preprocessing').addEventListener('input', (e) => {
        proxy.label = e.target.value;
    })
}