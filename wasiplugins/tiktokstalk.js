module.exports = {
    name: 'tiktokstalk',
    aliases: ['ttstalk', 'ttstats'],
    category: 'Stalker',
    desc: 'Get information about a TikTok user.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasiApi } = require('../wasilib/wasiapi');

        const username = wasi_args[0];
        if (!username) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a TikTok username!\nUsage: .tiktokstalk <username>' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Fetching TikTok info for ${username}...*` }, { quoted: wasi_msg });

            // PRIMARY: WASI DEV APIs
            const data = await wasiApi('/api/tiktok/stalk', { username });

            if (!data || !data.status || !data.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ An error occurred or user not found.' }, { quoted: wasi_msg });
            }

            const r = data.result;
            const user = r.user || r;
            const stats = r.stats || {};

            const caption = `┏━━┓ *TIKTOK STALKER* ┏━━┓\n` +
                `┃ 👤 *Username:* @${user.username || username}\n` +
                `┃ 📛 *Nickname:* ${user.nickname || "N/A"}\n` +
                `┃ 🆔 *User ID:* ${user.id || "N/A"}\n` +
                `┃ 📝 *Bio:* ${user.bio || "No Bio"}\n` +
                `┃ ✅ *Verified:* ${user.verified ? "Yes" : "No"}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 👥 *Followers:* ${stats.followers || 0}\n` +
                `┃ 🏃 *Following:* ${stats.following || 0}\n` +
                `┃ ❤️ *Total Likes:* ${stats.heart || 0}\n` +
                `┃ 🎬 *Total Videos:* ${stats.video || 0}\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `> _Powered by WASI-MD-V7_`;

            await wasi_sock.sendMessage(wasi_sender, {
                image: { url: user.avatar || 'https://via.placeholder.com/150?text=TikTok' },
                caption: caption
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('TikTok Stalk Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to fetch TikTok information.' }, { quoted: wasi_msg });
        }
    }
};
