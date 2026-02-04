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

            // PRIMARY: WASI DEV APIs
            const fallbackFn = async () => {
                const apiUrl = `https://api.maher-zubair.tech/stalk/githubuser?q=${encodeURIComponent(username)}`;
                const response = await axios.get(apiUrl);
                if (response.data.status === 200 && response.data.result) {
                    return { status: true, result: response.data.result };
                }
                return { status: false };
            };

            const data = await wasiApi('/api/stalk/github', { username }, fallbackFn);

            if (!data || !data.status || !data.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ An error occurred or user not found.' }, { quoted: wasi_msg });
            }

            const {
                login,
                id,
                avatar_url,
                name,
                company,
                blog,
                location,
                bio,
                public_repos,
                public_gists,
                followers,
                following,
                created_at,
                updated_at,
            } = data.result;

            const caption = `┏━━┓ *GITHUB STALKER* ┏━━┓\n` +
                `┃ 👤 *Username:* ${login}\n` +
                `┃ 📛 *Name:* ${name || "N/A"}\n` +
                `┃ 🆔 *ID:* ${id}\n` +
                `┃ 📝 *Bio:* ${bio || "N/A"}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 🏢 *Company:* ${company || "N/A"}\n` +
                `┃ 🌐 *Blog:* ${blog || "N/A"}\n` +
                `┃ 📍 *Location:* ${location || "N/A"}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 📂 *Public Repos:* ${public_repos}\n` +
                `┃ 🧩 *Public Gists:* ${public_gists}\n` +
                `┃ 👥 *Followers:* ${followers}\n` +
                `┃ 🏃 *Following:* ${following}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 📅 *Created:* ${new Date(created_at).toLocaleDateString()}\n` +
                `┃ 🔄 *Updated:* ${new Date(updated_at).toLocaleDateString()}\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `> _Powered by WASI-MD-V7_`;

            await wasi_sock.sendMessage(wasi_sender, {
                image: { url: avatar_url },
                caption: caption
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('Git Stalk Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to fetch GitHub information.' }, { quoted: wasi_msg });
        }
    }
};
