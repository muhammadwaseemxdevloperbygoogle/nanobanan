module.exports = {
    name: 'gitstalk',
    category: 'Stalker',
    desc: 'Get information about a GitHub user.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const axios = require('axios');
        const { wasiApi } = require('../wasilib/wasiapi');

        const username = wasi_args[0];
        if (!username) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a GitHub username!\nUsage: .gitstalk <username>' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Fetching GitHub info for ${username}...*` }, { quoted: wasi_msg });

            // PRIMARY: WASI DEV APIs (uses GitHub API directly)
            const data = await wasiApi('/api/stalk/github', { username });

            if (!data || !data.status || !data.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ An error occurred or user not found.' }, { quoted: wasi_msg });
            }

            const r = data.result;

            // Safe date formatting
            const formatDate = (dateStr) => {
                if (!dateStr) return 'N/A';
                try {
                    return new Date(dateStr).toLocaleDateString();
                } catch {
                    return 'N/A';
                }
            };

            const caption = `┏━━┓ *GITHUB STALKER* ┏━━┓\n` +
                `┃ 👤 *Username:* ${r.login || username}\n` +
                `┃ 📛 *Name:* ${r.name || "N/A"}\n` +
                `┃ 🆔 *ID:* ${r.id || "N/A"}\n` +
                `┃ 📝 *Bio:* ${r.bio || "N/A"}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 🏢 *Company:* ${r.company || "N/A"}\n` +
                `┃ 🌐 *Blog:* ${r.blog || "N/A"}\n` +
                `┃ 📍 *Location:* ${r.location || "N/A"}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 📂 *Public Repos:* ${r.public_repos || 0}\n` +
                `┃ 🧩 *Public Gists:* ${r.public_gists || 0}\n` +
                `┃ 👥 *Followers:* ${r.followers || 0}\n` +
                `┃ 🏃 *Following:* ${r.following || 0}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 📅 *Created:* ${formatDate(r.created_at)}\n` +
                `┃ 🔄 *Updated:* ${formatDate(r.updated_at)}\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `> _Powered by WASI-MD-V7_`;

            await wasi_sock.sendMessage(wasi_sender, {
                image: { url: r.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' },
                caption: caption
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('Git Stalk Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to fetch GitHub information.' }, { quoted: wasi_msg });
        }
    }
};
