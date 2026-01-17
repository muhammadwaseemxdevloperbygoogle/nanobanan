module.exports = {
    name: 'setdesc',
    aliases: ['setdescription', 'desc'],
    category: 'Group',
    desc: 'Update group description.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args, wasi_isGroup } = context;

        if (!wasi_isGroup) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ This command can only be used in groups.' });
        }

        const newDesc = wasi_args.join(' ');
        if (!newDesc) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a new description. usage: .setdesc <text>' });
        }

        try {
            await wasi_sock.groupUpdateDescription(wasi_sender, newDesc);
            await wasi_sock.sendMessage(wasi_sender, { text: '✅ Group Description Updated!' });
        } catch (e) {
            console.error(e);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to update description. Ensure the bot is Admin.' });
        }
    }
};
