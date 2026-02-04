const { wasi_updateBotConfig } = require('../wasilib/database');

module.exports = {
    name: 'settings',
    aliases: ['settings', 'set', 'mi', 'config'],
    category: 'Settings',
    desc: 'Update bot settings from chat.\nUsage:\n.mi <url> (Set Menu Image)\n.set <key> <value>\nKeys: prefix, owner, welcome, goodbye, autoread, rank',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args, sessionId, wasi_msg, wasi_text } = context;

        // Handle .mi (Menu Image) shortcut
        // The command input might not be in context directly if not passed, but we can derive it or checking args.
        // Actually, in index.js we didn't pass command name strictly, but we can check the text or start.
        // Let's assume the alias used triggered this.
        // We need to know WHICH alias was used. 
        // In index.js `wasi_handler` call, we didn't pass the command name.
        // We can parse `wasi_text` again or just check start.

        const cleanText = wasi_text.trim();
        const isMi = cleanText.toLowerCase().startsWith('.mi') || cleanText.toLowerCase().startsWith('#mi') || cleanText.toLowerCase().startsWith('/mi');

        if (isMi) {
            let url = wasi_args[0];
            if (!url && wasi_msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                // Check if quoted is image?
                // For now, assume user provides URL as text or we need upload logic again.
                // User said ".mi url".
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a URL.\nExample: .mi https://example.com/image.jpg' });
            }
            if (!url) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a URL.\nExample: .mi https://example.com/image.jpg' });
            }

            const success = await wasi_updateBotConfig(sessionId, { menuImage: url });
            if (success) {
                try {
                    const axios = require('axios');
                    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
                    const buffer = Buffer.from(response.data);

                    return await wasi_sock.sendMessage(wasi_sender, {
                        image: buffer,
                        caption: '✅ Menu Image Updated Successfully!'
                    });
                } catch (e) {
                    console.error('Settings Image Fetch Failed:', e.message);
                    return await wasi_sock.sendMessage(wasi_sender, { text: '✅ Menu Image Updated (Preview failed).' });
                }
            } else {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Database Error.' });
            }
        }

        // Generic .set logic
        if (wasi_args.length < 2) {
            return await wasi_sock.sendMessage(wasi_sender, {
                text: '*⚙️ Settings Manager*\n\nUsage: .set <key> <value>\n\n*Keys:*\n- prefix\n- owner\n- welcome\n- goodbye\n- autoread (on/off)\n- rank (on/off)\n\nExample: .set rank on'
            });
        }

        const key = wasi_args[0].toLowerCase();
        const value = wasi_args.slice(1).join(' '); // Keep spaces for messages

        let updateObj = {};
        let responseText = '';

        switch (key) {
            case 'prefix':
                updateObj = { prefix: value };
                responseText = `Prefix changed to: ${value}`;
                break;
            case 'owner':
                updateObj = { ownerName: value };
                responseText = `Owner name changed to: ${value}`;
                break;
            case 'welcome':
                updateObj = { welcomeMessage: value };
                responseText = `Welcome message updated.`;
                break;
            case 'goodbye':
                updateObj = { goodbyeMessage: value };
                responseText = `Goodbye message updated.`;
                break;
            case 'autoread':
                const arState = value.toLowerCase() === 'on';
                updateObj = { autoRead: arState };
                responseText = `Auto Read is now ${arState ? 'ON' : 'OFF'}`;
                break;
            case 'autoview':
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Use .autostatus command for status settings.' });
            case 'rank':
            case 'levelup':
                const rankState = value.toLowerCase() === 'on';
                updateObj = { levelup: rankState };
                responseText = `Rank & Level Up system is now ${rankState ? 'ON' : 'OFF'}`;
                break;
            default:
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Unknown setting key.' });
        }

        const success = await wasi_updateBotConfig(sessionId, updateObj);
        if (success) {
            // Hot-update the live config reference!
            if (context.config) {
                Object.assign(context.config, updateObj);
            }
            await wasi_sock.sendMessage(wasi_sender, { text: `✅ ${responseText}` });
        } else {
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Database Error.' });
        }
    }
};
