const { wasi_capcut } = require('../wasilib/scrapers');

module.exports = {
    name: 'capcut',
    aliases: ['cc', 'ccdl'],
    category: 'Downloader',
    desc: 'Download CapCut Template Videos',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args } = context;
        let url = wasi_args[0];

        if (!url) return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a CapCut URL.' });

        await wasi_sock.sendMessage(wasi_sender, { text: '⏳ *Fetching CapCut media...*' });

        try {
            console.log(`[CAPCUT] Fetching: ${url}`);
            const data = await wasi_capcut(url);

            if (!data.status) {
                console.error(`[CAPCUT] Scraper failed: ${data.message}`);
                return await wasi_sock.sendMessage(wasi_sender, { text: `❌ ${data.message}` });
            }

            const videoUrl = data.video || data.url || data.downloadUrl;
            if (!videoUrl) {
                console.error(`[CAPCUT] No media URL found in result for: ${url}`);
                return await wasi_sock.sendMessage(wasi_sender, { text: `❌ No downloadable link found in API response.` });
            }

            console.log(`[CAPCUT] Download URL found: ${videoUrl.substring(0, 50)}...`);

            await wasi_sock.sendMessage(wasi_sender, {
                video: { url: videoUrl },
                caption: `🎬 *CAPCUT DOWNLOADER*\n\n📝 *Title:* ${data.title}\n\n> WASI-MD-V7`
            });
        } catch (e) {
            console.error(`[CAPCUT] Error: ${e.message}`);
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` });
        }
    }
};
