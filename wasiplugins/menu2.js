module.exports = {
    name: 'list',
    aliases: ['commands2', 'menu2', 'allcmds'],
    category: 'General',
    desc: 'Show all available commands in a clean text list',
    wasi_handler: async (sock, from, context) => {
        const { wasi_plugins, wasi_msg } = context;
        const config = require('../wasi');

        try {
            // Group commands by category
            const categories = {};

            wasi_plugins.forEach(plugin => {
                const category = plugin.category || 'Other';
                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push(plugin);
            });

            const sortedCategories = Object.keys(categories).sort();

            let menuText = `*───『 ${config.botName || 'WASI-MD-V7'} COMMANDS 』───*\n\n`;
            menuText += `*👤 User:* ${wasi_msg.pushName || 'User'}\n`;
            menuText += `*📂 Total Commands:* ${wasi_plugins.length}\n`;
            menuText += `*📅 Date:* ${new Date().toLocaleDateString()}\n\n`;

            sortedCategories.forEach(category => {
                menuText += `*╭───『 ${category.toUpperCase()} 』────*\n`;

                categories[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(plugin => {
                    const aliases = plugin.aliases && plugin.aliases.length > 0 ? ` [${plugin.aliases.join(', ')}]` : '';
                    menuText += `*│* ๏ *${config.prefix || '.'}${plugin.name}*${aliases}\n`;
                    if (plugin.desc) {
                        menuText += `*│* _↳ ${plugin.desc}_\n`;
                    }
                    menuText += `*│*\n`;
                });

                // Remove the last empty line from the category loop if needed, but let's keep it simple
                menuText += `*╰───────────────╼*\n\n`;
            });

            menuText += `_Powered by WASI-DEV-APIS_`;

            // Text only response
            await sock.sendMessage(from, {
                text: menuText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.newsletterJid || '120363419652241844@newsletter',
                        newsletterName: config.newsletterName || 'WASI-MD-V7',
                        serverMessageId: -1
                    }
                }
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('Menu2 Error:', e);
            await sock.sendMessage(from, { text: '❌ Failed to generate command list.' }, { quoted: wasi_msg });
        }
    }
};
