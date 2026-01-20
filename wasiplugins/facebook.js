const { wasi_facebook } = require('../wasilib/scrapers');

module.exports = {
    name: 'facebook',
    aliases: ['fb', 'fbdl'],
    category: 'Downloader',
    desc: 'Download Facebook Videos/Reels',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args } = context;
        let url = wasi_args[0];

        if (!url) return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a Facebook URL.' });

        await wasi_sock.sendMessage(wasi_sender, { text: '⏳ *Fetching Facebook media...*' });

        try {
            console.log(`[FB] Fetching: ${url}`);
            const data = await wasi_facebook(url);
            if (!data.status) {
                console.error(`[FB] Scraper failed: ${data.message}`);
                return await wasi_sock.sendMessage(wasi_sender, { text: `❌ ${data.message}` });
            }

            const videoUrl = data.hd || data.sd || data.video || data.url;
            if (!videoUrl) {
                console.error(`[FB] No media URL found in result for: ${url}`);
                return await wasi_sock.sendMessage(wasi_sender, { text: `❌ No downloadable link found in API response.` });
            }

            console.log(`[FB] Download URL found: ${videoUrl.substring(0, 50)}...`);

            await wasi_sock.sendMessage(wasi_sender, {
                video: { url: videoUrl },
                caption: `🎬 *FACEBOOK DOWNLOADER*\n\n📝 *Title:* ${data.title || 'Facebook Video'}\n✨ *Quality:* ${data.hd ? 'HD' : 'SD'}\n\n> WASI-MD-V7`
            });
        } catch (e) {
            console.error(`[FB] Error: ${e.message}`);
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` });
        }
    }
};
