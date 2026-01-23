const { wasi_spotify } = require('../wasilib/scrapers');
const { wasi_getBuffer } = require('../wasilib/fetch');

module.exports = {
    name: 'spotify',
    aliases: ['sp', 'song2'],
    category: 'Downloader',
    desc: 'Download songs from Spotify',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args } = context;
        let url = wasi_args[0];

        if (!url || !url.includes('spotify.com')) {
            return await sock.sendMessage(from, { text: '❌ Please provide a valid Spotify URL.' }, { quoted: wasi_msg });
        }

        await sock.sendMessage(from, { text: '⏳ *Downloading from Spotify...*' }, { quoted: wasi_msg });

        try {
            const result = await wasi_spotify(url);
            if (result.status && result.downloadUrl) {
                const buffer = await wasi_getBuffer(result.downloadUrl);

                await sock.sendMessage(from, {
                    audio: buffer,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    contextInfo: {
                        externalAdReply: {
                            title: result.title,
                            body: result.artist,
                            thumbnailUrl: result.thumbnail,
                            sourceUrl: url,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: wasi_msg });
            } else {
                await sock.sendMessage(from, { text: '❌ Failed to download from Spotify.' }, { quoted: wasi_msg });
            }
        } catch (err) {
            console.error('Spotify Plugin Error:', err);
            await sock.sendMessage(from, { text: '❌ An error occurred while processing your request.' }, { quoted: wasi_msg });
        }
    }
};
