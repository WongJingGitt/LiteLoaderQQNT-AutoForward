export default class ChatGLM {
    static URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

    static async send(messages, apikey, model='glm-4-flash', temperature=0.75, top_p=0.95, max_tokens=2048, stream=false) {
        const response = await fetch( ChatGLM.URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: temperature,
                top_p: top_p,
                max_tokens: max_tokens,
                stream: stream
            })
        } )
        return response.json();
    }
}