module.exports = {
    name: 'igstalk',
    category: 'Stalker',
    desc: 'Get information about an Instagram user.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const axios = require('axios');
        const { wasiApi } = require('../wasilib/wasiapi');

        const username = wasi_args[0];
        if (!username) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide an Instagram username!\nUsage: .igstalk <username>' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Fetching Instagram info for ${username}...*` }, { quoted: wasi_msg });

            // PRIMARY: WASI DEV APIs
            const getInstagramData = async () => {
                // Strategy 0: WASI DEV APIs (Native Scraper)
                try {
                    const data = await wasiApi('/api/stalk/instagram', { username });
                    if (data && data.status && data.result) {
                        return { status: 200, result: data.result };
                    }
                } catch (e) { console.log('WASI API IG Stalk Failed'); }

                // Strategy 1: Siputzx API (Backup)
                try {
                    const apiUrl = `https://api.siputzx.my.id/api/s/instagram?username=${encodeURIComponent(username)}`;
                    const response = await axios.get(apiUrl);
                    if (response.data.status && response.data.data) {
                        const d = response.data.data;
                        return {
                            status: 200,
                            result: {
                                photo_profile: d.url, // Profile pic might be different field
                                username: d.username,
                                fullname: d.fullName,
                                posts: d.postsCount,
                                followers: d.followers,
                                following: d.following,
                                bio: d.biography
                            }
                        };
                    }
                } catch (e) { console.log('Siputzx IG Stalk Failed'); }

                return null;
            };

            const data = await getInstagramData();

            if (!data || data.status !== 200 || !data.result) {
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
