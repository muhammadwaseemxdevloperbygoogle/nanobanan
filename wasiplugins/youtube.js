const ytDlp = require('yt-dlp-exec');
const ytSearch = require('yt-search');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Load FFMPEG path for conversions
let ffmpegPath = '';
try {
    ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
} catch (e) {
    console.error('[YT-DLP] FFMPEG not found via installer. Searching system path...');
}

module.exports = {
    name: 'youtube',
    aliases: ['yt', 'video', 'ytv', 'yta', 'play', 'song'],
    category: 'Downloader',
    desc: 'Download YouTube Videos or Audio using yt-dlp',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args, wasi_text, sessionId } = context;
        const prefix = context.config?.prefix || '.';
        const cmd = wasi_text.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();

        let query = wasi_args.join(' ');
        if (!query) return await wasi_sock.sendMessage(wasi_sender, { text: `❌ Please provide a YouTube URL or search query.\n\nUsage:\n- ${prefix}ytv <url/search>\n- ${prefix}yta <url/search>` });

        await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Fetching from YouTube...*` }, { quoted: wasi_msg });

        try {
            let url = query;
            if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
                const search = await ytSearch(query);
                if (!search.videos.length) return await wasi_sock.sendMessage(wasi_sender, { text: '❌ No results found.' });
                url = search.videos[0].url;
            }

            const isAudio = ['yta', 'play', 'song'].includes(cmd);
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempFile = path.join(tempDir, `ytdl_${sessionId}_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

            const options = {
                output: tempFile,
                noCheckCertificates: true,
                noWarnings: true,
                addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
                ffmpegLocation: ffmpegPath || undefined
            };

            if (isAudio) {
                options.extractAudio = true;
                options.audioFormat = 'mp3';
                options.format = 'bestaudio';
            } else {
                // Simplified format to avoid merging issues if possible
                options.format = 'best[ext=mp4]/best';
                options.mergeOutputFormat = 'mp4';
            }

            console.log(`[YT-DLP] Session ${sessionId} Downloading: ${url} as ${isAudio ? 'audio' : 'video'}`);

            try {
                await ytDlp(url, options);
            } catch (dlError) {
                console.error(`[YT-DLP] Download Process Error:`, dlError);
                throw new Error(`Download failed: ${dlError.message || 'Check logs'}`);
            }

            if (fs.existsSync(tempFile)) {
                const stats = fs.statSync(tempFile);
                const fileSizeInMB = stats.size / (1024 * 1024);

                if (fileSizeInMB > 100) {
                    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                    return await wasi_sock.sendMessage(wasi_sender, { text: '❌ The file is too large to send (>100MB).' });
                }

                if (isAudio) {
                    await wasi_sock.sendMessage(wasi_sender, {
                        audio: fs.readFileSync(tempFile),
                        mimetype: 'audio/mpeg',
                        ptt: false
                    }, { quoted: wasi_msg });
                } else {
                    await wasi_sock.sendMessage(wasi_sender, {
                        video: fs.readFileSync(tempFile),
                        caption: `🎥 *YOUTUBE DOWNLOADER*\n\n> WASI-MD-V7`
                    }, { quoted: wasi_msg });
                }

                // Cleanup
                if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
            } else {
                throw new Error('yt-dlp exited but output file was not created.');
            }

        } catch (e) {
            console.error(`[YT-DLP] Final Error:`, e);
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message || 'Failed to process YouTube request.'}` });
        }
    }
};
