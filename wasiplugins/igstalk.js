module.exports = {
    name: 'igstalk',
    category: 'Stalker',
    desc: 'Get information about an Instagram user.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const axios = require('axios');

        const username = wasi_args[0];
        if (!username) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide an Instagram username!\nUsage: .igstalk <username>' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Fetching Instagram info for ${username}...*` }, { quoted: wasi_msg });

            const apiUrl = `https://api.maher-zubair.tech/stalk/instagram?q=${encodeURIComponent(username)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status !== 200 || !data.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ An error occurred or user not found.' }, { quoted: wasi_msg });
            }

            const {
                photo_profile,
                username: igUsername,
                fullname,
                posts,
                followers,
                following,
                bio,
            } = data.result;

            const caption = `┏━━┓ *INSTAGRAM STALKER* ┏━━┓\n` +
                `┃ 👤 *Username:* ${igUsername}\n` +
                `┃ 📛 *Full Name:* ${fullname}\n` +
                `┃ 📝 *Bio:* ${bio || "No Bio"}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 📮 *Posts:* ${posts}\n` +
                `┃ 👥 *Followers:* ${followers}\n` +
                `┃ 🏃 *Following:* ${following}\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `> _Powered by WASI-MD-V7_`;

            await wasi_sock.sendMessage(wasi_sender, {
                image: { url: photo_profile },
                caption: caption
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('IG Stalk Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to fetch Instagram information.' }, { quoted: wasi_msg });
        }
    }
};
