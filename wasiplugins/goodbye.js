const { wasi_updateBotConfig } = require('../wasilib/database');

module.exports = {
    name: 'goodbye',
    aliases: ['gb'],
    category: 'Group',
    desc: 'Enable/Disable or set custom Goodbye message.\nUsage:\n.gb on/off\n.gb <message>',
    wasi_handler: async (sock, from, context) => {
        const { wasi_args, sessionId, config, wasi_msg } = context;

        if (wasi_args.length === 0) {
            return await sock.sendMessage(from, {
                text: `👋 *Goodbye Manager*\n\n*Status:* ${config.autoGoodbye ? 'Enabled ✅' : 'Disabled ❌'}\n*Current Message:* ${config.goodbyeMessage}\n\n*Usage:*\n- .gb on\n- .gb off\n- .gb <your message>\n\n*Tags:* @user, @group`
            }, { quoted: wasi_msg });
        }

        const input = wasi_args[0].toLowerCase();
        let updateObj = {};
        let responseText = '';

        if (input === 'on') {
            updateObj = { autoGoodbye: true };
            responseText = '✅ Auto Goodbye enabled.';
        } else if (input === 'off') {
            updateObj = { autoGoodbye: false };
            responseText = '❌ Auto Goodbye disabled.';
        } else {
            // Treat as custom message
            const customMsg = wasi_args.join(' ');
            updateObj = { goodbyeMessage: customMsg, autoGoodbye: true };
            responseText = `✅ Goodbye message updated and enabled:\n\n"${customMsg}"`;
        }

        const success = await wasi_updateBotConfig(sessionId, updateObj);
        if (success) {
            Object.assign(config, updateObj);
            await sock.sendMessage(from, { text: responseText }, { quoted: wasi_msg });
        } else {
            await sock.sendMessage(from, { text: '❌ Database Error.' }, { quoted: wasi_msg });
        }
    }
};
