module.exports = {
    name: 'ytv',
    aliases: ['ytmp4', 'video'],
    category: 'Download',
    desc: 'Download video from YouTube',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasi_yt_video, wasi_yt_search } = require('../wasilib/youtube');

        if (!wasi_args[0]) {
            return await sock.sendMessage(from, {
                text: "🎬 *YouTube Video Downloader*\n\nUsage: `.ytv [url or search query]`\nExample: `.ytv funny cats`\n\n💡 *Tip:* Paste a YouTube link or type what you're looking for!"
            }, { quoted: wasi_msg });
        }

        let url = wasi_args[0];
        let videoTitle = '';

        try {
            // If it's not a URL, search for it first
            if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
                await sock.sendMessage(from, { text: `🔍 *Searching:* "${wasi_args.join(' ')}"...` }, { quoted: wasi_msg });

                const searchRes = await wasi_yt_search(wasi_args.join(' '));
                if (searchRes.status && searchRes.results && searchRes.results.length > 0) {
                    url = searchRes.results[0].url;
                    videoTitle = searchRes.results[0].title;
                    await sock.sendMessage(from, {
                        text: `🎞️ *Found:* ${videoTitle}\n⏱️ *Duration:* ${searchRes.results[0].duration || 'N/A'}\n_Downloading video..._`
                    }, { quoted: wasi_msg });
                } else {
                    return await sock.sendMessage(from, { text: "❌ *No results found.*" }, { quoted: wasi_msg });
                }
            } else {
                await sock.sendMessage(from, { text: `⏳ *Processing:* Downloading video from YouTube...` }, { quoted: wasi_msg });
            }

            const data = await wasi_yt_video(url);

            if (data.status && data.result) {
                const caption = `*🎬 YOUTUBE VIDEO*\n\n` +
                    `*Title:* ${data.title || videoTitle || 'Unknown'}\n` +
                    `*Quality:* ${data.quality || '720p'}\n` +
                    `*Provider:* ${data.channel || 'WASI-DEV-APIS'}\n\n` +
                    `\`\`\`Powered by WASI-MD-V7\`\`\``;

                // Send video file with caption
                return await sock.sendMessage(from, {
                    video: { url: data.result },
                    caption: caption,
                    mimetype: 'video/mp4',
                    fileName: `${data.title || videoTitle || 'video'}.mp4`
                }, { quoted: wasi_msg });
            } else {
                return await sock.sendMessage(from, {
                    text: `❌ *Error:* ${data.message || "Failed to download. Video might be too large or restricted."}`
                }, { quoted: wasi_msg });
            }

        } catch (error) {
            console.error('YTV Command Error:', error.message);
            await sock.sendMessage(from, { text: "❌ *Server error occurred. Please try again.*" }, { quoted: wasi_msg });
        }
    }
};
