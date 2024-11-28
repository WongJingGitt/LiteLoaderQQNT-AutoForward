export default async function getConfig() {
    const pluginPath = LiteLoader.plugins.AutoForward.path.plugin;
    const client = window.euphony.Client;
    return await (await fetch(`local:///${pluginPath}/src/config/config_${client.getUid()}.json`)).json();
}