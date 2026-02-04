module.exports = {
    name: 'ipstalk',
    category: 'Stalker',
    desc: 'Get information about an IP address.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const axios = require('axios');

        const ipAddress = wasi_args[0];
        if (!ipAddress) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide an IP address!\nUsage: .ipstalk <ip_address>' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Fetching IP info for ${ipAddress}...*` }, { quoted: wasi_msg });

            const apiUrl = `https://api.maher-zubair.tech/stalk/ip?q=${encodeURIComponent(ipAddress)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status !== 200 || !data.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ An error occurred or invalid IP.' }, { quoted: wasi_msg });
            }

            const {
                continent,
                country,
                countryCode,
                regionName,
                city,
                zip,
                lat,
                lon,
                timezone,
                currency,
                isp,
                org,
                as,
                mobile,
                proxy,
                hosting,
                ip,
            } = data.result;

            const caption = `┏━━┓ *IP ADDRESS STALKER* ┏━━┓\n` +
                `┃ 🌐 *IP:* ${ip}\n` +
                `┃ 🗺️ *Continent:* ${continent}\n` +
                `┃ 🏳️ *Country:* ${country} (${countryCode})\n` +
                `┃ 📍 *Region:* ${regionName}\n` +
                `┃ 🏙️ *City:* ${city}\n` +
                `┃ 📮 *ZIP:* ${zip}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 📡 *ISP:* ${isp}\n` +
                `┃ 🏢 *Organization:* ${org}\n` +
                `┃ 📶 *AS:* ${as}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 🕒 *Timezone:* ${timezone}\n` +
                `┃ 💰 *Currency:* ${currency}\n` +
                `┃ 📍 *Coords:* ${lat}, ${lon}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━\n` +
                `┃ 📱 *Mobile:* ${mobile ? "✅" : "❌"}\n` +
                `┃ 🛡️ *Proxy/VPN:* ${proxy ? "✅" : "❌"}\n` +
                `┃ ☁️ *Hosting:* ${hosting ? "✅" : "❌"}\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `> _Powered by WASI-MD-V7_`;

            await wasi_sock.sendMessage(wasi_sender, { text: caption }, { quoted: wasi_msg });

        } catch (e) {
            console.error('IP Stalk Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to fetch IP information.' }, { quoted: wasi_msg });
        }
    }
};
