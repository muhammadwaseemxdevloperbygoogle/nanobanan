const { wasi_instagram } = require('../wasilib/scrapers');

module.exports = {
    name: 'instagram',
    aliases: ['ig', 'igdl', 'insta'],
    category: 'Downloader',
    desc: 'Download Instagram Reels, Videos, and Photos',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args } = context;

        let url = wasi_args[0];

        // Ensure URL is present
        if (!url) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide an Instagram URL.\n\nUsage: .ig https://www.instagram.com/reel/...' });
        }

        // Validate URL
        if (!url.includes('instagram.com')) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Invalid Instagram URL.' });
        }

        await wasi_sock.sendMessage(wasi_sender, { text: '⏳ *Fetching Instagram media...*' });

        try {
            const data = await wasi_instagram(url);

            if (!data.status || !data.media || data.media.length === 0) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to download media. Please try again later.' });
            }

            // Caption
            let captionPrefix = `📸 *INSTAGRAM DOWNLOADER* 📸\n\n`;
            if (data.caption) captionPrefix += `📝 *Caption:* ${data.caption}\n`;
            captionPrefix += `⚡ *Provider:* ${data.provider}\n`;
            captionPrefix += `\n> WASI-MD-V7`;

            // Send all media found (some posts have multiple images/videos)
            for (let i = 0; i < data.media.length; i++) {
                const item = data.media[i];
                const msgCaption = i === 0 ? captionPrefix : ''; // Only first item gets the caption

                if (item.type === 'video') {
                    await wasi_sock.sendMessage(wasi_sender, {
                        video: { url: item.url },
                        caption: msgCaption
                    });
                } else {
                    await wasi_sock.sendMessage(wasi_sender, {
                        image: { url: item.url },
                        caption: msgCaption
                    });
                }
            }

        } catch (e) {
            console.error('Instagram Command Error:', e);
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` });
        }
    }
};
