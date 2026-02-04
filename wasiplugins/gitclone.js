module.exports = {
    name: 'gitclone',
    aliases: ['gitrepo', 'repo'],
    category: 'Downloader',
    desc: 'Download entire GitHub repository as ZIP.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasiApi } = require('../wasilib/wasiapi');

        const url = wasi_args[0];
        if (!url) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a GitHub Repository URL!\nExample: .gitclone https://github.com/Itxxwasi/WASI-MD-V7' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Fetching Repository ZIP...*` }, { quoted: wasi_msg });

            const data = await wasiApi('/api/download/gitclone', { url });

            if (!data || !data.status || !data.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to fetch the repository. Ensure the link is correct.' }, { quoted: wasi_msg });
            }

            const { url: dlUrl, filename } = data.result;

            await wasi_sock.sendMessage(wasi_sender, {
                document: { url: dlUrl },
                fileName: filename || 'repo.zip',
                mimetype: 'application/zip',
                caption: `> _Powered by WASI-MD-V7_`
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('GitClone Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to download repository.' }, { quoted: wasi_msg });
        }
    }
};
