module.exports = {
    name: 'goodbye',
    aliases: ['gb'],
    category: 'Group',
    desc: 'Enable or disable auto goodbye usage: .goodbye on/off',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const config = require('../wasi');
        const fs = require('fs');
        const path = require('path');
        const { wasi_saveAutoReplies } = require('../wasilib/database');

        let shouldenable;
        if (wasi_args[0] === 'on') {
            shouldenable = true;
        } else if (wasi_args[0] === 'off') {
            shouldenable = false;
        } else {
            return await wasi_sock.sendMessage(wasi_sender, { text: 'Please specify on or off. usage: .goodbye on/off' });
        }

        // Update config
        config.autoGoodbye = shouldenable;

        // Save to botConfig.json
        try {
            fs.writeFileSync(path.join(__dirname, '../botConfig.json'), JSON.stringify(config, null, 2));

            // Sync with DB if needed
            const { wasi_isDbConnected, wasi_setUserAutoStatus } = require('../wasilib/database');
            // (Note: Database sync for global config isn't fully implemented in database.js, just replies. 
            // But writing to botConfig.json is enough for persistence on local/persistent storage)
        } catch (err) {
            console.error('Error saving config:', err);
        }

        await wasi_sock.sendMessage(wasi_sender, {
            text: `👋 Auto Goodbye has been turned ${shouldenable ? 'ON' : 'OFF'}`
        });
    }
};
