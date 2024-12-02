export default async function getConfig() {
    const config = await (await fetch(`local:///${LiteLoader.path.data}/AutoForward/config.json`)).json();
    const client = window.euphony.Client;
    return config[client.getUid()]
}