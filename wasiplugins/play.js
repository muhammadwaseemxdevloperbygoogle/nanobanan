// Play command: fetch YouTube audio and send it
// ---------------------------------------------------
// Usage: .play <search query>
// The command searches YouTube, picks the first result, downloads the audio stream,
// and sends it as an audio message to the chat where the command was issued.
// This plugin is loaded automatically by the bot's plugin loader.

module.exports = {
    name: 'play',
    aliases: [],
    category: 'Media',
    desc: 'Play audio from YouTube (search query)',
    wasi_handler: async (wasi_sock, wasi_origin, context) => {
        const { wasi_msg, wasi_args } = context;
        // Simple permission: allow everyone to use the command
        if (!wasi_args || wasi_args.length === 0) {
            return await wasi_sock.sendMessage(wasi_origin, {
                text: '❌ Usage: .play <search query>'
            }, { quoted: wasi_msg });
        }
        const query = wasi_args.join(' ');
        try {
            // Dynamically require dependencies
            const ytSearch = require('yt-search');
            const ytdl = require('@distube/ytdl-core');

            // Search YouTube for the query
            const searchResult = await ytSearch(query);
            if (!searchResult?.videos?.length) {
                throw new Error('No results found on YouTube');
            }
            const video = searchResult.videos[0];

            // Inform user it's downloading
            // await wasi_sock.sendMessage(wasi_origin, { text: `⏳ Downloading: *${video.title}*...` }, { quoted: wasi_msg });

            // Download using ytdl-core (pure JS, no Python needed)
            const stream = ytdl(video.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
            });

            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            // Send the audio
            await wasi_sock.sendMessage(wasi_origin, {
                audio: buffer,
                mimetype: 'audio/mpeg',
                ptt: false,
            }, { quoted: wasi_msg });

        } catch (err) {
            console.error('Play command error:', err);
            await wasi_sock.sendMessage(wasi_origin, {
                text: `❌ Failed to play audio: ${err.message}`
            }, { quoted: wasi_msg });
        }
    }
};
