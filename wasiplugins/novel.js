module.exports = {
    name: 'novel',
    aliases: ['book', 'kitab'],
    category: 'Search',
    desc: 'Search and download Urdu novels from KitabNagri',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args, wasi_text } = context;
        const { wasi_kitabnagri_search, wasi_kitabnagri_details } = require('../wasilib/kitabnagri');

        if (!wasi_args[0]) {
            return await sock.sendMessage(from, { text: "📖 *KitabNagri Novel Downloader*\n\nUsage: `.novel [title/author]`\nExample: `.novel pir e kamil`" }, { quoted: wasi_msg });
        }

        const query = wasi_args.join(' ');

        try {
            const data = await wasi_kitabnagri_search(query);

            if (!data.status || !data.results || data.results.length === 0) {
                return await sock.sendMessage(from, { text: "❌ *No Results Found*\n\nI couldn't find any novel matching your query. Please check the spelling and try again." }, { quoted: wasi_msg });
            }

            // Check if we have a very high confidence match (> 0.8)
            const topMatch = data.results[0];

            if (topMatch && topMatch.similarity > 0.8) {
                // Fetch details for the top match immediately for a better experience
                const details = await wasi_kitabnagri_details(topMatch.link);

                if (details.status) {
                    let caption = `*📚 NOVEL FOUND*\n\n`;
                    caption += `*Title:* ${details.title}\n`;
                    caption += `*Source:* KitabNagri\n\n`;

                    if (details.downloadLink) caption += `📥 *Download PDF:* ${details.downloadLink}\n\n`;
                    if (details.readOnlineLink) caption += `🌐 *Read Online:* ${details.readOnlineLink}\n\n`;

                    caption += `_Powered by WASI-DEV-APIS_`;

                    if (details.thumbnail && details.thumbnail.startsWith('http')) {
                        return await sock.sendMessage(from, {
                            image: { url: details.thumbnail },
                            caption: caption
                        }, { quoted: wasi_msg });
                    } else {
                        return await sock.sendMessage(from, { text: caption }, { quoted: wasi_msg });
                    }
                }
            }

            // Otherwise, show a list of matches
            let listMsg = `*🔎 SEARCH RESULTS for "${query}"*\n\n`;
            data.results.slice(0, 7).forEach((item, i) => {
                listMsg += `*${i + 1}.* ${item.title}\n`;
            });

            listMsg += `\n💡 _Be more specific or search by author name for direct download links._`;

            await sock.sendMessage(from, { text: listMsg }, { quoted: wasi_msg });

        } catch (error) {
            console.error('Novel Command Error:', error.message);
            await sock.sendMessage(from, { text: "❌ *Error*\nAn error occurred while searching for the novel. Please try again later." }, { quoted: wasi_msg });
        }
    }
};
