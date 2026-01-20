const { wasi_youtube } = require('../wasilib/scrapers');

module.exports = {
    name: 'youtube',
    aliases: ['yt', 'video', 'ytv'],
    category: 'Downloader',
    desc: 'Download YouTube Videos',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args } = context;
        let url = wasi_args[0];

        if (!url) return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a YouTube URL.' });

        await wasi_sock.sendMessage(wasi_sender, { text: '⏳ *Fetching YouTube video...*' });

        try {
            console.log(`[YT] Fetching: ${url}`);
            const data = await wasi_youtube(url);
            if (!data.status) {
                console.error(`[YT] Scraper failed: ${data.message}`);
                return await wasi_sock.sendMessage(wasi_sender, { text: `❌ ${data.message}` });
            }

            const dlUrl = data.downloadUrl || data.url || data.video;
            if (!dlUrl) {
                console.error(`[YT] No media URL found in result for: ${url}`);
                return await wasi_sock.sendMessage(wasi_sender, { text: `❌ No downloadable link found in API response.` });
            }

            console.log(`[YT] Download URL found: ${dlUrl.substring(0, 50)}...`);

            await wasi_sock.sendMessage(wasi_sender, {
                video: { url: dlUrl },
                caption: `🎥 *YOUTUBE DOWNLOADER*\n\n📝 *Title:* ${data.title}\n⚡ *Provider:* ${data.provider}\n\n> WASI-MD-V7`
            });
        } catch (e) {
            console.error(`[YT] Error: ${e.message}`);
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` });
        }
    }
};
